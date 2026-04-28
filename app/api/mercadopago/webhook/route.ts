import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function getAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase para el webhook.");
  }

  return createAdminClient(supabaseUrl, serviceRoleKey);
}

function extractPaymentId(body: any, request: Request) {
  const url = new URL(request.url);

  return (
    body?.data?.id?.toString() ??
    url.searchParams.get("data.id") ??
    url.searchParams.get("id") ??
    null
  );
}

function hasApprovedStatus(payment: any) {
  return payment?.status === "approved";
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Falta MERCADOPAGO_ACCESS_TOKEN en el entorno.");
      return NextResponse.json({ error: "MP no configurado" }, { status: 500 });
    }

    const supabase = getAdminSupabaseClient();
    const body = await request.json().catch(() => ({}));
    const paymentId = extractPaymentId(body, request);
    const isPaymentNotification =
      body?.type === "payment" ||
      body?.action?.startsWith?.("payment.") ||
      Boolean(paymentId);

    if (!isPaymentNotification || !paymentId) {
      return NextResponse.json({ ok: true });
    }

    const client = new MercadoPagoConfig({ accessToken });
    const paymentApi = new Payment(client);

    let mpPayment: any;
    try {
      mpPayment = await paymentApi.get({ id: paymentId });
    } catch (error: any) {
      if (error?.status === 404) {
        console.warn("Pago todavía no disponible en Mercado Pago:", paymentId);
        return NextResponse.json({ ok: true });
      }

      console.error("Error consultando pago en Mercado Pago:", error);
      return NextResponse.json({ error: "MP error" }, { status: 500 });
    }

    const orderId = mpPayment?.external_reference;
    if (!orderId) {
      console.warn("Webhook sin external_reference, se ignora.", {
        paymentId,
      });
      return NextResponse.json({ ok: true });
    }

    const { data: existingOrder, error: orderError } = await supabase
      .from("orders")
      .select("id, status, total, mp_payment_id, mp_preference_id")
      .eq("id", orderId)
      .single();

    if (orderError || !existingOrder) {
      console.error("Orden no encontrada para webhook:", orderId, orderError);
      return NextResponse.json({ ok: true });
    }

    const paymentRaw = JSON.parse(JSON.stringify(mpPayment));
    const paymentStatus = mpPayment?.status ?? null;
    const paymentStatusDetail = mpPayment?.status_detail ?? null;
    const paymentIdString = mpPayment?.id?.toString?.() ?? paymentId;
    const transactionAmount =
      typeof mpPayment?.transaction_amount === "number"
        ? mpPayment.transaction_amount
        : null;
    const orderTotal =
      typeof existingOrder.total === "number" ? existingOrder.total : null;
    const amountMismatch =
      transactionAmount !== null &&
      orderTotal !== null &&
      Math.abs(transactionAmount - orderTotal) > 1;

    const { error: paymentUpdateError } = await supabase
      .from("orders")
      .update({
        mp_payment_id: paymentIdString,
        payment_status: paymentStatus,
        payment_status_detail: amountMismatch
          ? `${paymentStatusDetail ?? "unknown"} | amount_mismatch`
          : paymentStatusDetail,
        payment_raw: paymentRaw,
      })
      .eq("id", orderId);

    if (paymentUpdateError) {
      console.error("No se pudo guardar el estado del pago:", paymentUpdateError);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    if (amountMismatch) {
      console.error("Monto del pago distinto al total de la orden.", {
        orderId,
        paymentId: paymentIdString,
        transactionAmount,
        orderTotal,
      });
      return NextResponse.json({ ok: true });
    }

    if (!hasApprovedStatus(mpPayment)) {
      return NextResponse.json({ ok: true });
    }

    const alreadyPaid = existingOrder.status === "paid";
    if (alreadyPaid && existingOrder.mp_payment_id === paymentIdString) {
      return NextResponse.json({ ok: true });
    }

    const { data: orderItems, error: orderItemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity, size, color")
      .eq("order_id", orderId);

    if (orderItemsError) {
      console.error("No se pudieron cargar los items de la orden:", orderItemsError);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    if (!alreadyPaid) {
      for (const item of orderItems ?? []) {
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("id, stock, variants")
          .eq("id", item.product_id)
          .single();

        if (productError || !product) {
          console.error("No se pudo cargar el producto para descontar stock:", {
            productId: item.product_id,
            productError,
          });
          continue;
        }

        const variants = Array.isArray(product.variants) ? [...product.variants] : [];
        const variantIndex = variants.findIndex(
          (variant: any) =>
            variant.color?.toLowerCase() === item.color?.toLowerCase() &&
            variant.size === item.size
        );

        if (variantIndex === -1) {
          console.error("No se encontró la variante para descontar stock:", {
            productId: item.product_id,
            size: item.size,
            color: item.color,
          });
          continue;
        }

        const currentVariantStock = Number(variants[variantIndex].stock ?? 0);
        variants[variantIndex] = {
          ...variants[variantIndex],
          stock: Math.max(currentVariantStock - item.quantity, 0),
        };

        const newTotalStock = variants.reduce(
          (acc: number, variant: any) => acc + Number(variant.stock ?? 0),
          0
        );

        const { error: stockUpdateError } = await supabase
          .from("products")
          .update({ variants, stock: newTotalStock })
          .eq("id", product.id);

        if (stockUpdateError) {
          console.error("No se pudo actualizar el stock del producto:", {
            productId: product.id,
            stockUpdateError,
          });
          return NextResponse.json({ error: "db error" }, { status: 500 });
        }
      }
    }

    const { error: paidUpdateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        mp_payment_id: paymentIdString,
        payment_status: paymentStatus,
        payment_status_detail: paymentStatusDetail,
        payment_raw: paymentRaw,
      })
      .eq("id", orderId);

    if (paidUpdateError) {
      console.error("No se pudo marcar la orden como pagada:", paidUpdateError);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "webhook error" }, { status: 500 });
  }
}
