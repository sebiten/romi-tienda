import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
  ShoppingBag,
  MapPin,
  Calendar,
  PersonStanding,
  User2Icon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function Perfil() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificar autenticación

  // extraer el userid de la tabla public.profiles
  const { data: profileData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();
  if (error) {
    console.error("Error al cargar el perfil:", error.message);
    return redirect("/sign-in");
  }
  if (!profileData) {
    console.error("Perfil no encontrado");
    return redirect("/sign-in");
  }

  if (!user) {
    return redirect("/sign-in");
  }

  // Extraemos información relevante del usuario
  const email = user.email;
  const avatar =
    user.user_metadata?.avatar_url || "/placeholder.svg?height=150&width=150";
  const fullName = user.user_metadata?.full_name || "Usuario";
  const createdAt = new Date(user.created_at).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // extraemos los datos de la orden de cada usuario segun su id
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id);
  if (ordersError) {
    console.error("Error al cargar las órdenes:", ordersError.message);
  }
  if (!orders) {
    console.error("Órdenes no encontradas");
  }

  // extraemos el product id de cada orders_items segun su order_id
  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orders![0]?.id);



  if (!user || error || !profileData) {
    return redirect("/sign-in");
  }
  return (
    <main className="min-h-screen bg-beige-50">
      {/* Header decorative wave */}
      <div className="relative h-40 bg-beige-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 80 80"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="grid"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="#9C8772"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="absolute bottom-0 w-full h-full"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0z"
              fill="#F5F1EA"
            ></path>
          </svg>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile sidebar */}
          <Card className="bg-white border-beige-200 shadow-sm h-fit">
            <CardHeader className="relative pb-0 pt-6 px-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-beige-300 to-beige-500 opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                    <Avatar className="h-24 w-24 shadow-md my-2">
                      <AvatarImage
                        src={
                          user?.user_metadata?.avatar_url ||
                          "https://github.com/shadcn.png"
                        }
                        alt="Avatar del usuario"
                        className="object-cover"
                      />
                      <AvatarFallback>
                        <User2Icon className="w-8 h-8 text-gray-500" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <Edit className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <h1 className="mt-4 text-2xl font-serif text-beige-800">
                  {fullName}
                </h1>
                <p className="text-beige-600">{email}</p>

                <div className="w-full mt-6 pt-4 border-t border-beige-100">
                  <div className="flex items-center text-sm text-beige-600 mb-2">
                    <User className="w-4 h-4 mr-2 text-beige-500" />
                    <span>Cliente desde {createdAt}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 py-4">
              <nav className="space-y-1">
                <div className="pt-4 mt-4 border-t border-beige-100">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-beige-200 text-beige-700 hover:bg-beige-100 hover:text-beige-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </div>
              </nav>
            </CardContent>
          </Card>

          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-beige-200 shadow-sm mb-8">
              <CardHeader className="pb-2">
                <h2 className="text-xl font-serif text-beige-800">
                  Información Personal
                </h2>
                <p className="text-sm text-beige-600">
                  Gestiona tu información personal y cuenta
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-beige-700 mb-1">
                        Correo Electrónico
                      </label>
                      <div className="p-2 bg-beige-50 rounded border border-beige-200 text-beige-800">
                        {email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-1">
                      ID de Usuario
                    </label>
                    <div className="p-2 bg-beige-50 rounded border border-beige-200 text-beige-800 font-mono text-sm">
                      {user.id.slice(0, 8)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-beige-700 mb-1">
                      Telefono Del usuario
                    </label>
                    <div className="p-2 bg-beige-50 rounded border border-beige-200 text-beige-800 font-mono text-sm">
                      {profileData.user_phone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="bg-beige-100 text-beige-700 p-0 h-auto">
                <TabsTrigger
                  value="orders"
                  className="py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-beige-800 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-beige-700"
                >
                  Mis Pedidos
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="py-2.5 px-4 data-[state=active]:bg-white data-[state=active]:text-beige-800 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-beige-700"
                >
                  Direcciones
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                <Card className="bg-white border-beige-200 shadow-sm">
                  <CardContent className="p-0">
                    {orders?.length! > 0 ? (
                      <div className="divide-y divide-beige-100">
                        {orders?.map((order) => (
                          <div
                            key={order.id}
                            className="p-4 hover:bg-beige-50 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <ShoppingBag className="w-4 h-4 text-beige-500 mr-2" />
                                <span className="font-medium text-beige-800">
                                  {order.id}
                                </span>
                                <span className="text-sm text-beige-600 ml-2">
                                  {order.product_id}
                                </span>
                              </div>
                              <Badge status={order.status} />
                              <Link
                                href={`/perfil/pedidos/${order.id}`}
                                className="ml-4"
                              >
                                <Button
                                  variant="link"
                                  className="text-sm text-beige-700 hover:text-beige-800"
                                >
                                  Ver detalles
                                </Button>
                              </Link>
                            </div>
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center text-beige-600">
                                <Calendar className="w-3 h-3 mr-1" />
                                {order.created_at.slice(0, 10)}
                              </div>
                              <span className="font-medium text-beige-700">
                                {order.total}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <ShoppingBag className="w-12 h-12 text-beige-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-beige-800 mb-1">
                          No hay pedidos
                        </h3>
                        <p className="text-beige-600 mb-4">
                          Aún no has realizado ningún pedido.
                        </p>
                        <Button className="bg-beige-700 hover:bg-beige-800 text-beige-50">
                          <Link href="/tienda">Ir a la tienda</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* <TabsContent value="addresses" className="mt-4">
                <Card className="bg-white border-beige-200 shadow-sm">
                  <CardContent className="p-4">
                    {mockAddresses.length > 0 ? (
                      <div className="space-y-4">
                        {mockAddresses.map((address) => (
                          <div
                            key={address.id}
                            className="p-4 border border-beige-200 rounded-md relative"
                          >
                            {address.isDefault && (
                              <span className="absolute top-2 right-2 text-xs bg-beige-100 text-beige-700 px-2 py-0.5 rounded-full">
                                Predeterminada
                              </span>
                            )}
                            <h3 className="font-medium text-beige-800">
                              {address.name}
                            </h3>
                            <p className="text-beige-600 mt-1">
                              {address.address}
                            </p>
                            <div className="mt-3 pt-3 border-t border-beige-100 flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-beige-200 text-beige-700 hover:bg-beige-100"
                              >
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-beige-200 text-beige-700 hover:bg-beige-100"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          className="w-full border-dashed border-beige-300 text-beige-600 hover:bg-beige-50 mt-4"
                        >
                          <MapPin className="w-4 h-4 mr-2" />
                          Añadir nueva dirección
                        </Button>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <MapPin className="w-12 h-12 text-beige-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-beige-800 mb-1">
                          No hay direcciones
                        </h3>
                        <p className="text-beige-600 mb-4">
                          Aún no has añadido ninguna dirección de envío.
                        </p>
                        <Button className="bg-beige-700 hover:bg-beige-800 text-beige-50">
                          Añadir dirección
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}

// Badge component for order status
function Badge({ status }: { status: string }) {
  let bgColor = "bg-beige-100";
  let textColor = "text-beige-700";

  if (status === "Entregado") {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
  } else if (status === "En camino") {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
  } else if (status === "Pendiente") {
    bgColor = "bg-amber-100";
    textColor = "text-amber-700";
  } else if (status === "Cancelado") {
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
}
