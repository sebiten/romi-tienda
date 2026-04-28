"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, PackageCheck, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import { createClient } from "@/lib/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  size?: string;
  product_id: string;
  color?: string;
  quantity: number;
}

interface CartPageProps {
  user: User | null;
}

const CartItemRow = memo(
  ({
    item,
    updateQuantity,
    removeFromCart,
  }: {
    item: CartItem;
    updateQuantity: (id: string, quantity: number) => void;
    removeFromCart: (id: string) => void;
  }) => (
    <li className="p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-28 w-full flex-shrink-0 overflow-hidden rounded-xl bg-beige-100 shadow-sm sm:w-24">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 96px"
            loading="lazy"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-beige-800">{item.name}</h3>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-beige-600">
              {item.size && <p>Talle: {item.size}</p>}
              {item.color && <p>Color: {item.color}</p>}
            </div>

            <div className="mt-2 flex items-center sm:hidden">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="mr-2 text-sm text-beige-500 line-through">
                  ${item.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
              <span className="text-lg font-medium text-beige-800">
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center justify-between gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center overflow-hidden rounded-lg border border-beige-300">
              <button
                className="flex h-10 w-10 items-center justify-center bg-beige-100 text-beige-700 active:scale-95"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                aria-label={`Reducir cantidad de ${item.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>

              <span className="w-10 text-center text-lg font-medium text-beige-900">
                {item.quantity}
              </span>

              <button
                className="flex h-10 w-10 items-center justify-center bg-beige-100 text-beige-700 active:scale-95"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label={`Aumentar cantidad de ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden flex-col items-end sm:flex">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-beige-500 line-through">
                  ${item.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
              <span className="text-lg font-medium text-beige-800">
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>

            <button
              className="text-beige-600 transition-colors hover:text-red-600 active:scale-95"
              onClick={() => removeFromCart(item.id)}
              aria-label={`Eliminar ${item.name} del carrito`}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  ),
);

CartItemRow.displayName = "CartItemRow";

export default function CartPage({ user }: CartPageProps) {
  const {
    items,
    subtotal,
    shipping,
    discount,
    total,
    removeFromCart,
    updateQuantity,
    calculateTotals,
  } = useCartStore();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    cp: "",
  });

  useEffect(() => {
    const syncCartStock = async () => {
      if (items.length === 0) return;

      const supabase = createClient();
      let removedSomething = false;

      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("variants")
          .eq("id", item.product_id)
          .single();

        if (!product) continue;

        const variant = product.variants?.find(
          (v: any) =>
            v.color?.toLowerCase() === item.color?.toLowerCase() &&
            v.size === item.size,
        );

        const stock = variant?.stock ?? 0;

        if (stock <= 0) {
          removeFromCart(item.id);
          removedSomething = true;
        }
      }

      if (removedSomething) {
        toast.error("Algunos productos se quitaron del carrito porque ya no tenían stock.");
      }
    };

    syncCartStock();
  }, []);

  const handleMercadoPagoCheckout = useCallback(async () => {
    if (!user) return router.push("/login");
    if (items.length === 0) return;

    if (
      !shippingData.name ||
      !shippingData.phone ||
      !shippingData.address ||
      !shippingData.city ||
      !shippingData.cp
    ) {
      alert("Por favor completá todos los datos de entrega.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("variants")
          .eq("id", item.product_id)
          .single();

        if (!product?.variants) continue;

        const variant = product.variants.find(
          (v: any) =>
            v.size?.toLowerCase() === item.size?.toLowerCase() &&
            v.color?.toLowerCase() === item.color?.toLowerCase(),
        );

        const available = variant?.stock ?? 0;

        if (available < item.quantity) {
          removeFromCart(item.id);
          alert(`El producto "${item.name}" ya no tiene stock suficiente.`);
          setLoading(false);
          return;
        }
      }

      const mpItems = items.map((item) => ({
        product_id: item.product_id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        size: item.size,
        color: item.color,
      }));

      const res = await fetch("/api/mercadopago/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: mpItems,
          shippingData,
          shippingCost: shipping,
          discount,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No pudimos iniciar el pago.");
        setLoading(false);
        return;
      }

      window.location.href = data.init_point;
    } catch (error) {
      console.error("Error en checkout MP:", error);
    } finally {
      setLoading(false);
    }
  }, [user, items, shippingData, router, shipping, discount, removeFromCart]);

  useEffect(() => {
    const fetchShipping = async () => {
      if (shippingData.cp.length < 3) return;

      try {
        const res = await fetch("/api/shipping/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cp: shippingData.cp }),
        });

        const data = await res.json();

        if (res.ok) {
          useCartStore.setState({ shipping: data.cost });
          setShippingData((prev) => ({
            ...prev,
            province: data.province,
          }));
        }
      } catch (err) {
        console.error("Error obteniendo envío:", err);
      }
    };

    fetchShipping();
  }, [shippingData.cp]);

  useEffect(() => {
    calculateTotals();
  }, [items, shipping, discount, calculateTotals]);

  if (items.length === 0) return <EmptyCart />;

  return (
    <main className="min-h-screen bg-beige-50 px-4 py-12">
      <div className="container mx-auto max-w-7xl">
        <section className="surface-card surface-border mb-8 overflow-hidden rounded-[2rem] px-6 py-8 shadow-sm md:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
                Checkout seguro
              </span>
              <div className="space-y-3">
                <h1 className="font-serif text-3xl text-[var(--color-ink)] md:text-5xl">
                  Tu carrito
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
                  Revisá tu selección, completá los datos de entrega y avanzá al pago con una experiencia más clara y ordenada.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[380px]">
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Productos
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">{items.length}</p>
                <p className="text-sm text-[var(--color-muted)]">en tu carrito</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Envío
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                  {shipping === 0 ? "Gratis" : `$${shipping.toLocaleString("es-AR")}`}
                </p>
                <p className="text-sm text-[var(--color-muted)]">según tu código postal</p>
              </div>
              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Total
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                  ${total.toLocaleString("es-AR")}
                </p>
                <p className="text-sm text-[var(--color-muted)]">con cálculo actualizado</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-6 grid gap-3 lg:hidden">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-950">
            <p className="mb-2 font-semibold">Cómo finalizar tu compra</p>
            <p className="leading-6">
              Revisá tus productos, completá la dirección y luego tocá <strong>Pagar con Mercado Pago</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="overflow-hidden rounded-2xl border-beige-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <ul className="divide-y divide-beige-100">
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24 rounded-2xl border-beige-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-[var(--color-ink)]">
                      Datos de entrega
                    </h3>
                    <p className="text-sm leading-6 text-[var(--color-muted)]">
                      Usamos esta información para calcular el envío y preparar tu pedido sin demoras.
                    </p>
                  </div>

                  <Input placeholder="Nombre y apellido" className="bg-beige-50" value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} />
                  <Input placeholder="Teléfono de contacto" className="bg-beige-50" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} />
                  <Input placeholder="Dirección" className="bg-beige-50" value={shippingData.address} onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })} />
                  <Input placeholder="Ciudad" className="bg-beige-50" value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} />
                  <Input placeholder="Provincia" className="bg-beige-50" value={shippingData.province} onChange={(e) => setShippingData({ ...shippingData, province: e.target.value })} />
                  <Input placeholder="Código postal" className="bg-beige-50" value={shippingData.cp} onChange={(e) => setShippingData({ ...shippingData, cp: e.target.value })} />
                </div>

                <Separator />

                <div className="space-y-2 text-beige-800">
                  {shippingData.cp.length >= 3 && (
                    <p className="mt-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
                      Región detectada: <strong>{shippingData.province || "Detectando..."}</strong>. Envío estimado: <strong>${shipping.toLocaleString("es-AR")}</strong>
                    </p>
                  )}

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString("es-AR")}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>- ${discount.toLocaleString("es-AR")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString("es-AR")}`}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>${total.toLocaleString("es-AR")}</span>
                  </div>
                </div>

                <div className="grid gap-3 rounded-[1.4rem] border border-[rgba(125,91,63,0.12)] bg-[rgba(255,255,255,0.6)] p-4 text-sm text-[var(--color-muted)]">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <p>Calculamos el envío según tu código postal para mostrarte un total real antes de pagar.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <p>El pago se procesa por Mercado Pago y la orden se valida desde el servidor.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <PackageCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <p>El stock se vuelve a verificar antes de enviarte al checkout.</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 p-6 pt-0">
                {user ? (
                  <Button className="flex w-full items-center justify-center gap-1 rounded-xl bg-[#009EE3] py-4 text-sm font-semibold text-white shadow-md transition hover:bg-[#007FB3] active:scale-95" onClick={handleMercadoPagoCheckout} disabled={loading}>
                    {loading ? "Procesando..." : (
                      <>
                        <Image src="/logompsolomano.png" alt="Mercado Pago" width={26} height={26} className="rounded-none" />
                        Pagar con Mercado Pago
                      </>
                    )}
                  </Button>
                ) : (
                  <Button className="w-full rounded-xl bg-beige-700 py-4 text-lg text-white" asChild>
                    <Link href="/login">Iniciar sesión para pagar</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 z-50 w-full border-t border-beige-200 bg-white p-4 shadow-lg lg:hidden">
        <div className="mb-3 flex justify-between font-medium text-beige-800">
          <span>Total</span>
          <span>${total.toLocaleString("es-AR")}</span>
        </div>

        <Button className="w-full rounded-lg bg-[#009EE3] py-3 font-semibold text-white active:scale-95" onClick={handleMercadoPagoCheckout}>
          <Image src="/logompsolomano.png" alt="Mercado Pago" width={26} height={26} className="mr-2 rounded-none" />
          Finalizar compra
        </Button>
      </div>
    </main>
  );
}

function EmptyCart() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-beige-100 p-8">
          <ShoppingBag className="h-16 w-16 text-beige-400" strokeWidth={1.5} />
        </div>

        <h2 className="mb-3 text-balance font-serif text-3xl text-beige-800 md:text-4xl">
          Tu carrito está vacío
        </h2>

        <p className="mb-8 max-w-md text-base text-beige-600 text-pretty md:text-lg">
          Elegí tus productos favoritos y volvé acá para revisar la compra, calcular el envío y avanzar al pago.
        </p>

        <Button asChild className="rounded-xl bg-beige-700 px-8 py-6 text-lg text-white shadow-sm transition-all hover:bg-beige-800 hover:shadow-md">
          <Link href="/tienda">Ir a la tienda</Link>
        </Button>
      </div>
    </div>
  );
}
