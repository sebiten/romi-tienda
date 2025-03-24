import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { JSX } from "react";
import { Product } from "@/components/Delete-product-form";

/**
 * Validación de input para la acción de eliminación
 */
const DeleteSchema = z.object({
    productId: z.string().uuid("El ID debe ser un UUID válido"),
});

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;
if (!BUCKET_NAME) {
    throw new Error("Falta configurar NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET en .env.local");
}

/**
 * Server Action: elimina un producto de la tabla y sus imágenes asociadas en Storage
 */
export async function deleteProductAction(formData: FormData): Promise<void> {
    "use server";

    const productId = formData.get("productId");
    const parsed = DeleteSchema.safeParse({ productId });
    if (!parsed.success) {
        throw new Error(parsed.error.issues[0].message);
    }

    const supabase = await createClient();
    const id = parsed.data.productId;

    // Obtener solo las URLs de imágenes del producto
    const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("images")
        .eq("id", id)
        .single();
    if (fetchError) throw new Error(`Error fetching product: ${fetchError.message}`);

    // Extraer rutas relativas desde la URL pública
    const publicPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/`;
    const imageUrls: string[] = product?.images ?? [];
    const paths: string[] = imageUrls.map((url) => {
        if (!url.startsWith(publicPrefix)) {
            throw new Error(`URL inesperada para borrar: ${url}`);
        }
        return url.replace(publicPrefix, "");
    });
    // Eliminar archivos en Storage si existen
    if (paths.length) {
        const { error: storageError } = await supabase.storage.from(BUCKET_NAME).remove(paths);
        if (storageError) throw new Error(`Error removing files: ${storageError.message}`);
    }

    // Eliminar registro en la tabla
    const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
    if (deleteError) throw new Error(`Error deleting product: ${deleteError.message}`);

    revalidatePath("/admin/delete");
}

/**
 * Obtiene todos los productos ordenados por fecha de creación descendente
 */
async function getProducts(): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) {
        console.error(`Error fetching products: ${error.message}`);
        return [];
    }
    return data ?? [];
}

/**
 * Página server component para listar y eliminar productos
 */
export default async function DeleteProductPage(): Promise<JSX.Element> {
    const products = await getProducts();

    return (
        <section className="p-4">
            <h1 className="text-2xl font-semibold mb-4">Eliminar Productos</h1>

            {products.length === 0 ? (
                <p>No hay productos registrados.</p>
            ) : (
                <ul className="space-y-6">
                    {products.map(product => (
                        <li key={product.id} className="border p-4 rounded flex gap-4">
                            {product.images?.[0] && (
                                <Image
                                    src={product.images[0]}
                                    alt={product.title ?? "Producto"}
                                    width={120}
                                    height={120}
                                    className="object-cover rounded"
                                />
                            )}
                            <div className="flex flex-col flex-1">
                                <h2 className="text-lg font-medium">{product.title}</h2>
                                <p className="text-sm text-gray-600">{product.description}</p>
                                <span className="text-sm">Precio: ${product.price}</span>
                                <form action={deleteProductAction} className="mt-3">
                                    <input type="hidden" name="productId" value={product.id} />
                                    <button
                                        type="submit"
                                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Eliminar
                                    </button>
                                </form>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
