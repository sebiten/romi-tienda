"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateProductAction } from "../../actions";

// Detectar tipo automáticamente según talles existentes
function detectProductType(product: any) {
    // Si existen talles numéricos -> es calzado
    const sizes = product.sizes || [];
    if (sizes.some((s: string) => /^[0-9]+$/.test(s))) return "calzado";
    return "ropa";
}

export default function EditProductForm({ product, categories }: any) {
    const productType = detectProductType(product);

    const AVAILABLE_SIZES =
        productType === "ropa"
            ? ["XS", "S", "M", "L", "XL", "XXL"]
            : ["35", "36", "37", "38", "39", "40", "41", "42"];

    // Variantes existentes
    const [variants, setVariants] = useState(product.variants || []);

    // Campos para agregar nueva variante
    const [variantColor, setVariantColor] = useState("");
    const [variantSize, setVariantSize] = useState("");
    const [variantStock, setVariantStock] = useState("");

    const handleAddVariant = () => {
        if (!variantColor.trim() || !variantSize || !variantStock) return;

        setVariants((prev: any) => [
            ...prev,
            {
                color: variantColor.trim(),
                size: variantSize,
                stock: Number(variantStock),
            },
        ]);

        setVariantColor("");
        setVariantSize("");
        setVariantStock("");
    };

    const handleRemoveVariant = (index: number) => {
        setVariants((prev: any) => prev.filter((_: any, i: number) => i !== index));
    };

    // Derivaciones para updateProductAction
    const derivedSizes = Array.from(new Set(variants.map((v: any) => v.size)));
    const derivedColors = Array.from(new Set(variants.map((v: any) => v.color)));
    const derivedStock = variants.reduce((acc: number, v: any) => acc + v.stock, 0);

    return (
        <form action={updateProductAction} className="space-y-6">
            <input type="hidden" name="id" value={product.id} />

            {/* Enviar variantes como JSON */}
            <input type="hidden" name="variants" value={JSON.stringify(variants)} />

            {/* Sizes, Colors y Stock derivados */}
            <input type="hidden" name="sizes" value={JSON.stringify(derivedSizes)} />
            <input type="hidden" name="colors" value={JSON.stringify(derivedColors)} />
            <input type="hidden" name="stock" value={derivedStock} />

            {/* TÍTULO */}
            <div>
                <label className="text-sm font-semibold block mb-1">Título</label>
                <input
                    type="text"
                    name="title"
                    defaultValue={product.title}
                    className="w-full border rounded-lg p-3"
                />
            </div>

            {/* DESCRIPCIÓN */}
            <div>
                <label className="text-sm font-semibold block mb-1">Descripción</label>
                <textarea
                    name="description"
                    defaultValue={product.description ?? ""}
                    className="w-full border rounded-lg p-3 min-h-[120px]"
                />
            </div>

            {/* PRECIO */}
            <div>
                <label className="text-sm font-semibold block mb-1">Precio</label>
                <input
                    type="number"
                    name="price"
                    step="0.01"
                    defaultValue={product.price}
                    className="w-full border rounded-lg p-3"
                />
            </div>

            {/* VARIANTES */}
            <div className="border p-4 rounded-xl space-y-3">
                <h3 className="font-semibold">Variantes</h3>

                <div className="grid grid-cols-3 gap-2">
                    <input
                        placeholder="Color"
                        value={variantColor}
                        onChange={(e) => setVariantColor(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />

                    <select
                        value={variantSize}
                        onChange={(e) => setVariantSize(e.target.value)}
                        className="border px-2 py-1 rounded"
                    >
                        <option value="">Talle</option>
                        {AVAILABLE_SIZES.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>

                    <input
                        type="number"
                        placeholder="Stock"
                        value={variantStock}
                        onChange={(e) => setVariantStock(e.target.value)}
                        className="border px-2 py-1 rounded"
                    />
                </div>

                <Button type="button" variant="outline" onClick={handleAddVariant}>
                    Agregar Variante
                </Button>

                {variants.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm">
                        {variants.map((v: any, i: number) => (
                            <li key={i} className="flex justify-between border-b pb-1">
                                <span>
                                    {v.color} – {v.size} ({v.stock})
                                </span>
                                <button
                                    type="button"
                                    className="text-red-500 text-xs"
                                    onClick={() => handleRemoveVariant(i)}
                                >
                                    Eliminar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* CATEGORÍA */}
            <div>
                <label className="text-sm font-semibold block mb-1">Categoría</label>
                <select
                    name="category_id"
                    defaultValue={product.category_id}
                    className="w-full border rounded-lg p-3"
                >
                    <option value="">Selecciona categoría</option>
                    {categories?.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* GUARDAR */}
            <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
                Guardar Cambios
            </button>
        </form>
    );
}
