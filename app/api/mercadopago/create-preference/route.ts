import { NextResponse } from "next/server";
import { z } from "zod";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { createClient } from "@/utils/supabase/server";
import { calculateShippingFromPostalCode } from "@/lib/shipping";

const checkoutSchema = z.object({
  userId: z.string().uuid(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        size: z.string().min(1),
        color: z.string().min(1),
      })
    )
    .min(1),
  shippingData: z.object({
    name: z.string().trim().min(1),
    phone: z.string().trim().min(1),
    address: z.string().trim().min(1),
    city: z.string().trim().min(1),
    province: z.string().trim().optional().default(""),
    cp: z.string().trim().min(3),
  }),
});

type ValidatedItem = {
  product_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  size: string;
  color: string;
  image: string | null;
};

function calculateDiscount(subtotal: number, totalUnits: number) {
  return totalUnits >= 6 ? subtotal * 0.1 : 0;
}

function getBaseUrl(req: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const forwardedProto = req.headers.get("x-forwarded-proto");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost ?? req.headers.get("host");
  const protocol = forwardedProto ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return null;
}

function canUseAutoReturn(siteUrl: string) {
  const { hostname, protocol } = new URL(siteUrl);
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1";

  return protocol === "https:" && !isLocalHost;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const parsedBody = checkoutSchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }

    const { userId, items, shippingData } = parsedBody.data;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json(
        { error: "Usuario no autorizado para iniciar esta compra" },
        { status: 401 }
      );
    }

    const productIds = Array.from(
      new Set(items.map((item) => item.product_id))
    );
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, title, price, images, variants")
      .in("id", productIds);

    if (productsError) {
      console.error("Error obteniendo productos:", productsError);
      return NextResponse.json(
        { error: "No se pudieron validar los productos" },
        { status: 500 }
      );
    }

    const productsMap = new Map(
      (products ?? []).map((product) => [product.id, product])
    );
    const validatedItems: ValidatedItem[] = [];

    for (const item of items) {
      const product = productsMap.get(item.product_id);

      if (!product) {
        return NextResponse.json(
          { error: "Hay productos que ya no están disponibles" },
          { status: 400 }
        );
      }

      const variant = product.variants?.find(
        (value: { color?: string; size?: string; stock?: number }) =>
          value.color?.toLowerCase() === item.color.toLowerCase() &&
          value.size === item.size
      );

      if (!variant) {
        return NextResponse.json(
          {
            error: `La variante ${item.color}/${item.size} no existe para ${product.title}`,
          },
          { status: 400 }
        );
      }

      if ((variant.stock ?? 0) < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${product.title}. Disponible: ${variant.stock ?? 0}`,
          },
          { status: 400 }
        );
      }

      if (typeof product.price !== "number" || Number.isNaN(product.price)) {
        return NextResponse.json(
          { error: `El producto ${product.title} no tiene un precio válido` },
          { status: 400 }
        );
      }

      validatedItems.push({
        product_id: product.id,
        title: product.title,
        quantity: item.quantity,
        unit_price: product.price,
        size: item.size,
        color: item.color,
        image: product.images?.[0] ?? null,
      });
    }

    const subtotal = validatedItems.reduce(
      (acc, item) => acc + item.quantity * item.unit_price,
      0
    );
    const totalUnits = validatedItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    const discount = calculateDiscount(subtotal, totalUnits);
    const shippingQuote = calculateShippingFromPostalCode(shippingData.cp);
    const shippingAmount = shippingQuote.cost;
    const total = subtotal - discount + shippingAmount;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total,
        discount,
        shipping_amount: shippingAmount,
        shipping_name: shippingData.name,
        shipping_phone: shippingData.phone,
        shipping_address: shippingData.address,
        shipping_city: shippingData.city,
        shipping_province: shippingQuote.province,
        shipping_cp: shippingQuote.cp,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error creando orden:", orderError);
      return NextResponse.json(
        { error: "Error al crear la orden" },
        { status: 500 }
      );
    }

    for (const item of validatedItems) {
      const { error: itemError } = await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        unit_price: item.unit_price,
      });

      if (itemError) {
        console.error("Error creando item de orden:", itemError);
        return NextResponse.json(
          { error: "Error al guardar los productos del pedido" },
          { status: 500 }
        );
      }
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    const siteURL = getBaseUrl(req);

    if (!accessToken) {
      return NextResponse.json({ error: "MP no configurado" }, { status: 500 });
    }

    if (!siteURL) {
      return NextResponse.json(
        { error: "No se pudo resolver la URL base del sitio" },
        { status: 500 }
      );
    }

    const mpClient = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(mpClient);
    const mpItems = validatedItems.map((item) => ({
      id: item.product_id,
      title: `${item.title} - ${item.color} - Talle ${item.size}`,
      description: `Color: ${item.color} - Talle: ${item.size}`,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: "ARS",
      picture_url: item.image ?? `${siteURL}/default-product.png`,
    }));

    if (discount > 0) {
      mpItems.push({
        id: "discount",
        title: "Descuento automático",
        description: "Descuento aplicado por compra mayorista",
        quantity: 1,
        unit_price: -discount,
        currency_id: "ARS",
        picture_url: `${siteURL}/default-product.png`,
      });
    }

    if (shippingAmount > 0) {
      mpItems.push({
        id: "shipping",
        title: "Costo de envío",
        description: `Envío a ${shippingQuote.province}`,
        quantity: 1,
        unit_price: shippingAmount,
        currency_id: "ARS",
        picture_url: `${siteURL}/shipping.png`,
      });
    }

    const preferenceBody: Parameters<typeof preference.create>[0]["body"] = {
      external_reference: order.id,
      items: mpItems,
      back_urls: {
        success: `${siteURL}/perfil`,
        failure: `${siteURL}/carrito`,
        pending: `${siteURL}/carrito`,
      },
      notification_url: `${siteURL}/api/mercadopago/webhook`,
    };

    if (canUseAutoReturn(siteURL)) {
      preferenceBody.auto_return = "approved";
    }

    const pref = await preference.create({
      body: preferenceBody,
    });

    await supabase
      .from("orders")
      .update({ mp_preference_id: pref.id })
      .eq("id", order.id);

    return NextResponse.json({
      init_point:
        pref.init_point ??
        `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${pref.id}`,
    });
  } catch (error) {
    console.error("Error create-preference:", error);
    return NextResponse.json(
      { error: "Error interno en el servidor" },
      { status: 500 }
    );
  }
}
