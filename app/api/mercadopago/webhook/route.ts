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

        // ============================
        // 1) Filtrar eventos irrelevantes
        // ============================
        const isPayment =
            body.type === "payment" ||
            (body.action && body.action.startsWith("payment."));

        if (!isPayment || !body.data?.id) {
            // Ignorar merchant_orders, claims, etc
            return NextResponse.json({ ok: true });
        }

        const paymentId = body.data.id.toString();

        // ============================
        // 2) Consultar pago en MP (manejo de 404)
        // ============================
        const client = new MercadoPagoConfig({ accessToken });
        const paymentApi = new Payment(client);

        let mpPayment;
        try {
            mpPayment = await paymentApi.get({ id: paymentId });
        } catch (err: any) {

            // ⚠ Pago aún no está disponible → ignorar (sandbox hace esto MUCHO)
            if (err.status === 404) {
                console.warn("⚠ Pago aún no procesado (404). Ignorando webhook temprano...");
                return NextResponse.json({ ok: true });
            }

            // Otros errores sí cuentan
            console.error("❌ Error consultando pago en MP:", err);
            return NextResponse.json({ error: "MP error" }, { status: 500 });
        }

        // ============================
        // 3) Verificar external_reference (orderId)
        // ============================
        const orderId = mpPayment.external_reference;
        if (!orderId) {
            console.error("⚠ Pago sin external_reference → no se puede enlazar orden");
            return NextResponse.json({ ok: true });
        }

        const supabase = await createClient();

        // ============================
        // 4) Buscar orden en Supabase
        // ============================
        const { data: existingOrder } = await supabase
            .from("orders")
            .select("id, status")
            .eq("id", orderId)
            .single();

        if (!existingOrder) {
            console.error("⚠ Orden no encontrada:", orderId);
            return NextResponse.json({ ok: true });
        }

        const wasPaid = existingOrder.status === "paid";

        // ============================
        // 5) Mapear estado MP → interno
        // ============================
        let newStatus: string;

        switch (mpPayment.status) {
            case "approved":
                newStatus = "paid";
                break;
            case "rejected":
            case "cancelled":
            case "refunded":
            case "charged_back":
            case "in_mediation":
                newStatus = "cancelled";
                break;
            default:
                newStatus = "pending";
        }

        const paymentRaw = JSON.parse(JSON.stringify(mpPayment));

        // ============================
        // 6) Actualizar orden
        // ============================
        await supabase
            .from("orders")
            .update({
                mp_payment_id: mpPayment.id?.toString(),
                payment_status: mpPayment.status,
                payment_status_detail: mpPayment.status_detail,
                payment_raw: paymentRaw,
                status: newStatus,
            })
            .eq("id", orderId);

        // ============================
        // 7) Descontar stock SOLO si recién se aprobó
        // ============================
        if (!wasPaid && newStatus === "paid") {
            console.log("🟢 Descontando stock para orden:", orderId);

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

                variants[idx].stock = Math.max(
                    variants[idx].stock - item.quantity,
                    0
                );

                const newTotalStock = Math.max(
                    (product.stock ?? 0) - item.quantity,
                    0
                );

                await supabase
                    .from("products")
                    .update({ variants, stock: newTotalStock })
                    .eq("id", product.id);
            }
        }

        return NextResponse.json({ ok: true });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json({ error: "webhook error" }, { status: 500 });
    }
}
