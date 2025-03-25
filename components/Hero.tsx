import { Button } from "./ui/button";

export default function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden  p-24">
      {/* Fondo animado: Gradiente en movimiento */}
      <div className="absolute inset-0  ">
        <img
          src="/fondo.webp"
          alt="Fondo de moda"
          className="w-full h-full object-cover "
        />
      </div>
      {/* Overlay con efecto glassmorphism */}
      <div className="absolute inset-0 bg-black/70 " />

      {/* Contenido principal */}
      <div className="relative z-10 text-center text-white max-w-3xl px-4">
        {/* Imagen animada en un marco circular */}
        <div className="mx-auto mb-6 w-40 h-40 md:w-60 md:h-60 rounded-full overflow-hidden border-4 border-gray-300 shadow-2xl animate-float">
          <img
            src="/almalucia.webp"
            alt="Fondo de moda"
            className="w-full h-full object-cover invert"
          />
        </div>
        {/* Título con efecto de gradiente y pulso */}
        <h1 className="text-5xl md:text-7xl uppercase font-thin mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-300 animate-textPulse">
          Alma Lucia
        </h1>
        {/* Descripción con entrada suave */}
        <p className="text-lg md:text-xl mb-8 animate-fadeInUp delay-200">
          Descubre las últimas tendencias en ropa oversized para sentirte cómodo y con estilo. ¡Renueva tu armario con nuestras prendas de temporada!
        </p>
        {/* Botón con efecto pop-in */}
        <Button variant={"secondary"} className="animate-popIn delay-400">
          <a href="/shop">Explorar Colección</a>
        </Button>
      </div>
    </section>
  );
}
