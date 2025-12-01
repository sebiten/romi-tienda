import { createClient } from "@/lib/server";
import ProductsClient from "./ProductsClient";
import { Suspense } from "react";

export default async function TiendaPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name");

  return (
    <ProductsClient
      products={products || []}
      categories={categories || []}
    />

  );
}
