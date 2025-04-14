"use client";

import { useEffect, useState } from "react";
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
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/store/cartStore";
import { createOrderAction } from "@/app/admin/actions";

// Ejemplo de estructura que puede tener cada ítem del carrito
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

// Props para tu componente
interface CartPageProps {
  user: User | null;
}

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
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

  // Teléfono del negocio (formato internacional, sin '+')
  const ownerPhone = "543886575936";

  // ID del usuario (si estás usando Supabase u otro)
  const userId = user?.id ?? undefined;

  // 1. Pre-crea la orden si el carrito no está vacío y no tenemos orden pendiente
  useEffect(() => {
    async function preCreateOrder() {
      try {
        if (items.length > 0 && !pendingOrderId) {
          const cartItems = items.map((item) => ({
            productId: item.id.split("_")[0],
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          }));
          // Llamamos a la acción que crea la orden en el servidor (AJUSTA según tu lógica)
          const orderIdFromServer = await createOrderAction({
            userId,
            items: cartItems,
            phoneNumber: ownerPhone,
          });
          setPendingOrderId(orderIdFromServer);
        }
      } catch (err) {
        console.error("Error pre-creating order:", err);
      }
    }

    preCreateOrder();
  }, [items, pendingOrderId, userId, ownerPhone]);

  // 2. Función para enviar el pedido vía Cloud API y, en caso de error, redirigir con el enlace manual de WhatsApp
  async function handleSendWhatsApp() {
    setLoading(true);
  
    // Aseguramos construir el mensaje de WhatsApp desde el principio
    const orderDetails = items
      .map(
        (item) =>
          `${item.name} - Talla: ${item.size}, Color: ${item.color}, Cantidad: ${item.quantity}`
      )
      .join("\n");
    
    // Se usa la orden pendiente o se crea una nueva
    let orderIdToUse = pendingOrderId;
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
        userId,
        items: cartItems,
        phoneNumber: ownerPhone,
      });
    }
  
    // Construir el mensaje a enviar
    const textToSend = `Hola, me gustaría hacer este pedido!\nPedido con ID: ${orderIdToUse}\n\n${orderDetails}\n\nTotal: $${total.toLocaleString("es-AR")}`;
  
    try {
      const res = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: ownerPhone,
          clientName: user?.user_metadata.full_name || "Cliente",
          orderId: orderIdToUse,
          cartDetails: items.map((item) => `${item.name} (${item.quantity})`).join(", "),
          total: total.toLocaleString("es-AR"),
        }),
      });
  
      // Si la respuesta no es exitosa, se redirige al enlace manual de WhatsApp
      if (!res.ok) {
        // Puedes eliminar este console.error si lo consideras innecesario
        const errorData = await res.json();
        console.error("Error al enviar mensaje vía API:", errorData);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodeURIComponent(textToSend)}`;
        window.location.href = whatsappUrl;
        return;
      }
  
      // En caso de éxito, se limpia el carrito y se redirige a perfil
      clearCart();
      router.push("/perfil");
      // Opcional: podrías notificar que se envió correctamente sin interrumpir la redirección
      // alert(`Pedido #${orderIdToUse} enviado correctamente por WhatsApp.`);
    } catch (error: any) {
      console.error("Error al enviar pedido:", error.message);
      // En el catch, se redirige directamente al enlace manual de WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodeURIComponent(textToSend)}`;
      window.location.href = whatsappUrl;
    } finally {
      setLoading(false);
    }
  }
  

  // Recalcular totales cuando cambian los items
  useEffect(() => {
    calculateTotals();
  }, [items, calculateTotals]);

  // Render
  return (
    <main className="bg-beige-50 min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-beige-800 mb-2">
            Carrito de Compras
          </h1>
          <div className="flex items-center text-sm text-beige-600">
            <Link href="/" className="hover:text-beige-800 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span>Carrito</span>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-beige-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-beige-100/50 px-6 py-4 border-b border-beige-200">
                  <div className="flex justify-between items-center">
                    <h2 className="font-serif text-xl text-beige-800">
                      Productos
                    </h2>
                    <span className="text-sm text-beige-600">
                      {items.length}{" "}
                      {items.length === 1 ? "artículo" : "artículos"}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ul className="divide-y divide-beige-100">
                    {items.map((item) => (
                      <li key={item.id} className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          {/* Imagen */}
                          <div className="relative w-full sm:w-24 h-24 bg-beige-50 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Detalles */}
                          <div className="flex-1 flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-beige-800">
                                {item.name}
                              </h3>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-beige-600">
                                <p>Talla: {item.size}</p>
                                <p>Color: {item.color}</p>
                              </div>

                              {/* Mobile price */}
                              <div className="sm:hidden mt-2 flex items-center">
                                {item.originalPrice &&
                                  item.originalPrice > item.price && (
                                    <span className="text-sm line-through text-beige-500 mr-2">
                                      $
                                      {item.originalPrice.toLocaleString(
                                        "es-AR"
                                      )}
                                    </span>
                                  )}
                                <span className="font-medium text-beige-800">
                                  ${item.price.toLocaleString("es-AR")}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-2">
                              {/* Controles de cantidad */}
                              <div className="flex items-center border border-beige-200 rounded-md">
                                <button
                                  className="w-8 h-8 flex items-center justify-center text-beige-600 hover:text-beige-800 hover:bg-beige-100 transition-colors"
                                  aria-label="Disminuir cantidad"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-beige-800">
                                  {item.quantity}
                                </span>
                                <button
                                  className="w-8 h-8 flex items-center justify-center text-beige-600 hover:text-beige-800 hover:bg-beige-100 transition-colors"
                                  aria-label="Aumentar cantidad"
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Desktop price */}
                              <div className="hidden sm:flex flex-col items-end">
                                {item.originalPrice &&
                                  item.originalPrice > item.price && (
                                    <span className="text-sm line-through text-beige-500">
                                      $
                                      {item.originalPrice.toLocaleString(
                                        "es-AR"
                                      )}
                                    </span>
                                  )}
                                <span className="font-medium text-beige-800">
                                  ${item.price.toLocaleString("es-AR")}
                                </span>
                              </div>

                              {/* Eliminar */}
                              <button
                                className="text-beige-600 hover:text-beige-800 transition-colors"
                                aria-label="Eliminar producto"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="p-4 md:p-6 bg-beige-50/50 border-t border-beige-200">
                  <Button
                    variant="outline"
                    asChild
                    className="text-beige-700 border-beige-300 hover:bg-beige-100 hover:text-beige-800"
                  >
                    <Link href="/tienda" className="flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Continuar Comprando
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Resumen */}
            <div>
              <Card className="bg-white border-beige-200 shadow-sm sticky top-24">
                <CardHeader className="bg-beige-100/50 px-6 py-4 border-b border-beige-200">
                  <h2 className="font-serif text-xl text-beige-800">
                    Resumen del Pedido
                  </h2>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Coupon code */}
                  <div className="space-y-2">
                    <label
                      htmlFor="coupon"
                      className="text-sm font-medium text-beige-700"
                    >
                      Código de Descuento
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="coupon"
                        placeholder="Ingresa tu código"
                        className="bg-beige-50 border-beige-200 focus:border-beige-300 focus:ring-beige-300"
                      />
                      <Button
                        variant="outline"
                        className="border-beige-300 text-beige-700 hover:bg-beige-100 hover:text-beige-800"
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-beige-100 my-4" />

                  {/* Price breakdown */}
                  <div className="space-y-2 text-beige-800">
                    <div className="flex justify-between">
                      <span className="text-beige-600">Subtotal</span>
                      <span>${subtotal.toLocaleString("es-AR")}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-beige-600">Descuento</span>
                        <span className="text-green-600">
                          -${discount.toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-beige-600">Envío</span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        <span>${shipping.toLocaleString("es-AR")}</span>
                      )}
                    </div>

                    <Separator className="bg-beige-100 my-2" />

                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>${total.toLocaleString("es-AR")}</span>
                    </div>

                    {shipping === 0 && (
                      <div className="text-green-600 text-sm text-center mt-2">
                        ¡Felicidades! Tu pedido califica para envío gratis.
                      </div>
                    )}

                    {shipping > 0 && (
                      <div className="text-sm text-center mt-2 text-beige-600">
                        Te faltan ${(1000 - subtotal).toLocaleString("es-AR")}{" "}
                        para obtener envío gratis.
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0">
                  <button
                    onClick={handleSendWhatsApp}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    {loading ? "Enviando..." : "Enviar Pedido por WhatsApp"}
                  </button>
                </CardFooter>
              </Card>

              {/* Info adicional de envío */}
              <div className="mt-4 bg-beige-100/70 rounded-lg p-4 text-sm text-beige-700">
                <h3 className="font-medium text-beige-800 mb-2">
                  Información de Envío
                </h3>
                <ul className="space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Envío estándar: 3-5 días hábiles</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Envío gratis en pedidos superiores a $999 ARG</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Devoluciones gratuitas dentro de los 30 días posteriores a
                      la entrega
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Componente para cuando el carrito está vacío
function EmptyCart() {
  return (
    <div className="bg-white border border-beige-200 rounded-lg shadow-sm p-8 md:p-12 text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-beige-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="w-10 h-10 text-beige-500" />
      </div>
      <h2 className="font-serif text-2xl text-beige-800 mb-3">
        Tu carrito está vacío
      </h2>
      <p className="text-beige-600 mb-8 max-w-md mx-auto">
        Parece que aún no has añadido ningún producto a tu carrito. Explora
        nuestra colección y encuentra algo que te encante.
      </p>
      <Button
        asChild
        className="bg-beige-700 hover:bg-beige-800 text-beige-50 px-8 py-6"
      >
        <Link href="/tienda">Explorar Productos</Link>
      </Button>
    </div>
  );
}
