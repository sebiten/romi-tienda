import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Calendar, CreditCard, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { markOrderAsPaidAction } from "../../actions";
import { updateOrderStatusAction } from "@/app/actions";

function getStatusBadge(status: string) {
  const map = {
    pending: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
    paid: { label: "Pagado", class: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800" },
  };

  const config = map[status as keyof typeof map] || map.pending;

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${config.class}`}>
      {config.label}
    </span>
  );
}

function getOrderStatusBadge(status: string) {
  const map = {
    pending: { label: "Pendiente", class: "bg-gray-100 text-gray-700" },
    preparing: { label: "Preparando", class: "bg-yellow-100 text-yellow-800" },
    shipped: { label: "En camino", class: "bg-blue-100 text-blue-800" },
    ready_for_pickup: { label: "Listo para retirar", class: "bg-purple-100 text-purple-800" },
    completed: { label: "Completado", class: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800" },
  };

  const config = map[status as keyof typeof map] || map.pending;

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${config.class}`}>
      {config.label}
    </span>
  );
}

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("isadmin").eq("id", user.id).single();
  if (!profile?.isadmin) redirect("/");

  const { data: order } = (await supabase
    .from("orders")
    .select(
      `
      *,
      profiles:user_id (*),
      items:order_items (
        *,
        product:product_id(*)
      )
    `,
    )
    .eq("id", params.id)
    .single()) as { data: Order | null };

  if (!order) return notFound();

  const itemsSubtotal =
    order.items?.reduce((sum, item) => sum + ((item.unit_price ?? item.product?.price ?? 0) * item.quantity), 0) ?? 0;
  const shippingAmount = order.shipping_amount ?? order.shipping_cost ?? 0;
  const totalAmount = order.total ?? itemsSubtotal + shippingAmount;

  return (
    <main className="min-h-screen bg-beige-50 px-4 py-12">
      <div className="container mx-auto max-w-5xl">
        <Link href="/admin/pedidos" className="mb-4 flex items-center text-beige-600 hover:text-beige-800">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver a pedidos
        </Link>

        <section className="surface-card surface-border mb-8 overflow-hidden rounded-[2rem] px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h1 className="font-serif text-3xl text-beige-800 md:text-4xl">Pedido #{order.id.slice(-6)}</h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                Vista administrativa del pedido con información de cliente, productos, pago y entrega.
              </p>
              <div className="flex gap-2">
                {getStatusBadge(order.status)}
                {getOrderStatusBadge(order.order_status)}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[390px]">
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Productos</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{order.items?.length ?? 0}</p>
                <p className="text-sm text-[var(--color-muted)]">líneas en el pedido</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Pago</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{order.payment_status || "Pendiente"}</p>
                <p className="text-sm text-[var(--color-muted)]">estado de Mercado Pago</p>
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
          <div className="space-y-6 md:col-span-2">
            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-beige-100 py-4 last:border-none">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} className="h-16 w-16 rounded object-cover" alt={item.product?.title || "Producto"} />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">{item.product?.title}</p>
                      <p className="text-sm text-beige-600">
                        {item.quantity}x · {item.size} {item.color && `(${item.color})`}
                      </p>
                    </div>

                    <p className="font-medium">${item.unit_price ?? item.product?.price}</p>
                  </div>
                ))}

                <div className="space-y-2 border-t border-beige-100 pt-4 text-sm text-beige-700">
                  <div className="flex justify-between">
                    <span>Subtotal productos</span>
                    <span>${itemsSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>${shippingAmount}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-beige-900">
                    <span>Total</span>
                    <span>${totalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form
                  action={async (formData) => {
                    "use server";
                    await updateOrderStatusAction(order.id, formData.get("order_status") as string);
                  }}
                  className="space-y-3"
                >
                  <label className="block text-sm font-medium text-beige-700">Estado logístico</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select name="order_status" defaultValue={order.order_status} className="rounded-lg border px-3 py-2">
                      <option value="pending">Pendiente</option>
                      <option value="preparing">Preparando</option>
                      <option value="shipped">En camino</option>
                      <option value="ready_for_pickup">Listo para retirar</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <Button type="submit" variant="secondary">Actualizar estado</Button>
                  </div>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await markOrderAsPaidAction(order.id);
                  }}
                >
                  <Button variant="outline">Marcar como pagado</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <Package className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{order.profiles?.username || "Sin nombre"}</p>
                    <p>{order.profiles?.user_phone || "Sin teléfono"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Fecha</p>
                    <p>{new Date(order.created_at).toLocaleString("es-AR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Envío</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{order.shipping_name}</p>
                    <p>{order.shipping_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p>{order.shipping_address}</p>
                    <p>{order.shipping_city}, {order.shipping_province}</p>
                    <p>CP {order.shipping_cp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">Estado MP</p>
                    <p>{order.payment_status || "Pendiente"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">ID de pago</p>
                    <p>{order.mp_payment_id || "Sin registrar"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
