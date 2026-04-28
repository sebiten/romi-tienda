import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, CreditCard, MapPin, PackageCheck, Truck } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/lib/types";

function mapOrderStatus(status: string) {
  const map: Record<string, string> = {
    pending: "Pendiente",
    preparing: "Preparando",
    shipped: "En camino",
    ready_for_pickup: "Listo para retirar",
    completed: "Completado",
    cancelled: "Cancelado",
    paid: "Pagado",
  };

  return map[status] ?? status;
}

export default async function PedidoDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: order, error } = (await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items (
        *,
        product:product_id (*)
      ),
      profiles:user_id (*)
    `,
    )
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single()) as { data: Order | null; error: any };

  if (!order || error) return notFound();

  const itemSubtotal =
    order.items?.reduce((sum, item) => sum + ((item.unit_price ?? item.price ?? 0) * item.quantity), 0) ?? 0;
  const shippingAmount = order.shipping_amount ?? order.shipping_cost ?? 0;
  const totalAmount = order.total ?? itemSubtotal + shippingAmount;

  return (
    <main className="min-h-screen bg-beige-50 px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <Link href="/perfil" className="mb-4 flex items-center text-beige-600 transition hover:text-beige-800">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mi perfil
        </Link>

        <section className="surface-card surface-border mb-8 overflow-hidden rounded-[2rem] px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h1 className="font-serif text-3xl text-beige-800 md:text-4xl">Pedido #{order.id.slice(-6)}</h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                Realizado el{" "}
                {new Date(order.created_at).toLocaleDateString("es-AR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                . Desde acá podés revisar productos, totales y datos de entrega.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[390px]">
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Estado</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{mapOrderStatus(order.order_status || order.status || "pending")}</p>
                <p className="text-sm text-[var(--color-muted)]">seguimiento actual</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Pago</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{order.payment_status || "Pendiente"}</p>
                <p className="text-sm text-[var(--color-muted)]">estado registrado</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Total</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">${totalAmount}</p>
                <p className="text-sm text-[var(--color-muted)]">importe final</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-beige-800">Resumen del pedido</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-beige-100 pb-4">
                    <img
                      src={item.product?.images?.[0] || "/placeholder.svg"}
                      className="h-16 w-16 rounded-md bg-beige-100 object-cover"
                      alt={item.product?.title || "Producto"}
                    />

                    <div className="flex-1">
                      <p className="font-medium text-beige-800">{item.product?.title}</p>
                      <p className="text-sm text-beige-600">Cantidad: {item.quantity}</p>
                      {item.size && <p className="text-sm text-beige-600">Talle: {item.size}</p>}
                      {item.color && <p className="text-sm text-beige-600">Color: {item.color}</p>}
                    </div>

                    <p className="font-medium text-beige-800">${item.unit_price ?? item.price ?? 0}</p>
                  </div>
                ))}

                <div className="space-y-2 border-t border-beige-100 pt-4 text-beige-700">
                  <div className="flex justify-between">
                    <p>Subtotal de productos</p>
                    <p>${itemSubtotal}</p>
                  </div>

                  <div className="flex justify-between">
                    <p>Envío</p>
                    <p>${shippingAmount}</p>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-beige-900">
                    <p>Total</p>
                    <p>${totalAmount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-beige-800">Estado y pago</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <PackageCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Estado del pedido</p>
                    <p>{mapOrderStatus(order.order_status || order.status || "pending")}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Pago</p>
                    <p>{order.payment_status || "Pendiente"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Fecha</p>
                    <p>{new Date(order.created_at).toLocaleDateString("es-AR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-beige-800">Datos de entrega</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--color-ink)]">{order.shipping_name}</p>
                    <p>{order.shipping_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div className="space-y-1">
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}, {order.shipping_province}</p>
                    <p>CP {order.shipping_cp}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-[rgba(125,91,63,0.14)] text-[var(--color-muted)]">
                  Información guardada al momento de la compra
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
