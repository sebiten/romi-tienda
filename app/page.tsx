import BlackFridayBanner from "@/components/BlackFriday";
import Hero from "@/components/Hero";

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
      </main>
    </>
  );
}
