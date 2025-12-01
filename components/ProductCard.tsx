"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  getCategoryNameById: (id: string) => string;
}

export function ProductCard({ product, getCategoryNameById }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock !== undefined && product.stock! <= 5 && product.stock! > 0;

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group block transition-all duration-300 hover:-translate-y-1"
    >
      <Card className="
        h-full overflow-hidden border border-beige-200 bg-white 
        shadow-sm hover:shadow-[0_15px_35px_rgba(166,150,129,0.18)]
        transition-all duration-300 rounded-xl
      ">

        {/* Imagen */}
        <div className="aspect-square relative overflow-hidden">
          {product.images?.length ? (
            <Image
              src={product.images[0]}
              alt={product.title || "Producto"}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full w-full bg-beige-100 flex items-center justify-center">
              <span className="text-beige-600">Sin imagen</span>
            </div>
          )}

          {/* Etiquetas */}
          {isLowStock && (
            <Badge className="
              absolute top-2 right-2 bg-beige-800 text-beige-50 shadow-md
              py-1 px-2 text-xs
            ">
              ¡Últimas unidades!
            </Badge>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex items-center justify-center">
              <Badge
                variant="outline"
                className="text-base font-serif border-beige-300 text-beige-800 px-4 py-1"
              >
                Agotado
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <CardHeader className="p-4 pb-1">
          <div className="flex justify-between items-start gap-3">
            <h3 className="font-serif text-lg font-bold text-beige-800 line-clamp-2">
              {product.title}
            </h3>

            <span className="font-bold text-lg text-beige-700 whitespace-nowrap">
              ${product.price?.toLocaleString("es-AR") ?? 0}
            </span>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-1">
          {product.description && (
            <p className="text-sm text-beige-600 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          {/* Categoría */}
          <Badge
            variant="secondary"
            className="bg-beige-100 text-beige-700 hover:bg-beige-200"
          >
            {getCategoryNameById(product.category_id)}
          </Badge>
        </CardContent>

        <CardFooter className="p-4 pt-2 flex flex-col items-start gap-2">
          {/* Tallas */}
          {product.sizes!.length > 0 && (
            <div className="flex flex-wrap gap-1 ">
              <span className="text-xs text-beige-600">Tallas:</span>
              {product.sizes!.map((size) => (
                <Badge
                  key={size}
                  variant="outline"
                  className="text-xs border-beige-300 text-beige-700"
                >
                  {size}
                </Badge>
              ))}
            </div>
          )}

          {/* Colores */}
          {product.colors!.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              <span className="text-xs text-beige-600">Colores:</span>
              {product.colors!.map((color) => (
                <Badge
                  key={color}
                  variant="outline"
                  className="text-xs border-beige-300 text-beige-700"
                >
                  {color}
                </Badge>
              ))}
            </div>
          )}

          {/* Stock bar */}
          {product.stock !== undefined && (
            <div className="mt-1 w-full">
              <div className="flex justify-between items-center text-xs text-beige-600">
                <span>Disponibilidad:</span>
                <span className="font-medium text-beige-700">
                  {isOutOfStock ? "Sin stock" : `${product.stock} en stock`}
                </span>
              </div>

              <div className="w-full bg-beige-100 h-1.5 rounded-full mt-1">
                <div
                  className={`
                    h-full rounded-full transition-all duration-300
                    ${isOutOfStock
                      ? "bg-beige-300 w-0"
                      : isLowStock
                        ? "bg-beige-500 w-1/4"
                        : "bg-beige-700 w-full"}
                  `}
                />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
