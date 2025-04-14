"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/app/store/cartStore"

interface AddToCartButtonProps {
  product: Product
  selectedSize: string | null
  selectedColor: string | null
  className?: string
}

export function AddToCartButton({ product, selectedSize, selectedColor, className = "" }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      // You could show an error message here
      return
    }

    addToCart(product, selectedSize, selectedColor)

    // Show success state briefly
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={`${className} ${isAdded ? "bg-green-600 hover:bg-green-700" : "bg-beige-700 hover:bg-beige-800"} text-beige-50`}
      disabled={isAdded}
    >
      {isAdded ? (
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
  )
}

