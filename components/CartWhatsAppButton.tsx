"use client";

import { useContext } from "react";
import { Button } from "@/components/ui/button";

// Ejemplo: Contexto de carrito (asegúrate de tenerlo implementado en tu app)
import { useCartStore } from "@/app/store/cartStore";

export default function CartWhatsAppButton() {
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
  const handleSendWhatsApp = () => {
    if (!items || items.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    // Construir el mensaje con los detalles de cada producto
    const cartMessage = items
      .map((item) => {
        return `${item.name} - Talla: ${item.size} - Color: ${item.color} - Cantidad: ${item.quantity} - Precio: $${item.price}`;
      })
      .join("\n");

    const message = encodeURIComponent(
      `Hola, me gustaría hacer un pedido:\n${cartMessage}`
    );
    // Reemplaza "1234567890" por el número de teléfono al que se enviará el mensaje (en formato internacional sin + ni espacios)
    const phone = "1234567890";
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

    // Abre el enlace en una nueva pestaña
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button onClick={handleSendWhatsApp} className="mt-4">
      Enviar pedido por WhatsApp
    </Button>
  );
}
