"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
  getCategoryNameById: (id: string) => string
}

export function ProductCard({ product, getCategoryNameById }: ProductCardProps) {
  return (
    <Link
      href={`/producto/${product.id}`}
      key={product.id}
      className="group block h-full transition-all duration-300 hover:translate-y-[-4px]"
    >
      <Card className="h-full overflow-hidden border-beige-200 bg-white/90 backdrop-blur-sm hover:shadow-[0_15px_30px_rgba(166,150,129,0.1)] transition-all duration-300">
        <div className="aspect-square relative overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <div className="h-full w-full relative">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.title || "Producto"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
          ) : (
            <div className="h-full w-full bg-beige-100 flex items-center justify-center">
              <span className="text-beige-600">Sin imagen</span>
            </div>
          )}

          {product.stock !== undefined && product.stock! <= 5 && product.stock! > 0 && (
            <Badge className="absolute top-2 right-2 bg-beige-800 text-beige-50 hover:bg-beige-700">
              ¡Últimas unidades!
            </Badge>
          )}

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-beige-50/80 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="outline" className="text-lg font-serif font-light border-beige-300 text-beige-800">
                Agotado
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-lg text-beige-800 line-clamp-2">{product.title}</h3>
            <span className="font-bold text-lg whitespace-nowrap text-beige-700">
              ${product.price?.toLocaleString("es-MX") ?? 0}
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <p className="text-sm text-beige-600 line-clamp-2 mb-2">{product.description}</p>

          <Badge variant="secondary" className="mt-1 bg-beige-100 text-beige-700 hover:bg-beige-200">
            {getCategoryNameById(product.category_id)}
          </Badge>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-col items-start gap-1">
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 w-full">
              <span className="text-xs text-beige-600">Tallas:</span>
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((size) => (
                  <Badge key={size} variant="outline" className="text-xs border-beige-200 text-beige-700">
                    {size}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-wrap gap-1 w-full">
              <span className="text-xs text-beige-600">Colores:</span>
              <div className="flex flex-wrap gap-1">
                {product.colors.map((color) => (
                  <Badge key={color} variant="outline" className="text-xs border-beige-200 text-beige-700">
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.stock !== undefined && (
            <div className="w-full mt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-beige-600">Disponibilidad:</span>
                <span className="text-xs font-medium text-beige-700">
                  {product.stock! > 0 ? `${product.stock} en stock` : "Sin stock"}
                </span>
              </div>
              <div className="w-full bg-beige-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    product.stock === 0
                      ? "bg-beige-300/70 w-0"
                      : product.stock! <= 5
                        ? "bg-beige-500 w-1/4"
                        : "bg-beige-600 w-full"
                  }`}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

