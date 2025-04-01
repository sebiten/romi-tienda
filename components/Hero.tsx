import { ChevronDown, Link } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E2DCD0] to-[#D6CDBF]" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%239C92AC' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Soft light effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[40%] bg-[#F5F1EA] opacity-30 blur-3xl rounded-full" />

      {/* Content container with glassmorphism */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center">
        {/* Animated circular image */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#D6C7B0]  to-[#D6C7B0]  group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
          <div className="relative w-40 h-40 md:w-60 md:h-60 rounded-full overflow-hidden border-4 border-[#F5F1EA]/80 shadow-[0_0_40px_rgba(214,199,176,0.5)] animate-float">
            <Image
              src="/almalucia.webp"
              alt="Alma Lucia"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 160px, 240px"
              priority
            />
          </div>
        </div>

        {/* Brand name with elegant typography */}
        <h1 className="font-serif text-5xl md:text-7xl font-light tracking-wider mb-6 text-[#5D4B3C] animate-fade-in">
          <span className="inline-block animate-slide-up">Alma</span>
          <span className="inline-block mx-2 md:mx-4 animate-slide-up animation-delay-150">Lucia</span>
        </h1>

        {/* Decorative line */}
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#A69681] to-transparent mb-8 animate-width"></div>

        {/* Description with refined typography */}
        <p className="text-lg md:text-xl max-w-2xl text-center mb-10 text-[#5D4B3C]/90 font-light leading-relaxed animate-fade-in animation-delay-300">
          Descubre las últimas tendencias en ropa oversized para sentirte cómodo y con estilo. Prendas atemporales
          diseñadas para expresar tu esencia.
        </p>

        {/* CTA button with hover effect */}
        <div className="flex flex-col items-center gap-8 animate-fade-in animation-delay-500">
          <Button
            size="lg"
            className="bg-[#A69681] hover:bg-[#8A7B68] text-[#F5F1EA] rounded-full px-8 py-6 text-lg font-light tracking-wide transition-all duration-300 hover:shadow-[0_5px_15px_rgba(166,150,129,0.4)] hover:translate-y-[-2px]"
          >
            <Link href="/shop">Explorar Colección</Link>
          </Button>

          {/* Scroll indicator */}
          <div className="hidden md:flex flex-col items-center text-[#5D4B3C]/70 animate-bounce animation-delay-700">
            <span className="text-xs tracking-widest uppercase mb-2">Descubre más</span>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#F5F1EA]/30 to-transparent" />
      <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#D6C7B0]/20 rounded-full blur-3xl" />
      <div className="absolute -top-8 -left-8 w-64 h-64 bg-[#D6C7B0]/20 rounded-full blur-3xl" />
    </section>
  );
}
