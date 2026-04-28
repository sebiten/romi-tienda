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
  CheckCircle2,
  Clock3,
  LayoutDashboard,
} from "lucide-react";
import { DeleteOrderButton } from "./deleteOrderButton";
import { updateOrderStatusAction } from "@/app/actions";

async function deleteOrderAction(orderId: string) {
  "use server";
  const supabase = await createClient();
  await supabase.from("order_items").delete().eq("order_id", orderId);
  await supabase.from("orders").delete().eq("id", orderId);
  redirect("/admin/pedidos");
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: { label: "Pendiente", class: "bg-amber-50 text-amber-700 border-amber-200" },
    paid: { label: "Pagado", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Cancelado", class: "bg-red-50 text-red-700 border-red-200" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${config.class}`}>
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

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/");

  const { data: profile } = await supabase.from("profiles").select("isadmin").eq("id", user.id).single();
  if (!profile?.isadmin) return redirect("/");

  const { count: totalCount } = await supabase.from("orders").select("*", { count: "exact", head: true });

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
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending").then(({ count }) => count || 0),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "paid").then(({ count }) => count || 0),
  ]);

  return (
    <main className="min-h-screen bg-beige-50 px-4 py-8">
      <div className="container mx-auto max-w-7xl">
        <section className="surface-card surface-border mb-8 overflow-hidden rounded-[2rem] px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Operación diaria
              </span>
              <div className="space-y-3">
                <h1 className="font-serif text-3xl leading-tight text-beige-800 md:text-5xl">Gestión de pedidos</h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                  Revisá pedidos, estado logístico y detalle de compra en una sola vista para operar más rápido y con menos fricción.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-xl border-[rgba(125,91,63,0.18)] bg-white">
                <Link href="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Volver al dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-beige-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-50 p-2">
                  <Clock3 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-beige-600">Pendientes</p>
                  <p className="text-2xl font-bold text-beige-800">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-beige-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-beige-600">Pagados</p>
                  <p className="text-2xl font-bold text-beige-800">{paidCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-beige-200 bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-beige-100 p-2">
                  <Package className="h-5 w-5 text-beige-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-beige-600">Total</p>
                  <p className="text-2xl font-bold text-beige-800">{totalCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-beige-200 bg-white shadow-sm">
          <CardHeader className="border-b border-beige-100">
            <CardTitle className="flex items-center gap-2 text-xl text-beige-800">
              <Package className="h-5 w-5" />
              Lista de pedidos
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 md:p-6">
            {orders?.length ? (
              <div className="space-y-4">
                {orders.map((order: Order) => (
                  <Card key={order.id} className="border border-beige-200 shadow-sm transition-shadow hover:shadow-md">
                    <CardContent className="p-4 md:p-5">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <h3 className="text-base font-semibold text-beige-800">Pedido #{order.id.slice(-8).toUpperCase()}</h3>
                            {getStatusBadge(order.status)}
                          </div>
                          {getOrderStatusBadge(order.order_status)}

                          <div className="space-y-1 text-sm text-beige-600">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span>{order.profiles?.username || "Sin nombre"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{order.profiles?.user_phone || "Sin teléfono"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(order.created_at).toLocaleString("es-AR", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="mb-1 text-xs font-medium text-beige-600">Total</p>
                          <p className="text-2xl font-bold text-beige-800">${order.total?.toLocaleString("es-AR")}</p>
                        </div>
                      </div>

                      {!!order.items?.length && (
                        <Accordion type="single" collapsible className="mb-4">
                          <AccordionItem value="productos" className="border-beige-200">
                            <AccordionTrigger className="rounded-md px-3 py-2 text-sm font-semibold text-beige-800 hover:bg-beige-50 hover:no-underline">
                              <div className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" />
                                Ver productos ({order.items.length})
                              </div>
                            </AccordionTrigger>

                            <AccordionContent>
                              <div className="mt-2 space-y-3 rounded-lg bg-beige-50 p-4">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-beige-200 pb-3 last:border-none">
                                    <div className="flex-1">
                                      <p className="mb-1 font-medium text-beige-800">{item.product?.title || "Producto"}</p>
                                      <div className="flex flex-wrap gap-2 text-xs text-beige-600">
                                        <span className="rounded bg-beige-100 px-2 py-1">Cant: {item.quantity}</span>
                                        {item.size && <span className="rounded bg-beige-100 px-2 py-1">Talle: {item.size}</span>}
                                        {item.color && <span className="rounded bg-beige-100 px-2 py-1">Color: {item.color}</span>}
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p className="mb-1 text-sm text-beige-700">
                                        ${(item.unit_price ?? item.product?.price)?.toLocaleString("es-AR")}
                                      </p>
                                      <p className="font-semibold text-beige-900">
                                        ${(item.quantity * (item.unit_price ?? item.product?.price ?? 0)).toLocaleString("es-AR")}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}

                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <Button asChild className="bg-beige-700 text-white hover:bg-beige-800 lg:flex-1">
                          <Link href={`/admin/pedidos/${order.id}`} className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4" />
                            Ver detalles
                          </Link>
                        </Button>

                        <div className="lg:flex-1">
                          <form
                            action={async (formData) => {
                              "use server";
                              await updateOrderStatusAction(order.id, formData.get("order_status") as string);
                            }}
                            className="flex flex-col gap-2 sm:flex-row"
                          >
                            <select name="order_status" defaultValue={order.order_status} className="rounded-lg border px-3 py-2 text-sm">
                              <option value="pending">Pendiente</option>
                              <option value="preparing">Preparando</option>
                              <option value="shipped">En camino</option>
                              <option value="ready_for_pickup">Listo para retirar</option>
                              <option value="completed">Completado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                            <Button type="submit" variant="outline" className="text-sm">Actualizar estado</Button>
                          </form>
                        </div>

                        <div className="lg:w-[180px]">
                          <DeleteOrderButton orderId={order.id} deleteAction={deleteOrderAction} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="mx-auto mb-3 h-12 w-12 text-beige-300" />
                <p className="font-medium text-beige-600">No hay pedidos registrados</p>
                <p className="mt-1 text-sm text-beige-500">Los pedidos van a aparecer acá cuando empiecen a entrar compras.</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-beige-100 pt-6">
                <div className="text-sm text-beige-600">Página {currentPage} de {totalPages}</div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" disabled={currentPage <= 1} className="border-beige-300 bg-transparent text-beige-700 hover:bg-beige-100 disabled:cursor-not-allowed disabled:opacity-50">
                    {currentPage <= 1 ? (
                      <span className="flex items-center gap-1"><ChevronLeft className="h-4 w-4" />Anterior</span>
                    ) : (
                      <Link href={`/admin/pedidos?page=${currentPage - 1}`} className="flex items-center gap-1"><ChevronLeft className="h-4 w-4" />Anterior</Link>
                    )}
                  </Button>

                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <Button key={pageNum} asChild variant={currentPage === pageNum ? "default" : "outline"} size="sm" className={currentPage === pageNum ? "bg-beige-700 text-white hover:bg-beige-800" : "border-beige-300 text-beige-700 hover:bg-beige-100"}>
                          <Link href={`/admin/pedidos?page=${pageNum}`}>{pageNum}</Link>
                        </Button>
                      );
                    })}
                  </div>

                  <Button asChild variant="outline" size="sm" disabled={currentPage >= totalPages} className="border-beige-300 text-beige-700 hover:bg-beige-100 disabled:cursor-not-allowed disabled:opacity-50">
                    {currentPage >= totalPages ? (
                      <span className="flex items-center gap-1">Siguiente<ChevronRight className="h-4 w-4" /></span>
                    ) : (
                      <Link href={`/admin/pedidos?page=${currentPage + 1}`} className="flex items-center gap-1">Siguiente<ChevronRight className="h-4 w-4" /></Link>
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
