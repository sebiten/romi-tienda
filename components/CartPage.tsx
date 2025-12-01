"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import { createOrderAction } from "@/app/admin/actions";
import { createClient } from "@/lib/client";
import { toast } from "sonner";

// Interfaces
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

/* =====================================
   🛒 ITEM DEL CARRITO
===================================== */
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
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Imagen */}
        <div className="relative w-full sm:w-24 h-28 bg-beige-100 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
          <Image
            src={item.image || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 96px"
            loading="lazy"
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h3 className="font-medium text-beige-800 text-lg">{item.name}</h3>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-beige-600">
              {item.size && <p>Talla: {item.size}</p>}
              {item.color && <p>Color: {item.color}</p>}
            </div>

            {/* Precio en mobile */}
            <div className="sm:hidden mt-2 flex items-center">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm line-through text-beige-500 mr-2">
                  ${item.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
              <span className="font-medium text-beige-800 text-lg">
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Cantidad */}
          <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2">
            <div className="flex items-center border border-beige-300 rounded-lg overflow-hidden">
              <button
                className="w-10 h-10 flex items-center justify-center text-beige-700 bg-beige-100 active:scale-95"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>

              <span className="w-10 text-center text-beige-900 font-medium text-lg">
                {item.quantity}
              </span>

              <button
                className="w-10 h-10 flex items-center justify-center text-beige-700 bg-beige-100 active:scale-95"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Precio en desktop */}
            <div className="hidden sm:flex flex-col items-end">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm line-through text-beige-500">
                  ${item.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
              <span className="text-lg font-medium text-beige-800">
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>

            {/* Eliminar */}
            <button
              className="text-beige-600 hover:text-red-600 transition-colors active:scale-95"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
);

CartItemRow.displayName = "CartItemRow";

