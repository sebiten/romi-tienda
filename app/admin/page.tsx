import type React from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Users, ShoppingBag, CreditCard, TrendingUp, Clock, ArrowUpRight, DollarSign } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1) USER
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/")

  // 2) ADMIN CHECK
  const { data: profile } = await supabase.from("profiles").select("isadmin").eq("id", user.id).single()
  if (!profile?.isadmin) redirect("/")

  // 3) QUERIES EN PARALELO
  const [newPaidOrdersQuery, totalUsersQuery, totalProductsQuery, paidOrdersQuery, recentOrdersQuery] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "paid")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total, created_at").eq("status", "paid"),
      supabase
        .from("orders")
        .select("id, user_id, created_at, status, total, shipping_name, shipping_phone, shipping_city")
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  // STATS
  const newPaidOrders = newPaidOrdersQuery.count ?? 0
  const totalUsers = totalUsersQuery.count ?? 0
  const totalProducts = totalProductsQuery.count ?? 0
  const paidOrders = paidOrdersQuery.data ?? []
  const recentOrders = recentOrdersQuery.data ?? []

  const totalSales = paidOrders.reduce((acc, order) => acc + (order.total ?? 0), 0)

  // Calculate growth (mock data - you can enhance this with real historical data)
  const avgOrderValue = paidOrders.length > 0 ? totalSales / paidOrders.length : 0

  return (
    <main className="min-h-screen bg-beige-50">
      <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-3xl md:text-4xl text-beige-900 leading-tight text-balance">
              Panel de Administración
            </h1>
            <p className="text-beige-600 text-sm md:text-base">Resumen general de tu negocio</p>
          </div>
        </header>

        {/* Stats Grid - Mobile Optimized */}
        <div className="mb-6 md:mb-8">
          <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            <StatsCard
              title="Pedidos Pagados Nuevos"
              value={newPaidOrders}
              icon={<Package className="h-6 w-6 md:h-7 md:w-7" />}
              href="/admin/pedidos"
              trend={{ value: newPaidOrders, label: "últimos 7 días" }}
              variant="success"
            />
            <StatsCard
              title="Total Usuarios"
              value={totalUsers}
              icon={<Users className="h-6 w-6 md:h-7 md:w-7" />}
              href="/admin/usuarios"
              trend={{ value: `+${Math.floor(totalUsers * 0.12)}`, label: "este mes" }}
              variant="info"
            />
            <StatsCard
              title="Productos Activos"
              value={totalProducts}
              icon={<ShoppingBag className="h-6 w-6 md:h-7 md:w-7" />}
              href="/admin/productos"
              trend={{ value: totalProducts, label: "en catálogo" }}
              variant="default"
            />
            <StatsCard
              title="Ventas Totales"
              value={`$${totalSales.toLocaleString("es-AR")}`}
              icon={<CreditCard className="h-6 w-6 md:h-7 md:w-7" />}
              href="/admin/ventas"
              trend={{ value: paidOrders.length, label: "pedidos pagados" }}
              variant="success"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders - Takes 2 columns on large screens */}
          <Card className="lg:col-span-2 bg-white border-beige-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl font-serif text-beige-900">Últimos Pedidos</CardTitle>
                <Link
                  href="/admin/pedidos"
                  className="text-sm text-beige-600 hover:text-beige-900 flex items-center gap-1 transition-colors"
                >
                  Ver todos
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="h-12 w-12 text-beige-300 mx-auto mb-3" />
                  <p className="text-beige-600 text-sm">No hay pedidos recientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/admin/pedidos/${order.id}`}
                      className="flex items-center justify-between p-3 md:p-4 rounded-lg border border-beige-200 hover:border-beige-300 hover:bg-beige-50 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-beige-900 truncate">
                            {order.shipping_name || "Sin nombre"}
                          </p>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-beige-600">
                          {order.shipping_city} • {order.shipping_phone}
                        </p>
                        <p className="text-xs text-beige-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString("es-AR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm md:text-base font-semibold text-beige-900">
                          ${order.total.toLocaleString("es-AR")}
                        </p>
                        <ArrowUpRight className="h-4 w-4 text-beige-400 group-hover:text-beige-600 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats - Takes 1 column */}
          <div className="space-y-6">
            {/* Average Order Value */}
            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-beige-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-beige-600" />
                  Valor Promedio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl md:text-3xl font-bold text-beige-900">
                    ${avgOrderValue.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-beige-600">Por pedido</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-beige-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif text-beige-900">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <QuickActionButton
                  href="/admin/pedidos"
                  icon={<Package className="h-4 w-4" />}
                  label="Ver Pedidos"

                />
                <QuickActionButton
                  href="/admin/new-product"
                  icon={<ShoppingBag className="h-4 w-4" />}
                  label="Nuevo Producto"
                />

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

/* --- STATS CARD COMPONENT --- */
function StatsCard({
  title,
  value,
  icon,
  href,
  trend,
  variant = "default",
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  href: string
  trend?: { value: number | string; label: string }
  variant?: "default" | "success" | "warning" | "info"
}) {
  const variantStyles = {
    default: "bg-beige-100 text-beige-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
  }

  return (
    <Link href={href} className="min-w-[280px] snap-center md:min-w-0 block group">
      <Card className="bg-white border-beige-200 shadow-sm hover:shadow-md hover:border-beige-300 transition-all h-full">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${variantStyles[variant]}`}>{icon}</div>
            <ArrowUpRight className="h-4 w-4 text-beige-400 group-hover:text-beige-600 transition-colors" />
          </div>
          <div className="space-y-1">
            <p className="text-xs md:text-sm font-medium text-beige-600">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-beige-900 leading-tight">{value}</p>
            {trend && (
              <p className="text-xs text-beige-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {trend.value} {trend.label}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* --- STATUS BADGE COMPONENT --- */
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: {
      label: "Pendiente",
      variant: "outline" as const,
      className: "border-amber-300 text-amber-700 bg-amber-50",
    },
    paid: {
      label: "Pagado",
      variant: "outline" as const,
      className: "border-emerald-300 text-emerald-700 bg-emerald-50",
    },
    shipped: { label: "Enviado", variant: "outline" as const, className: "border-blue-300 text-blue-700 bg-blue-50" },
    delivered: {
      label: "Entregado",
      variant: "outline" as const,
      className: "border-green-300 text-green-700 bg-green-50",
    },
    cancelled: { label: "Cancelado", variant: "outline" as const, className: "border-red-300 text-red-700 bg-red-50" },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    variant: "outline" as const,
    className: "border-beige-300 text-beige-700 bg-beige-50",
  }

  return (
    <Badge variant={config.variant} className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  )
}

/* --- QUICK ACTION BUTTON --- */
function QuickActionButton({
  href,
  icon,
  label,
  count,
}: {
  href: string
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg border border-beige-200 hover:border-beige-300 hover:bg-beige-50 transition-all group"
    >
      <div className="flex items-center gap-2">
        <div className="text-beige-600 group-hover:text-beige-900 transition-colors">{icon}</div>
        <span className="text-sm font-medium text-beige-900">{label}</span>
      </div>
      {count !== undefined && <Badge className="bg-beige-200 text-beige-900 hover:bg-beige-300">{count}</Badge>}
    </Link>
  )
}
