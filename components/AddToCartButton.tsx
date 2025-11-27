"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/app/store/cartStore";
import type { Product } from "@/lib/types";

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
  selectedColor: string | null;
  className?: string;
  currentStock: number; // ⭐ ahora lo recibimos desde ProductPage
}

export function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
  currentStock,
  className = "",
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  // Acción para agregar al carrito
  const addToCart = useCartStore((state) => state.addToCart);

  // ❗ Usamos getState para evitar loops de render
  const cartItems = useCartStore.getState().items;

  // Cantidad actual en el carrito de esa variante
  const qtyInCart = cartItems
    .filter(
      (it) =>
        it.product_id === product.id &&
        it.size === selectedSize &&
        it.color === selectedColor
    )
    .reduce((acc, it) => acc + it.quantity, 0);

  const maxReached = qtyInCart >= currentStock;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    if (maxReached) return;

    addToCart(product, selectedSize, selectedColor, currentStock);

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={maxReached || currentStock === 0}
      className={`${className} ${maxReached || currentStock === 0
          ? "bg-gray-400 cursor-not-allowed text-white"
          : isAdded
            ? "bg-green-600 hover:bg-green-700 text-white"
            : "bg-beige-700 hover:bg-beige-800 text-beige-50"
        }`}
    >
      {maxReached || currentStock === 0 ? (
        <>Sin stock disponible</>
      ) : isAdded ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Añadido al Carrito
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4 mr-2" />
          Añadir al Carrito
        </>
      )}
    </Button>
  );
}