/* =====================================
   🛒 PÁGINA PRINCIPAL
===================================== */
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
    clearCart,
  } = useCartStore();

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const syncCartStock = async () => {
      if (items.length === 0) return;

      const supabase = createClient();
      let removedSomething = false;

      for (const item of items) {
        // Buscar el producto
        const { data: product } = await supabase
          .from("products")
          .select("variants")
          .eq("id", item.product_id)
          .single();

        if (!product) continue;

        const variant = product.variants?.find(
          (v: any) =>
            v.color?.toLowerCase() === item.color?.toLowerCase() &&
            v.size === item.size
        );

        const stock = variant?.stock ?? 0;

        if (stock <= 0) {
          removeFromCart(item.id);
          removedSomething = true;
        }
      }

      if (removedSomething) {
        toast.error(
          "Algunos productos fueron eliminados del carrito por falta de stock."
        );
      }
    };

    syncCartStock();
  }, []);

  // Datos de envío
  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    cp: "",
  });

  // MERCADO PAGO
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
      alert("Por favor completa todos los datos de envío.");
      return;
    }

    setLoading(true);

    try {
      // ===========================
      // VALIDACIÓN DE STOCK (FRONTEND)
      // ===========================
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
            v.color?.toLowerCase() === item.color?.toLowerCase()
        );

        const available = variant?.stock ?? 0;

        if (available < item.quantity) {
          removeFromCart(item.id);
          alert(`El producto "${item.name}" no tiene stock suficiente.`);
          setLoading(false);
          return;
        }

      }

      // ===========================
      // CREAR PREFERENCIA MP
      // ===========================
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
        alert(data.error || "Error al crear la preferencia de pago.");
        setLoading(false);
        return;
      }

      window.location.href = data.init_point;

    } catch (error) {
      console.error("Error en checkout MP:", error);
    } finally {
      setLoading(false);
    }
  }, [user, items, shippingData, router]);

  useEffect(() => {
    calculateTotals();
  }, [items, calculateTotals]);

  if (items.length === 0) return <EmptyCart />;

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">
            Carrito de Compras
          </h1>

          {/* 🧭 GUÍA MÓVIL */}
          <div className="lg:hidden mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 text-sm">
            <p className="font-semibold mb-1">¿Cómo finalizar la compra?</p>
            <ul className="space-y-1">
              <li>1️⃣ Revisá tus productos aquí abajo.</li>
              <li>2️⃣ Completá tu dirección de envío.</li>
              <li>3️⃣ Tocá <strong>“Pagar con Mercado Pago”</strong>.</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ITEMS */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-beige-200 shadow-sm overflow-hidden rounded-2xl">
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

          {/* RESUMEN */}
          <div>
            <Card className="bg-white border-beige-200 shadow-sm sticky top-24 rounded-2xl">
              <CardContent className="p-6 space-y-4">
                {/* DATOS DE ENVÍO */}
                <div className="space-y-3">
                  <h3 className="font-medium text-beige-800 text-lg">
                    Datos de Envío
                  </h3>

                  <Input
                    placeholder="Nombre completo"
                    className="bg-beige-50"
                    value={shippingData.name}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Teléfono"
                    className="bg-beige-50"
                    value={shippingData.phone}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, phone: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Dirección"
                    className="bg-beige-50"
                    value={shippingData.address}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        address: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Ciudad"
                    className="bg-beige-50"
                    value={shippingData.city}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, city: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Provincia"
                    className="bg-beige-50"
                    value={shippingData.province}
                    onChange={(e) =>
                      setShippingData({
                        ...shippingData,
                        province: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Código Postal"
                    className="bg-beige-50"
                    value={shippingData.cp}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, cp: e.target.value })
                    }
                  />
                </div>

                <Separator />

                {/* TOTALES */}
                <div className="text-beige-800 space-y-2">
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
                    <span>
                      {shipping === 0
                        ? "Gratis"
                        : `$${shipping.toLocaleString("es-AR")}`}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${total.toLocaleString("es-AR")}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex flex-col gap-3">
                {user ? (
                  <Button
                    className="
        w-full py-4 text-sm font-semibold rounded-xl shadow-md transition 
        bg-[#009EE3] hover:bg-[#007FB3] active:scale-95 text-white 
        flex items-center justify-center gap-1  
      "
                    onClick={handleMercadoPagoCheckout}
                    disabled={loading}
                  >
                    {loading ? (
                      "Procesando..."
                    ) : (
                      <>
                        {/* LOGO MERCADO PAGO */}
                        <Image
                          src="/logompsolomano.png"
                          alt="Mercado Pago"
                          width={26}
                          height={26}
                          className="rounded-none"
                        />
                        Pagar con Mercado Pago
                      </>
                    )}
                  </Button>
                ) : (
                  <Button className="bg-beige-700 text-white w-full py-4 text-lg rounded-xl" asChild>
                    <Link href="/login">Iniciar Sesión</Link>
                  </Button>
                )}
              </CardFooter>

            </Card>
          </div>
        </div>
      </div>

      {/* BARRA FIJA — sólo móvil */}
      <div className="lg:hidden z-50 fixed bottom-0 left-0 w-full bg-white border-t border-beige-200 p-4 shadow-lg">
        <div className="flex justify-between mb-3 text-beige-800 font-medium">
          <span>Total</span>
          <span>${total.toLocaleString("es-AR")}</span>
        </div>

        <Button
          className="w-full py-3 bg-[#009EE3] text-white font-semibold rounded-lg active:scale-95"
          onClick={handleMercadoPagoCheckout}
        >
          <Image
            src="/logompsolomano.png"
            alt="Mercado Pago"
            width={26}
            height={26}
            className="rounded-none mr-2"
          />
          Finalizar compra
        </Button>
      </div>
    </main>
  );
}

/* =====================================
   🛒 CARRITO VACÍO
===================================== */
function EmptyCart() {
  return (
    <div className="container mx-auto max-w-2xl py-16 px-4">
      <div className="flex flex-col items-center justify-center text-center">
        {/* Icon Container */}
        <div className="mb-6 rounded-full bg-beige-100 p-8">
          <ShoppingBag className="h-16 w-16 text-beige-400" strokeWidth={1.5} />
        </div>

        {/* Heading */}
        <h2 className="font-serif text-3xl md:text-4xl text-beige-800 mb-3 text-balance">Tu carrito está vacío</h2>

        {/* Description */}
        <p className="text-beige-600 text-base md:text-lg mb-8 max-w-md text-pretty">
          Descubre nuestra colección de productos y encuentra algo especial para ti
        </p>

        {/* CTA Button */}
        <Button
          asChild
          className="bg-beige-700 hover:bg-beige-800 text-white px-8 py-6 text-lg rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <Link href="/tienda">Explorar productos</Link>
        </Button>
      </div>
    </div>
  )
}