import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";
import { CartItem, Order, OrderItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { boolean } from "zod";
import { NextPage } from "next";

// Add this helper function to calculate the total

export default async function PedidosPage() {
  const supabase = await createClient();

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificar si el usuario es administrador
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user?.id)
    .single();

  if (error || !profile || !profile.isadmin) {
    return redirect("/");
  }

  // Obtener estadísticas básicas
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("status", "pendiente");

  const { data: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact" });

  const { data: totalProducts } = await supabase
    .from("products")
    .select("id", { count: "exact" });
  // recent order con paginacion
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(7);

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      {/* Recent orders */}
      <Card className="bg-white border-beige-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-beige-800">
            Pedidos Recientes
          </CardTitle>
        </CardHeader>

        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="divide-y divide-beige-100">
              {recentOrders.map((order: Order) => (
                <div key={order.id} className="py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-beige-800">
                          Pedido #{order.id.slice(-6)}
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
                      {order.profiles && (
                        <p className="text-sm text-beige-600 mt-1">
                          Cliente:{" "}
                          {order.profiles.first_name ||
                            order.profiles.email ||
                            "Usuario " + order.user_id.slice(-6)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-beige-600">
                        {new Date(order.created_at).toLocaleDateString(
                          "es-AR",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-beige-50 rounded-md p-3 mb-3">
                      <p className="text-sm font-medium text-beige-700 mb-2">
                        Productos:
                      </p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <div>
                              <span className="text-beige-800">
                                {item.product?.title ||
                                  "Producto " + item.product_id.slice(-6)}
                              </span>
                              <span className="text-beige-600 ml-2">
                                {item.quantity}x {item.size}{" "}
                                {item.color && `- ${item.color}`}
                              </span>
                            </div>
                            <span className="font-medium text-beige-800">
                              ${item.product?.price || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button className="flex justify-between items-center">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-xs text-beige-800 underline hover:text-beige-600"
                    >
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

function StatsCard({
  title,
  value,
  icon,
  href,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="bg-white border-beige-200 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-beige-600">{title}</p>
              <p className="text-3xl font-bold text-beige-800 mt-1">{value}</p>
            </div>
            {icon}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

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
