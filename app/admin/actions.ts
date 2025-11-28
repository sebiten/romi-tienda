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
  console.log("deleteProductAction productId recibido:", productId);

  // Validar ID
  const parsed = DeleteSchema.safeParse({ productId });
  if (!parsed.success) {
    console.error("Error en DeleteSchema:", parsed.error.format());
    throw new Error(parsed.error.issues[0].message);
  }

  const id = parsed.data.productId;
  const supabase = await createClient();

  // 1) Traer imágenes del producto
  const { data: product, error: fetchError } = await supabase
    .from("products")
    .select("images")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error("Error fetching product:", fetchError);
    throw new Error(`Error fetching product: ${fetchError.message}`);
  }

  const imageUrls: string[] = product?.images ?? [];
  console.log("imageUrls:", imageUrls);

  // 2) De URL pública -> nombre de archivo dentro del bucket
  const paths = imageUrls
    .map((url) => {
      const filename = url.split("/").pop();
      if (!filename) {
        console.error("No se pudo extraer filename de:", url);
        return null;
      }
      console.log("Filename calculado para borrar:", filename);
      return filename;
    })
    .filter((p): p is string => p !== null);

  console.log("Paths finales a borrar:", paths);

  // 3) Borrar archivos del bucket "product-images" (nombre hardcodeado)
  if (paths.length > 0) {
    const { data: removed, error: storageError } = await supabase.storage
      .from("product-images") // 👈 hardcodeado, sin BUCKET_NAME
      .remove(paths);

    console.log("Resultado remove():", removed, storageError);

    if (storageError) {
      console.error("Error removing files from storage:", storageError);
      throw new Error(`Error removing files: ${storageError.message}`);
    }
  } else {
    console.log("No hay imágenes asociadas para borrar en storage.");
  }

  // 4) Borrar el producto en la tabla
  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Error deleting product:", deleteError);
    throw new Error(`Error deleting product: ${deleteError.message}`);
  }

  console.log("Producto eliminado correctamente:", id);

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
export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password || password.length < 6) {
    redirect("/update-password?error=La contraseña debe tener al menos 6 caracteres");
  }

  const supabase = await createClient();

  // ⚠️ Necesita que el usuario venga autenticado desde el enlace mágico de Supabase
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/update-password?error=No se pudo validar el usuario");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/update-password?error=No se pudo actualizar la contraseña");
  }

  // Éxito
  redirect("/sign-in?success=Contraseña actualizada correctamente");
}
export async function updateProductAction(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string)?.trim() || "";
  const description = (formData.get("description") as string)?.trim() || "";
  const price = parseFloat(formData.get("price") as string);
  const category_id = (formData.get("category_id") as string) || null;

  // ⭐ NUEVO: recibimos variantes desde el form
  const variantsJson = formData.get("variants") as string;

  let variants: Array<{ color: string; size: string; stock: number }> = [];

  try {
    variants = JSON.parse(variantsJson);
  } catch (e) {
    console.error("Error parsing variants JSON:", e);
    throw new Error("Formato inválido de variantes.");
  }

  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error("Debes agregar al menos una variante.");
  }

  // ⭐ NUEVO: derivar sizes, colors y stock total
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(new Set(variants.map((v) => v.color)));
  const stock = variants.reduce((acc, v) => acc + (v.stock ?? 0), 0);

  // ⭐ Actualizar producto en Supabase
  const { error } = await supabase
    .from("products")
    .update({
      title,
      description,
      price,
      sizes,
      colors,
      stock,
      variants,  // guardamos variantes completas
      category_id,
    })
    .eq("id", id);

  if (error) {
    console.error("Error actualizando producto:", error);
    throw new Error(error.message);
  }

  // Redirigir con éxito
  redirect(`/admin/edit/${id}?success=1`);
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
