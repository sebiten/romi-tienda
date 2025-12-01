import { createClient } from "@/lib/server";
import ProductsWrapper from "./ProductsWrapper";
import { Suspense } from "react";

function TiendaSkeleton() {
  return (
    <div className="w-full py-20 flex justify-center items-center 
      
    ">
      <div className="animate-spin h-14 w-14 rounded-full border-4 border-beige-400 border-t-transparent"></div>
    </div>
  );
}

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
    <Suspense fallback={<TiendaSkeleton />}>
      <ProductsWrapper
        products={products || []}
        categories={categories || []}
      />
    </Suspense>
  );
}
