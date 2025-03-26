"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/app/store/cartStore"

export function CartIcon() {
  const items = useCartStore((state) => state.items)
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-beige-700 hover:text-beige-800 hover:bg-beige-200/50 relative"
      aria-label={`Carrito con ${itemCount} artículos`}
      asChild
    >
      <Link href="/cart">
        <ShoppingBag size={20} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-beige-800 text-beige-50 rounded-full text-xs flex items-center justify-center">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}

