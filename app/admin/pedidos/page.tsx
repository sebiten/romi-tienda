import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/types";

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
    .select(
      `
      *,
      profiles(username, user_phone),
      items:order_items (*, product:product_id(*))
    `
    )
    .order("created_at", { ascending: false })
    .limit(7);

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <Card className="bg-white border-beige-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-beige-800">
            Pedidos Recientes
          </CardTitle>
        </CardHeader>

        <CardContent>
          {recentOrders?.length ? (
            <div className="divide-y divide-beige-100">
              {recentOrders.map((order: Order) => (
                <div key={order.id} className="py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-beige-800">
                        Pedido #{order.id.slice(-6)}
                      </p>

                      <p className="text-sm text-beige-600">
                        {order.profiles?.username} — {order.profiles?.user_phone}
                      </p>

                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="text-right text-xs text-beige-600">
                      {new Date(order.created_at).toLocaleString("es-AR")}
                    </div>
                  </div>

                  {/* Productos */}
                  {!!order.items?.length && (
                    <div className="bg-beige-50 p-3 rounded-md mb-3">
                      <p className="text-sm font-medium text-beige-700">Productos:</p>
                      <div className="mt-2 space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.product?.title} — {item.quantity}x{" "}
                              {item.size || ""} {item.color && `(${item.color})`}
                            </span>

                            <span className="font-medium">
                              ${item.unit_price ?? item.product?.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button asChild className="text-xs">
                    <Link href={`/admin/pedidos/${order.id}`}>
                      Ver detalles completos
                    </Link>
                  </Button>
                </div>
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
