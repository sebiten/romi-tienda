import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Order } from "@/lib/types";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Package,
  User,
  Phone,
  Calendar,
  ShoppingBag,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DeleteOrderButton } from "./deleteOrderButton";
import { updateOrderStatusAction } from "@/app/actions";

// SERVER ACTION: ELIMINAR PEDIDO
async function deleteOrderAction(orderId: string) {
  "use server";
  const supabase = await createClient();

  // eliminar items primero
  await supabase.from("order_items").delete().eq("order_id", orderId);

  // eliminar pedido
  await supabase.from("orders").delete().eq("id", orderId);

  redirect("/admin/pedidos");
}

// BADGE DE ESTADO
function getStatusBadge(status: string) {
  const statusConfig = {
    pending: {
      label: "Pendiente",
      class: "bg-amber-50 text-amber-700 border-amber-200",
    },
    paid: {
      label: "Pagado",
      class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    cancelled: {
      label: "Cancelado",
      class: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${config.class}`}
    >
      {config.label}
    </span>
  );
}
function getOrderStatusBadge(status: string) {
  const map = {
    pending: { label: "Pendiente", class: "bg-gray-100 text-gray-700" },
    preparing: { label: "Preparando", class: "bg-yellow-100 text-yellow-800" },
    shipped: { label: "En camino", class: "bg-blue-100 text-blue-800" },
    ready_for_pickup: {
      label: "Listo para retirar",
      class: "bg-purple-100 text-purple-800",
    },
    completed: { label: "Completado", class: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelado", class: "bg-red-100 text-red-800" },
  };

  const config = map[status as keyof typeof map] || map.pending;

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${config.class}`}
    >
      {config.label}
    </span>
  );
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();

  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);
  const ordersPerPage = 10;
  const from = (currentPage - 1) * ordersPerPage;
  const to = from + ordersPerPage - 1;

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

  const { count: totalCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles(username, user_phone),
      items:order_items(*, product:product_id(*))
    `,
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((totalCount || 0) / ordersPerPage);

  const [pendingCount, paidCount] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => count || 0),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "paid")
      .then(({ count }) => count || 0),
  ]);

  return (
    <main className="bg-beige-50 min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2 leading-tight">
              Gestión de Pedidos
            </h1>
            <p className="text-beige-600 text-sm md:text-base">
              Administra y visualiza todos los pedidos
            </p>
          </div>
          <Link href="/admin">
            <Button
              variant="outline"
              className="border-beige-300 text-beige-700 hover:bg-beige-100 bg-transparent"
            >
              Volver al Dashboard
            </Button>
          </Link>
        </header>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white border-beige-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Package className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-beige-600">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-beige-800">
                    {pendingCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-beige-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-beige-600">Pagados</p>
                  <p className="text-2xl font-bold text-beige-800">
                    {paidCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-beige-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-beige-100 rounded-lg">
                  <Package className="h-5 w-5 text-beige-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-beige-600">Total</p>
                  <p className="text-2xl font-bold text-beige-800">
                    {totalCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card className="bg-white border-beige-200 shadow-sm">
          <CardHeader className="border-b border-beige-100">
            <CardTitle className="text-xl text-beige-800 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Pedidos
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            {orders?.length ? (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card
                    key={order.id}
                    className="border border-beige-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 md:p-5">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-base text-beige-800">
                              Pedido #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            {getStatusBadge(order.status)}
                          </div>
                          {getOrderStatusBadge(order.order_status)}

                          <div className="space-y-1 text-sm text-beige-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{order.profiles?.username || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{order.profiles?.user_phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(order.created_at).toLocaleString(
                                  "es-AR",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-medium text-beige-600 mb-1">
                            Total
                          </p>
                          <p className="text-2xl font-bold text-beige-800">
                            ${order.total?.toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>

                      {/* Accordion de Productos */}
                      {!!order.items?.length && (
                        <Accordion type="single" collapsible className="mb-4">
                          <AccordionItem
                            value="productos"
                            className="border-beige-200"
                          >
                            <AccordionTrigger className="text-sm font-semibold text-beige-800 hover:bg-beige-50 px-3 py-2 rounded-md hover:no-underline">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Ver productos ({order.items.length})
                              </div>
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="bg-beige-50 p-4 rounded-lg mt-2 space-y-3">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex justify-between items-start gap-4 pb-3 border-b last:border-none border-beige-200"
                                  >
                                    <div className="flex-1">
                                      <p className="font-medium text-beige-800 mb-1">
                                        {item.product?.title || "Producto"}
                                      </p>
                                      <div className="flex flex-wrap gap-2 text-xs text-beige-600">
                                        <span className="bg-beige-100 px-2 py-1 rounded">
                                          Cant: {item.quantity}
                                        </span>
                                        {item.size && (
                                          <span className="bg-beige-100 px-2 py-1 rounded">
                                            Talle: {item.size}
                                          </span>
                                        )}
                                        {item.color && (
                                          <span className="bg-beige-100 px-2 py-1 rounded">
                                            Color: {item.color}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-sm text-beige-700 mb-1">
                                        $
                                        {(
                                          item.unit_price ?? item.product?.price
                                        )?.toLocaleString("es-AR")}
                                      </p>
                                      <p className="font-semibold text-beige-900">
                                        $
                                        {(
                                          item.quantity *
                                          (item.unit_price ??
                                            item.product?.price ??
                                            0)
                                        ).toLocaleString("es-AR")}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      {/* Botones de Acción */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          asChild
                          className="flex-1 bg-beige-700 hover:bg-beige-800 text-white"
                        >
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="flex items-center justify-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </Link>
                        </Button>

                        <div className="flex-1 sm:flex-initial">
                          <DeleteOrderButton
                            orderId={order.id}
                            deleteAction={deleteOrderAction}
                          />
                        </div>
                        <form
                          action={async (formData) => {
                            "use server";
                            await updateOrderStatusAction(
                              order.id,
                              formData.get("order_status") as string,
                            );
                          }}
                          className="flex gap-2 mt-2"
                        >
                          <select
                            name="order_status"
                            defaultValue={order.order_status}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="preparing">Preparando</option>
                            <option value="shipped">En camino</option>
                            <option value="ready_for_pickup">
                              Listo para retirar
                            </option>
                            <option value="completed">Completado</option>
                            <option value="cancelled">Cancelado</option>
                          </select>

                          <Button
                            type="submit"
                            variant="outline"
                            className="text-sm"
                          >
                            Cambiar
                          </Button>
                        </form>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-beige-300 mx-auto mb-3" />
                <p className="text-beige-600 font-medium">
                  No hay pedidos registrados
                </p>
                <p className="text-sm text-beige-500 mt-1">
                  Los pedidos aparecerán aquí cuando los clientes realicen
                  compras
                </p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-beige-100">
                <div className="text-sm text-beige-600">
                  Página {currentPage} de {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    className="border-beige-300 text-beige-700 hover:bg-beige-100 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                  >
                    {currentPage <= 1 ? (
                      <span className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </span>
                    ) : (
                      <Link
                        href={`/admin/pedidos?page=${currentPage - 1}`}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Link>
                    )}
                  </Button>

                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          asChild
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          className={
                            currentPage === pageNum
                              ? "bg-beige-700 hover:bg-beige-800 text-white"
                              : "border-beige-300 text-beige-700 hover:bg-beige-100"
                          }
                        >
                          <Link href={`/admin/pedidos?page=${pageNum}`}>
                            {pageNum}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    className="border-beige-300 text-beige-700 hover:bg-beige-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentPage >= totalPages ? (
                      <span className="flex items-center gap-1">
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    ) : (
                      <Link
                        href={`/admin/pedidos?page=${currentPage + 1}`}
                        className="flex items-center gap-1"
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
