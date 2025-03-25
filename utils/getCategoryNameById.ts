import { createClient } from "@/utils/supabase/client";

/**
 * Devuelve el nombre de la categoría dado su ID
 * @param categoryId UUID de la categoría
 * @returns string | null
 */
export async function getCategoryNameById(categoryId: string): Promise<string | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("id", categoryId)
    .single();

  if (error) {
    console.error("Error fetching category name:", error.message);
    return null;
  }

  return data?.name ?? null;
}
