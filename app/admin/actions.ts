"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
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

export async function createOrderAction(
  props: SendWhatsAppProps
): Promise<string> {
  const { userId, items, phoneNumber } = props;
  console.log(`Items: ${JSON.stringify(items, null, 2)}`);

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

    console.log(
      `Insertando item: UUID=${uuid}, Cantidad: ${quantity}, Tamaño: ${size}, Color: ${color}`
    );

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
