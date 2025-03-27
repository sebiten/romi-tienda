import type React from "react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingBag, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in?redirect=/admin")
  }

  // Verificar si el usuario es administrador
  const { data: profile, error } = await supabase.from("profiles").select("isadmin").eq("id", user.id).single()

  if (error || !profile || !profile.isadmin) {
    return redirect("/acceso-denegado")
  }

  // Obtener estadísticas básicas
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("status", "pendiente")

  const { data: totalUsers } = await supabase.from("profiles").select("id", { count: "exact" })

  const { data: totalProducts } = await supabase.from("products").select("id", { count: "exact" })

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">Dashboard</h1>
          <p className="text-beige-600">Bienvenido al panel de administración</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Pedidos Pendientes"
            value={pendingOrders?.length || 0}
            icon={<Package className="h-8 w-8 text-beige-600" />}
            href="/admin/pedidos"
          />

          <StatsCard
            title="Usuarios"
            value={totalUsers?.length || 0}
            icon={<Users className="h-8 w-8 text-beige-600" />}
            href="/admin/usuarios"
          />

          <StatsCard
            title="Productos"
            value={totalProducts?.length || 0}
            icon={<ShoppingBag className="h-8 w-8 text-beige-600" />}
            href="/admin/productos"
          />

          <StatsCard
            title="Ventas Totales"
            value="$0"
            icon={<CreditCard className="h-8 w-8 text-beige-600" />}
            href="/admin/ventas"
          />
        </div>

        {/* Recent orders */}
        <Card className="bg-white border-beige-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-beige-800">Pedidos Recientes</CardTitle>
          </CardHeader>

          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="divide-y divide-beige-100">
                {recentOrders.map((order) => (
                  <div key={order.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-beige-800">Pedido #{order.id.slice(-6)}</p>
                      <p className="text-sm text-beige-600">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-beige-800">${order.total}</p>
                      {/* <p className="text-xs text-beige-600">{new Date(order.created_at).toLocaleDateString("es-AR")}</p> */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-6 text-beige-600">No hay pedidos recientes</p>
            )}

            <div className="mt-4 text-center">
              <Link href="/admin/pedidos" className="text-sm text-beige-700 hover:text-beige-800 hover:underline">
                Ver todos los pedidos
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function StatsCard({
  title,
  value,
  icon,
  href,
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  href: string
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
  )
}

