import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import MercadoPagoConfig, { Payment } from "mercadopago";

export async function POST(request: Request) {
    try {
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        if (!accessToken) {
            console.error("❌ Falta MERCADOPAGO_ACCESS_TOKEN en .env");
            return NextResponse.json({ error: "MP no configurado" }, { status: 500 });
        }

        const body = await request.json();
        console.log("📩 WEBHOOK RECIBIDO:", body);

        // 1) Verificar que sea evento de pago
        const isPayment =
            body.type === "payment" ||
            (body.action && body.action.startsWith("payment."));

        if (!isPayment || !body.data?.id) {
            return NextResponse.json({ ok: true });
        }

        const paymentId = body.data.id.toString();

        // 2) Obtener pago desde MP
        const client = new MercadoPagoConfig({ accessToken });
        const paymentApi = new Payment(client);

        let mpPayment;
        try {
            mpPayment = await paymentApi.get({ id: paymentId });
        } catch (err: any) {
            if (err.status === 404) {
                console.warn("⚠ Pago aún no disponible (404). Webhook temprano ignorado.");
                return NextResponse.json({ ok: true });
            }

            console.error("❌ Error consultando pago en MP:", err);
            return NextResponse.json({ error: "MP error" }, { status: 500 });
        }

        console.log("🔎 PAYMENT COMPLETO:", mpPayment);

        // 3) Ignorar webhooks incompletos sin external_reference
        if (!mpPayment.external_reference) {
            console.warn("⚠ Webhook sin external_reference. Ignorando...");
            return NextResponse.json({ ok: true });
        }

        // 4) Solo procesar pagos aprobados
        if (mpPayment.status !== "approved") {
            console.log(`⚠ Pago con estado '${mpPayment.status}'. No se procesa.`);
            return NextResponse.json({ ok: true });
        }

        const orderId = mpPayment.external_reference;
        const supabase = await createClient();

        // 5) Buscar orden
        const { data: existingOrder } = await supabase
            .from("orders")
            .select("id, status")
            .eq("id", orderId)
            .single();

        if (!existingOrder) {
            console.error("❌ Orden no encontrada:", orderId);
            return NextResponse.json({ ok: true });
        }

        const alreadyPaid = existingOrder.status === "paid";

        // 6) Actualizar orden como pagada
        const paymentRaw = JSON.parse(JSON.stringify(mpPayment));

        await supabase
            .from("orders")
            .update({
                mp_payment_id: mpPayment.id?.toString(),
                mp_preference_id: mpPayment?.order?.id ?? null,
                payment_status: mpPayment.status,
                payment_status_detail: mpPayment.status_detail,
                payment_raw: paymentRaw,
                status: "paid",
            })
            .eq("id", orderId);

        console.log("🟢 ORDEN ACTUALIZADA COMO PAID:", orderId);

        // 7) Descontar stock (solo si recién pasó de pending → paid)
        if (!alreadyPaid) {
            console.log("🟢 Descontando stock...");

            const { data: orderItems } = await supabase
                .from("order_items")
                .select("product_id, quantity, size, color")
                .eq("order_id", orderId);

            for (const item of orderItems ?? []) {

                const { data: product } = await supabase
                    .from("products")
                    .select("id, stock, variants")
                    .eq("id", item.product_id)
                    .single();

                if (!product) continue;

                const variants = product.variants ?? [];
                const idx = variants.findIndex(
                    (v: any) =>
                        v.color?.toLowerCase() === item.color?.toLowerCase() &&
                        v.size === item.size
                );

                if (idx === -1) continue;

                // Descuento variante
                variants[idx].stock = Math.max(
                    variants[idx].stock - item.quantity,
                    0
                );

                // Descuento stock total
                const newTotalStock = Math.max(
                    (product.stock ?? 0) - item.quantity,
                    0
                );

                await supabase
                    .from("products")
                    .update({ variants, stock: newTotalStock })
                    .eq("id", product.id);
            }

            console.log("🟢 Stock descontado correctamente.");
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json({ error: "webhook error" }, { status: 500 });
    }
}
