import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Order, OrderItem } from "@/lib/types";

export default async function OrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario logueado, redirigimos
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch the order with all related information
  const { data: order, error } = (await supabase
    .from("orders")
    .select(
      `
      *,
      profiles:user_id (*),
      items:id (
        *,
        product:product_id (*)
      )
    `
    )
    .eq("id", params.id)
    .single()) as { data: Order | null; error: any };

  if (error || !order) {
    return notFound();
  }

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link
            href="/admin/pedidos"
            className="flex items-center text-beige-600 hover:text-beige-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a pedidos
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">
            Pedido #{order.id.slice(-6)}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-beige-600">
              {new Date(order.created_at).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                order.status === "pendiente-pago"
                  ? "bg-amber-100 text-amber-800"
                  : order.status === "pagado"
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelado"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-beige-800">
                  Detalles del Pedido
                </CardTitle>
              </CardHeader>

              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="divide-y divide-beige-100">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 flex items-center gap-4"
                      >
                        {item.product?.images && (
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-beige-100 flex-shrink-0">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title || "Producto"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-beige-800">
                            {item.product?.title ||
                              "Producto " + item.product_id.slice(-6)}
                          </p>
                          <div className="flex gap-4 text-sm text-beige-600 mt-1">
                            <p>Cantidad: {item.quantity}</p>
                            {item.size && <p>Talla: {item.size}</p>}
                            {item.color && <p>Color: {item.color}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-beige-800">
                            $
                            {(
                              item.price ||
                              (item.product?.price
                                ? item.product.price * item.quantity
                                : 0) ||
                              0
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-beige-600">
                    No hay productos en este pedido
                  </p>
                )}

                <div className="border-t border-beige-200 mt-4 pt-4">
                  <div className="flex justify-between py-2">
                    <p className="text-beige-600">Subtotal</p>
                    <p className="font-medium text-beige-800">
                      ${calculateOrderTotal(order)}
                    </p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p className="text-beige-600">Envío</p>
                    <p className="font-medium text-beige-800">
                      ${order.shipping_cost?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="flex justify-between py-2 text-lg">
                    <p className="font-medium text-beige-800">Total</p>
                    <p className="font-bold text-beige-800">
                      $
                      {(
                        parseFloat(calculateOrderTotal(order)) +
                        (order.shipping_cost || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
       

            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-beige-800">
                  Información Adicional
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-beige-700">
                      Método de Pago:
                    </p>
                    <p className="text-beige-600">
                      {order.payment_method || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-beige-700">
                      Dirección de Envío:
                    </p>
                    <p className="text-beige-600">
                      {order.shipping_address || "No especificada"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-beige-700">Notas:</p>
                    <p className="text-beige-600">
                      {order.notes || "Sin notas"}
                    </p>
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

// Helper function to calculate order total
// Add this helper function to calculate the total
function calculateOrderTotal(order: Order): string {
  if (!order.items || order.items.length === 0) return "0.00";

  return order.items
    .reduce((total, item) => {
      const itemPrice =
        item.price ||
        (item.product?.price ? item.product.price * item.quantity : 0);
      return total + (itemPrice || 0);
    }, 0)
    .toFixed(2);
}
