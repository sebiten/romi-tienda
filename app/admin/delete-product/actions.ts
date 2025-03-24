import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { DeleteSchema } from "./page";


const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;
if (!BUCKET_NAME) {
    throw new Error("Falta configurar NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET en .env.local");
}

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
    const publicPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME!}/`;
    const imageUrls: string[] = product?.images ?? [];
    const paths: string[] = imageUrls.map((url) => {
        if (!url.startsWith(publicPrefix)) {
            throw new Error(`URL inesperada para borrar: ${url}`);
        }
        return url.replace(publicPrefix, "");
    });
    // Eliminar archivos en Storage si existen
    if (paths.length) {
        const { error: storageError } = await supabase.storage.from(BUCKET_NAME!).remove(paths);
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
