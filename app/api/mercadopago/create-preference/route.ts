import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

export async function POST(req: Request) {
    try {
        // =============================
        // 1) LEER BODY UNA sola vez
        // =============================
        const body = await req.json();
        const { userId, items, shipping } = body;

        console.log("📦 RECIBIDO EN BACKEND:", body);

        // =============================
        // 2) VALIDACIONES BÁSICAS
        // =============================
        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No hay items en el pedido" }, { status: 400 });
        }

        if (!shipping) {
            return NextResponse.json({ error: "Faltan datos de envío" }, { status: 400 });
        }

        // Validar todos los campos del envío
        const requiredFields = ["name", "phone", "address", "city", "province", "cp"];
        for (const field of requiredFields) {
            if (!shipping[field]) {
                return NextResponse.json(
                    { error: `Falta el dato de envío: ${field}` },
                    { status: 400 }
                );
            }
        }

        const supabase = await createClient();

        // =============================
        // 3) VALIDAR STOCK
        // =============================
        console.log("🛒 ITEMS PARA MP:", items);
        console.log("🏠 DATOS DE ENVÍO:", shipping);

        for (const item of items) {
            const { data: product } = await supabase
                .from("products")
                .select("id, title, variants")
                .eq("id", item.product_id)
                .single();

            if (!product) {
                return NextResponse.json(
                    { error: `Producto no encontrado: ${item.title}` },
                    { status: 400 }
                );
            }

            const variant = product.variants?.find(
                (v: any) =>
                    v.color?.toLowerCase() === item.color?.toLowerCase() &&
                    v.size === item.size
            );

            if (!variant) {
                return NextResponse.json(
                    { error: `La variante ${item.color}/${item.size} no existe para ${item.title}` },
                    { status: 400 }
                );
            }

            if (variant.stock < item.quantity) {
                return NextResponse.json(
                    { error: `Stock insuficiente para ${item.title}. Disponible: ${variant.stock}` },
                    { status: 400 }
                );
            }
        }

        // =============================
        // 4) CREAR ORDEN EN SUPABASE
        // =============================
        const total = items.reduce(
            (acc: number, it: any) => acc + it.quantity * it.unit_price,
            0
        );

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: userId,
                status: "pending",
                total,
                shipping_name: shipping.name,
                shipping_phone: shipping.phone,
                shipping_address: shipping.address,
                shipping_city: shipping.city,
                shipping_province: shipping.province,
                shipping_cp: shipping.cp,
            })
            .select()
            .single();

        if (orderError) {
            console.error("❌ ERROR creando orden:", orderError);
            return NextResponse.json(
                { error: "Error al crear la orden" },
                { status: 400 }
            );
        }

        console.log("🟢 ORDER CREADA EN SUPABASE:", order);
        console.log("🟢 order.id usado en external_reference:", order.id);

        // Guardar items
        for (const item of items) {
            await supabase.from("order_items").insert({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                unit_price: item.unit_price,
            });
        }

        // =============================
        // 5) CREAR PREFERENCIA MP
        // =============================
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        const siteURL = process.env.NEXT_PUBLIC_SITE_URL;

        if (!accessToken) {
            console.error("❌ Falta MERCADOPAGO_ACCESS_TOKEN en el .env");
            return NextResponse.json({ error: "MP no configurado" }, { status: 500 });
        }

        if (!siteURL) {
            console.error("❌ Falta NEXT_PUBLIC_SITE_URL");
        }

        const client = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(client);

        const result = await preference.create({
            body: {
                external_reference: order.id, // UUID → perfecto

                items: items.map((it: any) => ({
                    title: `${it.title} - ${it.color} - Talle ${it.size}`,
                    description: `Color: ${it.color} - Talle: ${it.size}`,
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                    currency_id: "ARS",
                    picture_url: it.image ?? `${siteURL}/default-product.png`,
                })),

                back_urls: {
                    success: `${siteURL}/perfil`,
                    failure: `${siteURL}/carrito`,
                    pending: `${siteURL}/carrito`,
                },

                notification_url: `${siteURL}/api/mercadopago/webhook`,

                auto_return: "approved",
            },
        });

        console.log("🎯 PREFERENCE RESULT MP:", result);

        // Guardar preference_id
        await supabase
            .from("orders")
            .update({ mp_preference_id: result.id })
            .eq("id", order.id);

        return NextResponse.json({
            init_point: result.sandbox_init_point || result.init_point,
        });

    } catch (err) {
        console.error("❌ ERROR MP:", err);
        return NextResponse.json(
            { error: "Error interno en Mercado Pago" },
            { status: 500 }
        );
    }
}
