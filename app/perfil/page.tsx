import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ShoppingBag, MapPin, ShieldCheck } from "lucide-react";
import { Order } from "@/lib/types";

function BadgeOrderStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "Pendiente",
    preparing: "Preparando",
    shipped: "En camino",
    ready_for_pickup: "Listo para retirar",
    completed: "Completado",
    cancelled: "Cancelado",
    paid: "Pagado",
  };

  const cls: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700",
    preparing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-blue-100 text-blue-800",
    ready_for_pickup: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    paid: "bg-emerald-100 text-emerald-800",
  };

  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${cls[status] ?? cls.pending}`}>
      {map[status] ?? status}
    </span>
  );
}

export default async function Perfil() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profileData) redirect("/login");

  const email = user.email;
  const avatar = user.user_metadata?.avatar_url || "/placeholder.svg";
  const fullName = user.user_metadata?.full_name || profileData.username;
  const createdAt = new Date(user.created_at).toLocaleDateString("es-AR");

  const { data: orders } = (await supabase
    .from("orders")
    .select(
      `
      *,
      items:order_items (
        *,
        product:product_id (*)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })) as { data: Order[] | null };

  const totalOrders = orders?.length ?? 0;
  const lastOrder = orders?.[0];

  return (
    <main className="min-h-screen bg-beige-50">
      <section className="relative overflow-hidden border-b border-[rgba(125,91,63,0.12)] bg-[linear-gradient(180deg,rgba(236,227,214,0.92),rgba(245,240,231,0.72))]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(177,146,113,0.28),transparent_62%)]" />
        <div className="container relative mx-auto px-4 py-12">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
            <div className="space-y-4">
              <Badge className="w-fit border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)] hover:bg-white/80">
                Mi cuenta
              </Badge>
              <div className="space-y-3">
                <h1 className="font-serif text-4xl text-[var(--color-ink)] md:text-5xl">
                  Hola, {fullName}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                  Desde acá podés seguir tus pedidos, revisar tu historial y mantener una vista clara de tu actividad en la tienda.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Pedidos</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{totalOrders}</p>
                <p className="text-sm text-[var(--color-muted)]">registrados en tu cuenta</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Último estado</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                  {lastOrder ? (lastOrder.order_status || lastOrder.status || "pending") : "Sin pedidos"}
                </p>
                <p className="text-sm text-[var(--color-muted)]">tu actividad más reciente</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">Cliente desde</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{createdAt}</p>
                <p className="text-sm text-[var(--color-muted)]">cuenta activa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <Card className="surface-border h-fit overflow-hidden rounded-[1.8rem] bg-white shadow-sm">
            <CardHeader className="pt-8 text-center">
              <Avatar className="mx-auto h-24 w-24 border border-[rgba(125,91,63,0.14)]">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-[rgba(125,91,63,0.08)] text-[var(--color-accent)]">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 font-serif text-2xl text-beige-800">{fullName}</h2>
              <p className="text-beige-600">{email}</p>

              <div className="mt-6 space-y-3 rounded-[1.4rem] border border-[rgba(125,91,63,0.12)] bg-[rgba(245,240,231,0.7)] p-4 text-left text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <p>Cliente desde {createdAt}</p>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <p>Tus pedidos quedan disponibles para consulta incluso después de pagar.</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <p>La sección de direcciones queda lista para la próxima mejora.</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="lg:col-span-2">
            <Tabs defaultValue="orders">
              <TabsList className="h-auto rounded-2xl bg-beige-100 p-1.5">
                <TabsTrigger value="orders" className="rounded-xl px-4 py-2.5">Mis pedidos</TabsTrigger>
                <TabsTrigger value="addresses" className="rounded-xl px-4 py-2.5">Direcciones</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="mt-4">
                <Card className="surface-border overflow-hidden rounded-[1.8rem] bg-white shadow-sm">
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

              <TabsContent value="addresses" className="mt-4">
                <Card className="surface-border rounded-[1.8rem] bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h3 className="font-serif text-2xl text-[var(--color-ink)]">Direcciones</h3>
                      <p className="max-w-xl text-sm leading-7 text-[var(--color-muted)]">
                        Esta sección todavía está en construcción. Cuando la activemos, vas a poder guardar tus datos de entrega para acelerar futuras compras.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="p-5 transition hover:bg-beige-50/80">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-beige-600" />
            <span className="font-medium text-beige-800">Pedido #{order.id.slice(-6)}</span>
            <BadgeOrderStatus status={order.order_status || order.status || "pending"} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-beige-600">
            <span className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(order.created_at).toLocaleDateString("es-AR")}
            </span>
            <span>{itemCount} producto{itemCount === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 md:block md:text-right">
          <p className="text-lg font-semibold text-beige-800">${order.total ?? 0}</p>
          <Link href={`/perfil/pedidos/${order.id}`}>
            <Button variant="link" className="px-0 text-beige-700">
              Ver detalles
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="p-8 text-center">
      <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-beige-300" />
      <h3 className="mb-1 text-lg font-medium text-beige-800">Todavía no tenés pedidos</h3>
      <p className="mb-4 text-beige-600">Cuando hagas tu primera compra, la vas a poder seguir desde acá.</p>

      <Button className="bg-beige-700 text-beige-50" asChild>
        <Link href="/tienda">Ir a la tienda</Link>
      </Button>
    </div>
  );
}
