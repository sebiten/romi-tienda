"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddToCartButton } from "@/components/AddToCartButton"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"

interface QuickViewButtonProps {
  product: Product
}

export function QuickViewButton({ product }: QuickViewButtonProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "")
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "")
  // Obtener stock actual de la variante seleccionada

  const currentVariant = product.variants?.find(
    (v: any) =>
      v.size === selectedSize &&
      v.color?.toLowerCase() === selectedColor?.toLowerCase()
  );

  const currentStock = currentVariant?.stock ?? 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 bg-beige-50/90 hover:bg-beige-100 text-beige-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="w-4 h-4 mr-2" />
          Vista rápida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-beige-50 border-beige-200">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-beige-800">{product.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          {/* Product image */}
          <div className="aspect-square relative rounded-md overflow-hidden bg-white">
            <Image src={product.images?.[0] || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
          </div>

          {/* Product details */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-start">
                <span className="font-medium text-xl text-beige-800">${product.price!.toLocaleString("es-MX")}</span>
                {product.price && product.price > product.price && (
                  <span className="text-sm line-through text-beige-500">
                    ${product.price.toLocaleString("es-MX")}
                  </span>
                )}
              </div>

              <p className="text-sm text-beige-600 mt-2 line-clamp-3">{product.description}</p>
            </div>

            <Separator className="bg-beige-200" />

            {/* Size selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-beige-700 mb-2">Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`h-8 min-w-[2.5rem] px-2 rounded-md border text-sm ${selectedSize === size
                        ? "bg-beige-800 text-beige-50 border-beige-800"
                        : "bg-white text-beige-700 border-beige-200 hover:border-beige-300"
                        }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-beige-700 mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`h-8 px-3 rounded-md border text-sm ${selectedColor === color
                        ? "bg-beige-800 text-beige-50 border-beige-800"
                        : "bg-white text-beige-700 border-beige-200 hover:border-beige-300"
                        }`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <AddToCartButton
              product={product}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              currentStock={currentStock}
              className=""
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

