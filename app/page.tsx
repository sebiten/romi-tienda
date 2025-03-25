import BlackFridayBanner from "@/components/BlackFriday";
import { Product } from "@/components/Delete-product-form";
import Hero from "@/components/Hero";
import ProductsGrid from "@/components/ProductGrid";
import TitleUsable from "@/components/Title";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
  }
  return (
    <>
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        {/* Grid de productos */}
        <ProductsGrid products={(products as Product[]) ?? []} />
        <BlackFridayBanner
          title="Black Friday Mega Sale"
          subtitle="Descuentos increíbles solo por tiempo limitado"
          ctaLabel="¡Compra Ahora!"
          ctaLink="/ofertas"
          backgroundImage="/fondo.webp" // Opcional
        />
      </main>
    </>
  );
}
