"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/app/store/cartStore"
import { useEffect, useState } from "react"

export function CartIcon() {
  const items = useCartStore((state) => state.items)
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Animación cuando se agrega un item
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (itemCount > 0) {
      setAnimate(true)
      const timeout = setTimeout(() => setAnimate(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [itemCount])

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        className={`relative text-beige-700 hover:text-beige-800 hover:bg-beige-200/50 transition-all duration-300 
        ${animate ? "scale-110" : "scale-100"}`}
        aria-label={`Carrito con ${itemCount} artículos`}
        asChild
      >
      </Button>

      <Link href="/carrito" className="relative">
        <ShoppingBag
          size={24}

          className={`transition-transform text-beige-700 hover:text-beige-800 hover:bg-beige-200/50 transition-all duration-300 
            ${animate ? "rotate-6" : "rotate-0"}`}
        />

        {itemCount > 0 && (
          <span
            className={`
              absolute -top-2 -right-2 min-w-[20px] h-[20px] 
              bg-beige-800 text-beige-50 rounded-full text-xs 
              flex items-center justify-center 
              font-bold shadow-md border border-beige-50 
              transition-all duration-300
              ${animate ? "scale-125" : "scale-100"}
            `}
          >
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </Link>
    </div>
  )
}
