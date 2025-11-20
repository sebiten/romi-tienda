import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, userId } = body as {
            items: {
                product_id: string;
                title: string;
                quantity: number;
                unit_price: number;
                size?: string;
                color?: string;
            }[];
            userId?: string | null;
        };

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "No hay items en el pedido" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 1) calcular total
        const total = items.reduce(
            (acc, it) => acc + it.quantity * it.unit_price,
            0
        );

        // 2) crear orden
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: userId ?? null,
                status: "pending",
                total,
            })
            .select("*")
            .single();

        if (orderError || !order) {
            console.error(orderError);
            return NextResponse.json(
                { error: "No se pudo crear la orden" },
                { status: 500 }
            );
        }

        // 3) crear order_items
        const { error: itemsError } = await supabase.from("order_items").insert(
            items.map((it) => ({
                order_id: order.id,
                product_id: it.product_id,
                quantity: it.quantity,
                size: it.size ?? null,
                color: it.color ?? null,
            }))
        );

        if (itemsError) {
            console.error(itemsError);
            return NextResponse.json(
                { error: "No se pudieron guardar los items" },
                { status: 500 }
            );
        }

        // 4) configurar Mercado Pago
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
        });
        const preference = new Preference(client);

        const APP_BASE_URL = process.env.APP_BASE_URL!;

        const mpPreference = await preference.create({
            body: {
                items: items.map((it) => ({
                    id: it.product_id,          // 👈 agregado para satisfacer el tipo Items
                    title: it.title,
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                    currency_id: "ARS",
                })),
                external_reference: order.id,
                back_urls: {
                    success: `${APP_BASE_URL}/checkout/success`,
                    failure: `${APP_BASE_URL}/checkout/failure`,
                    pending: `${APP_BASE_URL}/checkout/pending`,
                },
                auto_return: "approved",
                notification_url: process.env.MERCADOPAGO_WEBHOOK_URL,
            },
        });
        // 5) guardar datos de la preferencia
        await supabase
            .from("orders")
            .update({
                mp_preference_id: mpPreference.id,
            })
            .eq("id", order.id);

        return NextResponse.json(
            {
                init_point: mpPreference.init_point,
                preference_id: mpPreference.id,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error create-preference:", error);
        return NextResponse.json(
            { error: "Error al crear preferencia" },
            { status: 500 }
        );
    }
}
