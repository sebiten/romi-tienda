import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import MercadoPagoConfig, { Payment } from "mercadopago";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Mercado Pago manda varios tipos, nos interesa "payment"
        if (body.type !== "payment" || !body.data?.id) {
            return NextResponse.json({ ok: true });
        }

        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
        });
        const paymentApi = new Payment(client);

        // 1) obtener info completa del pago
        const mpPayment = await paymentApi.get({ id: body.data.id });

        const orderId = mpPayment.external_reference; // es el id de orders
        if (!orderId) {
            console.error("Sin external_reference en el pago");
            return NextResponse.json({ ok: true });
        }

        const supabase = await createClient();

        // 2) actualizar la orden con datos del pago
        await supabase
            .from("orders")
            .update({
                mp_payment_id: mpPayment.id?.toString(),
                payment_status: mpPayment.status,
                payment_status_detail: mpPayment.status_detail,
                payment_raw: mpPayment as any,
                status: mpPayment.status === "approved" ? "paid" : "pending",
            })
            .eq("id", orderId);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json({ error: "webhook error" }, { status: 500 });
    }
}
