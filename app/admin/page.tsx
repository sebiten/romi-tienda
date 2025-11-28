import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Users, ShoppingBag, CreditCard } from "lucide-react";
import Link from "next/link";
import PedidosPage from "./pedidos/page";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // ============================
  // 1. Verificar usuario logueado
  // ============================
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ============================
  // 2. Verificar admin
  // ============================
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user?.id)
    .single();

  if (error || !profile || !profile.isadmin) {
    return redirect("/");
  }

  // ============================
  // 3. Stats básicas
  // ============================
  const { data: pendingOrders } = await supabase
    .from("orders")
    .select("id", { count: "exact" })
    .eq("status", "pending");

  const { data: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact" });

  const { data: totalProducts } = await supabase
    .from("products")
    .select("id", { count: "exact" });

  // ============================
  // 4. Ventas Totales — usando columna `total` en orders
  // ============================
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("total")
    .eq("status", "paid"); // tu estado REAL en la base

  const totalSales =
    paidOrders?.reduce((acc, order) => acc + (order.total ?? 0), 0) ?? 0;

  // ============================
  // 5. Últimos pedidos
  // ============================
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // ============================
  // 6. Render
  // ============================
  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">
            Dashboard
          </h1>
          <p className="text-beige-600">
            Bienvenido al panel de administración
          </p>
        </div>

        {/* ==================== */}
        {/* Tarjetas de estadísticas */}
        {/* ==================== */}
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
            href="/admin"
          />

          <StatsCard
            title="Productos"
            value={totalProducts?.length || 0}
            icon={<ShoppingBag className="h-8 w-8 text-beige-600" />}
            href="/admin"
          />

          <StatsCard
            title="Ventas Totales"
            value={`$${totalSales.toLocaleString("es-AR")}`}
            icon={<CreditCard className="h-8 w-8 text-beige-600" />}
            href="/admin"
          />
        </div>

        {/* ==================== */}
        {/* Pedidos recientes */}
        {/* ==================== */}
        <PedidosPage />
      </div>
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
      <Card className="bg-white border-beige-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
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
