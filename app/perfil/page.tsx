import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Calendar, ShoppingBag, LogOut } from "lucide-react";
import { Order } from "@/lib/types";

export default async function Perfil() {
  const supabase = await createClient();

  // ======= GET USER =======
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profileData) redirect("/sign-in");

  const email = user.email;
  const avatar =
    user.user_metadata?.avatar_url ||
    "/placeholder.svg?height=150&width=150";
  const fullName = user.user_metadata?.full_name || profileData.username;
  const createdAt = new Date(user.created_at).toLocaleDateString("es-AR");

  // ======= GET ORDERS WITH ITEMS & PRODUCTS =======
  const { data: orders } = (await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items (
        *,
        product:product_id (*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as { data: Order[] | null };

  return (
    <main className="min-h-screen bg-beige-50">
      {/* HEADER */}
      <div className="relative h-40 bg-beige-100" />

      <div className="container mx-auto px-4 py-8 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================== SIDEBAR =================== */}
          <Card className="bg-white shadow-sm h-fit">
            <CardHeader className="pt-6 text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={avatar} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>

              <h1 className="mt-4 text-2xl font-serif text-beige-800">
                {fullName}
              </h1>
              <p className="text-beige-600">{email}</p>

              <div className="mt-6 text-sm text-beige-600">
                Cliente desde {createdAt}
              </div>

              <Button
                variant="outline"
                className="w-full mt-6 border-beige-200 text-beige-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </CardHeader>
          </Card>

          {/* =================== MAIN CONTENT =================== */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders">
              <TabsList className="bg-beige-100">
                <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
                <TabsTrigger value="addresses">Direcciones</TabsTrigger>
              </TabsList>

              {/* ----------- MIS PEDIDOS ----------- */}
              <TabsContent value="orders" className="mt-4">
                <Card className="bg-white border-beige-200 shadow-sm">
                  <CardContent className="p-0">
                    {orders && orders.length > 0 ? (
                      <div className="divide-y divide-beige-100">
                        {orders.map((order) => (
                          <OrderRow key={order.id} order={order} />
                        ))}
                      </div>
                    ) : (
                      <EmptyOrders />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DIRECCIONES (placeholder) */}
              <TabsContent value="addresses" className="mt-4">
                <Card><CardContent className="p-6">Pronto...</CardContent></Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}

// =================== COMPONENTES ===================

// Badge traducido
function BadgeStatus({ status }: { status: string }) {
  const map = {
    pending: "Pendiente",
    paid: "Pagado",
    cancelled: "Cancelado",
  };

  const cls = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${cls[status as keyof typeof cls]}`}>
      {map[status as keyof typeof map] || status}
    </span>
  );
}

// Card individual del pedido
function OrderRow({ order }: { order: Order }) {
  return (
    <div className="p-4 hover:bg-beige-50 transition">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <ShoppingBag className="w-4 h-4 mr-2 text-beige-600" />
          <span className="font-medium text-beige-800">
            Pedido #{order.id.slice(-6)}
          </span>
        </div>
        <BadgeStatus status={order.status} />
      </div>

      <div className="flex justify-between text-sm text-beige-600">
        <span className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date(order.created_at).toLocaleDateString("es-AR")}
        </span>

        <span className="font-medium text-beige-800">${order.total}</span>
      </div>

      <Link href={`/perfil/pedidos/${order.id}`}>
        <Button variant="link" className="text-beige-700 mt-2">
          Ver detalles
        </Button>
      </Link>
    </div>
  );
}

// Vista de “no hay pedidos”
function EmptyOrders() {
  return (
    <div className="p-8 text-center">
      <ShoppingBag className="w-12 h-12 text-beige-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-beige-800 mb-1">
        No hay pedidos aún
      </h3>
      <p className="text-beige-600 mb-4">Cuando compres, aparecerán aquí.</p>

      <Button className="bg-beige-700 text-beige-50">
        <Link href="/tienda">Ir a la tienda</Link>
      </Button>
    </div>
  );
}
