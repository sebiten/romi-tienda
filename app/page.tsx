import BlackFridayBanner from "@/components/BlackFriday";
import Hero from "@/components/Hero";
import InstagramSection from "@/components/InstagramSection";

export default async function Home() {
  return (
    <>
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        {/* Grid de productos */}

        <BlackFridayBanner
          title="Se viene el Verano!"
          subtitle="Descubrí nuestra colección de ropa ligera y fresca para disfrutar al máximo la temporada. 😎"
          ctaLabel="Ver Productos"
          ctaLink="/tienda"
          backgroundImage="/fondo.webp" // Opcional, podés poner una imagen con nieve, ropa de abrigo, etc.
        />
        <InstagramSection />
      </main>
    </>
  );
}
