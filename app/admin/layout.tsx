import type React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  Home,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Verificar si el usuario es administrador
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user.id)
    .single();

  if (error || !profile || !profile.isadmin) {
    return redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-beige-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-beige-200 p-4">
        <div className="mb-8">
          <h2 className="font-serif text-xl text-beige-800">Panel Admin</h2>
          <p className="text-sm text-beige-600">Gestión de tienda</p>
        </div>

        <nav className="space-y-1">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-beige-700 hover:text-beige-800 hover:bg-beige-100"
          >
            <Link href="/admin">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span>Dashboard</span>
            </Link>
          </Button>

          {/* <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-beige-700 hover:text-beige-800 hover:bg-beige-100"
          >
            <Link href="/admin/pedidos">
              <Package className="w-4 h-4 mr-2" />
              <span>Pedidos</span>
            </Link>
          </Button> */}

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-beige-700 hover:text-beige-800 hover:bg-beige-100"
          >
            <Link href="/admin/new-product">
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>Agregar Productos</span>
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-beige-700 hover:text-beige-800 hover:bg-beige-100"
          >
            <Link href="/admin/edit">
              <Settings className="w-4 h-4 mr-2" />
              <span>Editar Producto</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-beige-700 hover:text-beige-800 hover:bg-beige-100"
          >
            <Link href="/admin/pedidos">
              <Settings className="w-4 h-4 mr-2" />
              <span>Todos los pedidos</span>
            </Link>
          </Button>
        </nav>

        <div className="mt-auto pt-6">
          <Button
            asChild
            variant="outline"
            className="w-full justify-start border-beige-200 text-beige-700 hover:bg-beige-100"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              <span>Volver a la tienda</span>
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
