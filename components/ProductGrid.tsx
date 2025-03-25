// components/ProductsGrid.tsx
import Link from "next/link";
import React from "react";
import { Product } from "./Delete-product-form";
import TitleUsable from "./Title";

interface ProductsGridProps {
    products: Product[];
}

export default function ProductsGrid({ products }: ProductsGridProps) {
    return (
        <section className="my-20 mx-auto">
            <div>
                <TitleUsable title={"Productos"} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-7xl mx-auto">
                {products.map((product) => (
                    <Link
                        href={`/producto/${product.id}`}
                        key={product.id}
                        className="bg-opacity-60 rounded-lg shadow-lg p-4 flex flex-col transform transition hover:scale-105 hover:shadow-2xl"
                    >
                        {/* Imagen principal (se invierte en modo noche) */}
                        {product.images && product.images.length > 0 && (
                            <img
                                src={product.images[0]}
                                alt={product.title ?? "Imagen del producto"}
                                className="w-full h-48 object-cover rounded mb-3 dark:invert"
                            />
                        )}

                        {/* Título */}
                        <h3 className="text-lg font-bold mb-1 text-white">
                            {product.title}
                        </h3>

                        {/* Descripción */}
                        <p className="text-sm text-gray-400 mb-2">
                            {product.description}
                        </p>

                        {/* Precio */}
                        <span className="text-md font-semibold mb-2 text-white">
                            ${product.price ?? 0}
                        </span>

                        {/* Tallas y colores */}
                        <div className="text-sm text-gray-400 mt-auto">
                            {product.sizes && product.sizes.length > 0 && (
                                <p>
                                    <strong>Tallas:</strong> {product.sizes.join(", ")}
                                </p>
                            )}
                            {product.colors && product.colors.length > 0 && (
                                <p>
                                    <strong>Colores:</strong> {product.colors.join(", ")}
                                </p>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
