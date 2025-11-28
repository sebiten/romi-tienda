import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { markOrderAsPaidAction } from "../../actions";

// Traducción visual de estados
function getStatusBadge(status: string) {
  const map = {
    pending: { label: "Pendiente", class: "bg-amber-100 text-amber-800" },
    paid: { label: "Pagado", class: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800" },
  };
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${map[status as keyof typeof map]?.class}`}
    >
      {map[status as keyof typeof map]?.label || status}
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user.id)
    .single();
  if (!profile?.isadmin) redirect("/");

  // Order + items + user + products
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
    `
    )
    .eq("id", params.id)
    .single()) as { data: Order | null };

  if (!order) return notFound();

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <Link
          href="/admin/pedidos"
          className="flex items-center text-beige-600 hover:text-beige-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Link>

        <h1 className="font-serif text-3xl text-beige-800 mb-2">
          Pedido #{order.id.slice(-6)}
        </h1>

        <div className="mb-4">{getStatusBadge(order.status)}</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 py-4 border-b"
                  >
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">{item.product?.title}</p>
                      <p className="text-sm text-beige-600">
                        {item.quantity}x — {item.size} {item.color && `(${item.color})`}
                      </p>
                    </div>

                    <p className="font-medium">
                      ${item.unit_price ?? item.product?.price}
                    </p>
                  </div>
                ))}

                {/* Total */}
                <div className="mt-4 text-lg font-medium">
                  Total: ${order.total}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.profiles?.username}</p>
                <p className="text-sm text-beige-600">
                  {order.profiles?.user_phone}
                </p>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle>Envío</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p><b>Nombre:</b> {order.shipping_name}</p>
                <p><b>Teléfono:</b> {order.shipping_phone}</p>
                <p><b>Dirección:</b> {order.shipping_address}</p>
                <p><b>Ciudad:</b> {order.shipping_city}</p>
                <p><b>Provincia:</b> {order.shipping_province}</p>
                <p><b>CP:</b> {order.shipping_cp}</p>
              </CardContent>
            </Card>

            {/* Pago */}
            <Card>
              <CardHeader>
                <CardTitle>Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <p><b>Estado MP:</b> {order.payment_status || "pendiente"}</p>
                <p><b>ID Pago:</b> {order.mp_payment_id}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botón marcar pagado */}
        <div className="mt-8 flex justify-end">
          <form action={async () => { "use server"; await markOrderAsPaidAction(order.id); }}>
            <Button variant="outline">Marcar como pagado</Button>
          </form>
        </div>
      </div>
    </main>
  );
}
