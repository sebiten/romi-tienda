import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import MercadoPagoConfig, { Preference } from "mercadopago";

// mas adelante ver lo del codigo postal para calcular el precio verlo aqui

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, items, shippingData, shippingCost, discount } = body;

        console.log("📦 RECIBIDO EN BACKEND:", body);

        // =========================
        // 1) VALIDACIONES BÁSICAS
        // =========================
        if (!userId) {
            return NextResponse.json({ error: "Falta userId" }, { status: 400 });
        }

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "No hay items en el pedido" },
                { status: 400 }
            );
        }

        if (!shippingData) {
            return NextResponse.json(
                { error: "Faltan datos de envío" },
                { status: 400 }
            );
        }

        const requiredFields = ["name", "phone", "address", "city", "province", "cp"] as const;
        for (const field of requiredFields) {
            if (!shippingData[field]) {
                return NextResponse.json(
                    { error: `Falta el dato de envío: ${field}` },
                    { status: 400 }
                );
            }
        }

        // ENVÍO numérico
        const shippingAmount =
            typeof shippingCost === "number" && shippingCost >= 0 ? shippingCost : 0;

        const supabase = await createClient();

        // =========================
        // 2) VALIDAR STOCK
        // =========================
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
                    {
                        error: `La variante ${item.color}/${item.size} no existe para ${item.title}`,
                    },
                    { status: 400 }
                );
            }

            if (variant.stock < item.quantity) {
                return NextResponse.json(
                    {
                        error: `Stock insuficiente para ${item.title}. Disponible: ${variant.stock}`,
                    },
                    { status: 400 }
                );
            }
        }

        // =========================
        // 3) CREAR ORDEN
        // =========================
        const subtotal = items.reduce(
            (acc: number, it: any) => acc + it.quantity * it.unit_price,
            0
        );

        const total = subtotal - (discount || 0) + shippingAmount;

        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: userId,
                status: "pending",
                total,
                discount: discount || 0,
                shipping_amount: shippingAmount,
                shipping_name: shippingData.name,
                shipping_phone: shippingData.phone,
                shipping_address: shippingData.address,
                shipping_city: shippingData.city,
                shipping_province: shippingData.province,
                shipping_cp: shippingData.cp,
            })
            .select()
            .single();

        if (orderError || !order) {
            console.error("❌ ERROR creando orden:", orderError);
            return NextResponse.json(
                { error: "Error al crear la orden" },
                { status: 500 }
            );
        }

        console.log("🟢 ORDEN NUEVA:", order.id);

        // =========================
        // 4) INSERTAR order_items
        // =========================
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

        // =========================
        // 5) CREAR PREFERENCIA MP
        // =========================
        const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
        const siteURL = process.env.NEXT_PUBLIC_SITE_URL;

        if (!accessToken) {
            return NextResponse.json(
                { error: "MP no configurado" },
                { status: 500 }
            );
        }

        const mpClient = new MercadoPagoConfig({ accessToken });
        const preference = new Preference(mpClient);

        // Productos
        const mpItems = items.map((it: any) => ({
            title: `${it.title} - ${it.color} - Talle ${it.size}`,
            description: `Color: ${it.color} - Talle: ${it.size}`,
            quantity: it.quantity,
            unit_price: it.unit_price,
            currency_id: "ARS",
            picture_url: it.image ?? `${siteURL}/default-product.png`,
        }));

        // 🔥 DESCUENTO como ítem negativo
        if (discount && discount > 0) {
            mpItems.push({
                title: "Descuento (10% por 6+ prendas)",
                description: "Descuento automático",
                quantity: 1,
                unit_price: -discount,
                currency_id: "ARS",
            });
        }

        // 🔥 ENVÍO como ítem aparte
        if (shippingAmount > 0) {
            mpItems.push({
                title: "Costo de envío",
                description: "Envío a domicilio",
                quantity: 1,
                unit_price: shippingAmount,
                currency_id: "ARS",
                picture_url: `${siteURL}/shipping.png`,
            });
        }

        const pref = await preference.create({
            body: {
                external_reference: order.id,
                items: mpItems,
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

        // =========================
        // 6) GUARDAR PREFERENCE ID
        // =========================
        await supabase
            .from("orders")
            .update({ mp_preference_id: pref.id })
            .eq("id", order.id);

        // =========================
        // 7) RESPUESTA
        // =========================
        return NextResponse.json({
            init_point:
                pref.init_point ??
                `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pref.id}`,
        });

    } catch (err) {
        console.error("❌ ERROR create-preference:", err);
        return NextResponse.json(
            { error: "Error interno en el servidor" },
            { status: 500 }
        );
    }
}
