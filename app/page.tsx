import BlackFridayBanner from "@/components/BlackFriday";
import SendWhatsapp from "@/components/EnviarWhatsapp";
import Hero from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import TitleUsable from "@/components/Title";
import { Product } from "@/lib/types";
import { getCategoryNameById } from "@/utils/getCategoryNameById";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        {/* Grid de productos */}
        <BlackFridayBanner
          title="Black Friday Mega Sale"
          subtitle="Descuentos increíbles solo por tiempo limitado"
          ctaLabel="¡Compra Ahora!"
          ctaLink="/ofertas"
          backgroundImage="/fondo.webp" // Opcional
        />
        <SendWhatsapp />
      </main>
    </>
  );
}
