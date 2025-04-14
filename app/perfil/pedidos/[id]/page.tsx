import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import type { Order } from "@/lib/types"

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const supabase = createClient()
  const { id } = await params

  const { data: order, error } = (await (
    await supabase
  )
    .from("orders")
    .select(
      `
    id,
    status,
    created_at,
    profiles (
      id,
      first_name,
      last_name,
      email,
      phone
    ),
    items (
      id,
      quantity,
      size,
      color,
      price,
      product_id,
      product:product_id (
        id,
        title,
        description,
        price,
        images
      )
    )
  `,
    )
    .eq("id", id)
    .single()) as { data: Order | null; error: any }

  if (error) {
    console.error("Error al cargar la orden:", error.message)
    return notFound()
  }

  if (!order) {
    return notFound()
  }

  // Calculate total price
  const calculateTotal = (): number => {
    if (!order.items || order.items.length === 0) return 0

    return order.items.reduce((total, item) => {
      const itemPrice = item.price || item.product?.price || 0
      const itemTotal = itemPrice * item.quantity
      return total + itemTotal
    }, 0)
  }

  const totalPrice = calculateTotal()

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/admin/pedidos" className="flex items-center text-beige-600 hover:text-beige-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver a pedidos
          </Link>

          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">Pedido #{order.id.slice(-6)}</h1>
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
                  : order.status === "completado"
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
                <CardTitle className="text-xl text-beige-800">Detalles del Pedido</CardTitle>
              </CardHeader>

              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="divide-y divide-beige-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-4 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-md overflow-hidden bg-beige-100 flex-shrink-0 flex items-center justify-center">
                          {item.product?.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-beige-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-beige-800">{item.product?.title}</p>
                          <div className="flex gap-4 text-sm text-beige-600 mt-1">
                            <p>Cantidad: {item.quantity}</p>
                            {item.size && <p>Talla: {item.size}</p>}
                            {item.color && <p>Color: {item.color}</p>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-beige-800">
                            ${((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-xs text-beige-600">
                            ${(item.price || item.product?.price || 0).toFixed(2)} por unidad
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-beige-600">No hay productos en este pedido</p>
                )}

                <div className="border-t border-beige-200 mt-4 pt-4">
                  <div className="flex justify-between py-2">
                    <p className="text-beige-600">Subtotal</p>
                    <p className="font-medium text-beige-800">${totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p className="text-beige-600">Envío</p>
                    <p className="font-medium text-beige-800">$0.00</p>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between py-2 text-lg">
                    <p className="font-medium text-beige-800">Total</p>
                    <p className="font-bold text-beige-800">${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-white border-beige-200 shadow-sm mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-beige-800">Cliente</CardTitle>
              </CardHeader>

              <CardContent>
                {order.profiles ? (
                  <div>
                    <p className="font-medium text-beige-800">
                      {order.profiles.first_name} {order.profiles.last_name}
                    </p>
                    <p className="text-sm text-beige-600 mt-1">{order.profiles.email}</p>
                    {order.profiles.phone && <p className="text-sm text-beige-600">{order.profiles.phone}</p>}
                  </div>
                ) : (
                  <p className="text-center py-2 text-beige-600">Información de cliente no disponible</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-beige-800">Estado del Pedido</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-beige-700 mb-1">Estado actual:</p>
                    <span
                      className={`px-2 py-1 text-sm rounded-md inline-block ${
                        order.status === "pendiente-pago"
                          ? "bg-amber-100 text-amber-800"
                          : order.status === "completado"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelado"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-beige-700 mb-1">Fecha de creación:</p>
                    <p className="text-beige-600">
                      {new Date(order.created_at).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
