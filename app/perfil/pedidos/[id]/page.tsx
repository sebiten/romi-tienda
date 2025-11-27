import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types";

export default async function PedidoDetallePage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  // === 1) USER AUTH ===
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  // === 2) GET ORDER WITH ITEMS + PRODUCTS ===
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
    `
    )
    .eq("id", params.id)
    .eq("user_id", user.id) // seguridad: sólo pedidos del usuario
    .single()) as { data: Order | null; error: any };

  if (!order || error) return notFound();

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back */}
        <Link
          href="/perfil"
          className="flex items-center text-beige-600 hover:text-beige-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Volver a mi perfil
        </Link>

        {/* Header */}
        <h1 className="font-serif text-3xl text-beige-800 mb-1">
          Pedido #{order.id.slice(-6)}
        </h1>

        <p className="text-beige-600 mb-6">
          Realizado el{" "}
          {new Date(order.created_at).toLocaleDateString("es-AR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ==================== IZQUIERDA: ITEMS ==================== */}
          <div className="md:col-span-2">
            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-beige-800">
                  Detalles del Pedido
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 border-b pb-4"
                  >
                    {/* IMG */}
                    <img
                      src={item.product?.images?.[0] || "/placeholder.svg"}
                      className="w-16 h-16 rounded-md object-cover bg-beige-100"
                    />

                    {/* INFO */}
                    <div className="flex-1">
                      <p className="font-medium text-beige-800">
                        {item.product?.title}
                      </p>

                      <p className="text-sm text-beige-600">
                        Cantidad: {item.quantity}
                      </p>

                      {item.size && (
                        <p className="text-sm text-beige-600">
                          Talle: {item.size}
                        </p>
                      )}

                      {item.color && (
                        <p className="text-sm text-beige-600">
                          Color: {item.color}
                        </p>
                      )}
                    </div>

                    {/* PRICE */}
                    <p className="font-medium text-beige-800">
                      ${item.unit_price}
                    </p>
                  </div>
                ))}

                {/* Totales */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-beige-700">
                    <p>Subtotal</p>
                    <p>${order.total}</p>
                  </div>

                  {order.shipping_cost && (
                    <div className="flex justify-between text-beige-700">
                      <p>Envío</p>
                      <p>${order.shipping_cost}</p>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-beige-900 text-lg">
                    <p>Total</p>
                    <p>${order.total! + (order.shipping_cost || 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ==================== DERECHA: INFO CLIENTE ==================== */}
          <div className="space-y-6">
            {/* ESTADO DE PAGO */}
            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-beige-800">
                  Estado del Pago
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-beige-700">
                  Estado:{" "}
                  <span className="font-semibold text-beige-900">
                    {mapStatus(order.status)}
                  </span>
                </p>

                {order.mp_payment_id && (
                  <p className="text-sm text-beige-600 mt-1">
                    ID de Mercado Pago: {order.mp_payment_id}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ENVÍO */}
            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-beige-800">
                  Información de Envío
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-1 text-beige-700">
                <p><b>Nombre:</b> {order.shipping_name}</p>
                <p><b>Teléfono:</b> {order.shipping_phone}</p>
                <p><b>Dirección:</b> {order.shipping_address}</p>
                <p><b>Ciudad:</b> {order.shipping_city}</p>
                <p><b>Provincia:</b> {order.shipping_province}</p>
                <p><b>CP:</b> {order.shipping_cp}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ========= HELPERS ========= */
function mapStatus(status: string) {
  const map: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    cancelled: "Cancelado",
  };
  return map[status] || status;
}
