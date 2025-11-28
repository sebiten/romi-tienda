import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

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

export default async function PedidosPage() {
  const supabase = await createClient();

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/");

  // Is Admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.isadmin) return redirect("/");

  // Fetch recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      *,
      profiles(username, user_phone),
      items:order_items (*, product:product_id(*))
    `)
    .order("created_at", { ascending: false })
    .limit(7);

  return (
    <main className="bg-beige-50 min-h-screen">
      <Card className="bg-white border-beige-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-beige-800">
            Pedidos Recientes
          </CardTitle>
        </CardHeader>

        <CardContent>
          {recentOrders?.length ? (
            <div className="divide-y">
              {recentOrders.map((order: Order) => (
                <Card key={order.id} className="py-4 px-4">
                  {/* Encabezado */}
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-medium text-beige-800">
                        Pedido #{order.id.slice(-6)}
                      </p>

                      <p className="text-sm text-beige-600">
                        {order.profiles?.username} —{" "}
                        {order.profiles?.user_phone}
                      </p>

                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="text-right text-xs text-beige-600">
                      {new Date(order.created_at).toLocaleString("es-AR")}
                    </div>
                  </div>

                  {/* Productos con Accordion */}
                  {!!order.items?.length && (
                    <Accordion type="single" collapsible className="mt-3">
                      <AccordionItem value="productos">
                        <AccordionTrigger
                          className="
    text-sm font-semibold text-beige-800 
    flex items-center gap-2 py-3 px-2 
    hover:bg-beige-100 rounded-md transition-all
    data-[state=open]:text-beige-900
  "
                        >
                          <span className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-beige-800"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7h18M3 12h18M3 17h18"
                              />
                            </svg>
                            Productos del pedido
                          </span>

                          {/* Flecha animada */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="
      h-4 w-4 text-beige-600 ml-auto transition-transform 
      duration-300 data-[state=open]:rotate-180
    "
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </AccordionTrigger>


                        <AccordionContent>
                          <div className="bg-beige-50 p-3 rounded-md mt-2 space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-start text-sm pb-2 border-b last:border-none border-beige-200"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium text-beige-800">
                                    {item.product?.title}
                                  </span>

                                  <span className="text-beige-600 font-medium mt-1">
                                    {item.quantity}× {item.size || ""}{" "}
                                    {item.color && `(${item.color})`}
                                  </span>
                                </div>

                                <div className="text-right">
                                  <span className="block text-beige-700">
                                    ${item.unit_price ??
                                      item.product?.price}
                                  </span>

                                  <span className="block font-semibold text-beige-900">
                                    Subtotal: $
                                    {(
                                      item.quantity *
                                      (item.unit_price! ??
                                        item.product?.price)
                                    ).toLocaleString("es-AR")}
                                  </span>

                                  {(order.discount ?? 0) > 0 && (
                                    <span className="block text-green-700 text-xs">
                                      Descuento: -$
                                      {(order.discount ?? 0).toLocaleString(
                                        "es-AR"
                                      )}
                                    </span>
                                  )}

                                  {(order.shipping_amount ?? 0) > 0 && (
                                    <span className="block text-xs text-beige-700">
                                      Envío: $
                                      {(order.shipping_amount ?? 0).toLocaleString(
                                        "es-AR"
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {/* Botón detalles */}
                  <Button
                    asChild
                    className="bg-beige-500 hover:bg-beige-700 text-white text-sm font-bold mt-4"
                  >
                    <Link href={`/admin/pedidos/${order.id}`}>
                      Ver detalles completos
                    </Link>
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-beige-600">
              No hay pedidos recientes
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
