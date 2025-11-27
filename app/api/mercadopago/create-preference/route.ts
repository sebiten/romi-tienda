import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import MercadoPagoConfig, { Preference } from "mercadopago";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, items, shipping } = body;

        console.log("📦 RECIBIDO EN BACKEND:", body);

        if (!userId) {
            return NextResponse.json({ error: "Falta userId" }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No hay items en el pedido" }, { status: 400 });
        }

        if (!shipping) {
            return NextResponse.json({ error: "Faltan datos de envío" }, { status: 400 });
        }

        const requiredFields = ["name", "phone", "address", "city", "province", "cp"];
        for (const field of requiredFields) {
            if (!shipping[field]) {
                return NextResponse.json({ error: `Falta el dato de envío: ${field}` }, { status: 400 });
            }
        }

        // ⚠ CLIENTE ADMIN PARA IGNORAR RLS
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // ============================================================
        // 1) BUSCAR SI YA EXISTE UNA ORDEN PENDIENTE PARA ESTE USUARIO
        // ============================================================
        const { data: pendingOrder } = await supabase
            .from("orders")
            .select("id, mp_preference_id")
            .eq("user_id", userId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (pendingOrder) {
            console.log("🔁 Orden pendiente existente → reutilizando preferencia");

            return NextResponse.json({
                init_point: `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pendingOrder.mp_preference_id}`,
            });
        }

        // ============================================================
        // 2) VALIDAR STOCK DE FORMA SEGURA
        // ============================================================
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

        // ============================================================
        // 3) CREAR ORDEN SEGURA (ANTI DOBLE CLICK)
        // ============================================================
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

        if (orderError || !order) {
            console.error("❌ ERROR creando orden:", orderError);
            return NextResponse.json({ error: "Error al crear la orden" }, { status: 500 });
        }

        console.log("🟢 ORDEN NUEVA:", order.id);

        // ============================================================
        // 4) INSERTAR ITEMS DE LA ORDEN
        // ============================================================
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

        // ============================================================
        // 5) CREAR PREFERENCIA MP
        // ============================================================
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        const siteURL = process.env.NEXT_PUBLIC_SITE_URL;

        if (!accessToken) {
            return NextResponse.json({ error: "MP no configurado" }, { status: 500 });
        }

        const mpClient = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(mpClient);

        const pref = await preference.create({
            body: {
                external_reference: order.id,

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

        console.log("🎯 PREFERENCIA CREADA:", pref.id);

        // ============================================================
        // 6) GUARDAR PREFERENCE EN LA ORDEN
        // ============================================================
        await supabase
            .from("orders")
            .update({ mp_preference_id: pref.id })
            .eq("id", order.id);

        // ============================================================
        // 7) RESPONDER CON INIT POINT
        // ============================================================
        return NextResponse.json({
            init_point: pref.init_point ?? `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pref.id}`,
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
    }
}
