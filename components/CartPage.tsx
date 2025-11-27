"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import { createOrderAction } from "@/app/admin/actions";

// Interfaces
interface CartItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  originalPrice?: number;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartPageProps {
  user: User | null;
}

// ================ ITEM DEL CARRITO ================
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
        <div className="relative w-full sm:w-24 h-24 bg-beige-50 rounded-md overflow-hidden flex-shrink-0">
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
            <h3 className="font-medium text-beige-800">{item.name}</h3>

            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-beige-600">
              {item.size && <p>Talla: {item.size}</p>}
              {item.color && <p>Color: {item.color}</p>}
            </div>

            <div className="sm:hidden mt-2 flex items-center">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm line-through text-beige-500 mr-2">
                  ${item.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
              <span className="font-medium text-beige-800">
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Cantidad */}
          <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2">
            <div className="flex items-center border border-beige-200 rounded-md">
              <button
                className="w-8 h-8 flex items-center justify-center text-beige-600 hover:text-beige-800 hover:bg-beige-100 transition-colors"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="w-8 text-center text-beige-800">
                {item.quantity}
              </span>

              <button
                className="w-8 h-8 flex items-center justify-center text-beige-600 hover:text-beige-800 hover:bg-beige-100 transition-colors"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Precios */}
            <div className="hidden sm:flex flex-col items-end">
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm line-through text-beige-500">
                  ${item.originalPrice.toLocaleString("es-AR")}
                </span>
              )}
              <span className="font-medium text-beige-800">
                ${item.price.toLocaleString("es-AR")}
              </span>
            </div>

            {/* Eliminar */}
            <button
              className="text-beige-600 hover:text-beige-800 transition-colors"
              onClick={() => removeFromCart(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
);

CartItemRow.displayName = "CartItemRow";

// ================ PÁGINA PRINCIPAL ================
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

  // 🏠 Datos de envío
  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    cp: "",
  });

  // ================ MERCADO PAGO CHECKOUT ================
  const handleMercadoPagoCheckout = useCallback(async () => {
    if (!user) return router.push("/sign-in");

    if (items.length === 0) return;

    // VALIDACIÓN DE DATOS DE ENVÍO
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
          shipping: shippingData, // enviar datos de envío
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      window.location.href = data.init_point;
    } catch (error) {
      console.error("Error en checkout MP:", error);
    } finally {
      setLoading(false);
    }
  }, [user, items, shippingData, router]);

  // WhatsApp — no se modifica
  const ownerPhone = "543872226885";

  useEffect(() => {
    calculateTotals();
  }, [items, calculateTotals]);

  const handleSendWhatsApp = useCallback(async () => {
    if (!user) return;

    setLoading(true);

    try {
      let orderIdToUse = orderId;

      if (!orderIdToUse) {
        const cartItems = items.map((item) => ({
          productId: item.id.split("_")[0],
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
          name: item.name,
        }));

        orderIdToUse = await createOrderAction({
          userId: user.id,
          items: cartItems,
          phoneNumber: ownerPhone,
        });

        setOrderId(orderIdToUse);
      }

      const orderDetails = items
        .map(
          (item) =>
            `${item.name} - ${item.size ? `Talla: ${item.size}, ` : ""}${item.color ? `Color: ${item.color}, ` : ""
            }Cantidad: ${item.quantity}`
        )
        .join("\n");

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodeURIComponent(
        `Hola! Pedido ID: ${orderIdToUse}\n\n${orderDetails}\n\nTotal: $${total.toLocaleString(
          "es-AR"
        )}`
      )}`;

      const newWindow = window.open(whatsappUrl, "_blank");
      if (!newWindow) window.location.href = whatsappUrl;

      clearCart();
      router.push("/perfil");
    } finally {
      setLoading(false);
    }
  }, [user, orderId, items, total, clearCart, router]);

  if (items.length === 0) return <EmptyCart />;

  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">
            Carrito de Compras
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* =================== ITEMS =================== */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-beige-200 shadow-sm overflow-hidden">
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

          {/* =================== RESUMEN =================== */}
          <div>
            <Card className="bg-white border-beige-200 shadow-sm sticky top-24">
              <CardContent className="p-6 space-y-4">

                {/* 🏠 DATOS DE ENVÍO */}
                <div className="space-y-3">
                  <h3 className="font-medium text-beige-800">Datos de Envío</h3>

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
                    className="w-full bg-blue-400 hover:bg-blue-700 text-white"
                    onClick={handleMercadoPagoCheckout}
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "Pagar con Mercado Pago"}
                  </Button>
                ) : (
                  <Button className="bg-beige-700 text-white w-full" asChild>
                    <Link href="/sign-in">Iniciar Sesión</Link>
                  </Button>
                )}

                {/* {user && (
                  <Button
                    className="w-full bg-beige-700 hover:bg-beige-800 text-white"
                    onClick={handleSendWhatsApp}
                    disabled={loading}
                  >
                    Enviar Pedido por WhatsApp
                  </Button>
                )} */}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

// =================== CARRITO VACÍO ===================
function EmptyCart() {
  return (
    <div className="container mx-auto max-w-7xl py-12 px-4 text-center">
      <h2 className="text-2xl text-beige-800 mb-4">Tu carrito está vacío</h2>

      <Button
        asChild
        className="bg-beige-700 hover:bg-beige-800 text-white px-8 py-6"
      >
        <Link href="/tienda">Explorar productos</Link>
      </Button>
    </div>
  );
}
