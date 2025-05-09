"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  price?: number;
}

interface SendWhatsAppProps {
  userId: string | undefined; // El ID del usuario que hace el pedido
  items: CartItem[]; // Los productos del carrito
  phoneNumber: string; // Teléfono del dueño (o del negocio) para WhatsApp
}

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!;
if (!BUCKET_NAME) {
  throw new Error(
    "Falta configurar NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET en .env.local"
  );
}

const DeleteSchema = z.object({
  productId: z.string().uuid("El ID debe ser un UUID válido"),
});

export async function deleteProductAction(formData: FormData): Promise<void> {
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
  if (fetchError)
    throw new Error(`Error fetching product: ${fetchError.message}`);

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
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME!)
      .remove(paths);
    if (storageError)
      throw new Error(`Error removing files: ${storageError.message}`);
  }

  // Eliminar registro en la tabla
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (deleteError)
    throw new Error(`Error deleting product: ${deleteError.message}`);

  revalidatePath("/admin/delete");
}

// Esta función crea una orden en la base de datos y envía un mensaje de WhatsApp
// a un número específico. Se asume que el número de teléfono ya está en formato internacional.
export async function createOrderAction(
  props: SendWhatsAppProps
): Promise<string> {
  const { userId, items, phoneNumber } = props;

  // 1) Conectar a Supabase
  const supabase = await createClient();

  // 2) Crear la orden en 'orders'
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      status: "pendiente-pago",
      created_at: new Date(),
    })
    .select("*")
    .single();

  if (orderError) {
    throw new Error(`Error al crear la orden: ${orderError.message}`);
  }

  // 3) Crear items en 'order_items'
  for (const item of items) {
    let { productId, quantity, size, color } = item;
    // Extraer el UUID asumiendo que está separado por guiones bajos
    const uuid = productId.split("_")[0];

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: order.id,
      product_id: uuid, // se inserta solo el UUID real
      quantity,
      size,
      color,
    });
    if (itemError) {
      throw new Error(`Error insertando item: ${itemError.message}`);
    }
  }

  // 4) Enviar WhatsApp (opcional) y 5) Revalida la página si lo requieres

  return order.id;
}

// action para editar un producto
export async function updateProductAction(formData: FormData) {
  "use server";

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const sizesRaw = formData.get("sizes") as string;
  const sizes = sizesRaw.split(",").map((size) => size.trim());
  const category_id = formData.get("category_id") as string; // Obtener el id de la categoría

  const supabase = await createClient();

  // Actualizar el producto en la tabla "products" incluyendo la categoría
  const { error } = await supabase
    .from("products")
    .update({
      title,
      price,
      stock,
      sizes,
      category_id: category_id || null, // asigna null si no se seleccionó una categoría
    })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando el producto:", error.message);
    // Aquí podrías manejar el error de forma más amigable (mostrar mensaje en UI, etc.)
  }

  // Redirigir después de la actualización
  redirect("/admin/edit");
}

// action para marcar un pedido como pagado

export async function markOrderAsPaidAction(orderId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: "pagado" })
    .eq("id", orderId);

  if (error) {
    throw new Error("No se pudo actualizar el estado del pedido.");
  }

  // Revalidar la página para reflejar los cambios
  revalidatePath("/admin/pedidos");
  revalidatePath("/perfil/pedidos");

  return true;
}
