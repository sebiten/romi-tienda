export default function Hero() {
  return (
    <section className="relative w-full h-[600px] flex items-center justify-center bg-red-500 overflow-hidden">

      <div className="absolute inset-0 bg-black/30" />

      {/* Contenido principal */}
      <div className="relative z-10 text-center text-white max-w-2xl px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Moda Oversize
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Descubre las últimas tendencias en ropa oversized para sentirte cómodo
          y con estilo. ¡Renueva tu armario con nuestras prendas de temporada!
        </p>
        <div>
          <a
            href="/shop"
            className="inline-block bg-primary hover:bg-primary/90 text-white font-medium rounded-md px-6 py-3 transition-colors"
          >
            Explorar Colección
          </a>
        </div>
      </div>
    </section>
  );
}
