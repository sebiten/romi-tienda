import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "./ui/button";

export default function Hero() {
  const highlights = ["Talles reales", "Stock validado", "Envios a todo el pais"];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/fondo.webp"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,244,238,0.96)_0%,rgba(248,244,238,0.88)_46%,rgba(248,244,238,0.58)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,244,238,0.76)_0%,rgba(248,244,238,0.38)_52%,rgba(248,244,238,0.88)_100%)]" />
      </div>

      <div className="container relative z-10 mx-auto px-5">
        <div className="flex min-h-[72svh] flex-col justify-center py-10 md:min-h-[78svh] md:py-16">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-beige-300 bg-white/75 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-beige-700 shadow-sm backdrop-blur sm:px-4 sm:tracking-[0.24em]">
              <span className="relative h-8 w-8 overflow-hidden rounded-full border border-beige-300 bg-white">
                <Image
                  src="/almalucia.webp"
                  alt="Alma Lucia"
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </span>
              Curaduria de temporada
            </div>

            <h1 className="max-w-[11ch] font-serif text-[3.35rem] font-medium leading-[0.9] text-beige-900 sm:max-w-[12ch] sm:text-7xl md:text-8xl">
              Moda con presencia.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-beige-800 sm:text-lg md:text-xl md:leading-8">
              Siluetas comodas, seleccion cuidada y compra online sin vueltas.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-beige-900 px-6 text-base text-beige-50 shadow-lg shadow-beige-300/30 transition hover:bg-beige-800"
              >
                <Link href="/tienda" className="inline-flex items-center justify-center gap-2">
                  Ver coleccion
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-beige-300 bg-white/75 px-6 text-base text-beige-800 backdrop-blur hover:bg-white"
              >
                <Link href="/sign-up">Crear cuenta</Link>
              </Button>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-beige-300/80 bg-white/68 px-3 py-1.5 text-sm text-beige-700 shadow-sm backdrop-blur"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 md:max-w-3xl">
            <div className="rounded-lg border border-beige-200/80 bg-white/70 p-4 shadow-sm backdrop-blur">
              <Truck className="mb-3 h-4 w-4 text-beige-800" />
              <p className="text-sm font-medium text-beige-900">Envios claros</p>
              <p className="mt-1 text-sm leading-6 text-beige-700">
                Cotizacion por codigo postal.
              </p>
            </div>

            <div className="rounded-lg border border-beige-200/80 bg-white/70 p-4 shadow-sm backdrop-blur">
              <ShieldCheck className="mb-3 h-4 w-4 text-beige-800" />
              <p className="text-sm font-medium text-beige-900">Compra segura</p>
              <p className="mt-1 text-sm leading-6 text-beige-700">
                Mercado Pago y stock real.
              </p>
            </div>

            <div className="rounded-lg border border-beige-200/80 bg-white/70 p-4 shadow-sm backdrop-blur">
              <Sparkles className="mb-3 h-4 w-4 text-beige-800" />
              <p className="text-sm font-medium text-beige-900">Seleccion curada</p>
              <p className="mt-1 text-sm leading-6 text-beige-700">
                Piezas versatiles para todos los dias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
