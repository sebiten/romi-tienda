import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Suspense } from "react"
import AdminOrdersPanel from "@/components/AdminOrderPanel"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  // Verificar si el usuario está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/sign-in?redirect=/admin/pedidos")
  }

  // Verificar si el usuario es administrador
  const { data: profile, error } = await supabase.from("profiles").select("isadmin").eq("id", user.id).single()

  if (error || !profile || !profile.isadmin) {
    return redirect("/acceso-denegado")
  }

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">Panel de Administración</h1>
          <p className="text-beige-600">Gestión de Pedidos</p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-10 h-10 text-beige-500 animate-spin mr-2" />
              <span className="text-beige-600">Cargando pedidos...</span>
            </div>
          }
        >
          <AdminOrdersPanel />
        </Suspense>
      </div>
    </main>
  )
}

