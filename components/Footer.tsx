import Image from "next/image";
import Link from "next/link";
import { Instagram, InstagramIcon, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-beige-200/80 bg-[linear-gradient(180deg,#efe7dc_0%,#e4d8c8_100%)]">
      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="relative mr-3 h-12 w-12">
                <Image
                  src="/almalucia.webp"
                  alt="Alma Lucia"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="font-serif text-2xl text-beige-800">Alma Lucia</h3>
            </div>
            <p className="max-w-md text-sm leading-7 text-beige-700">
              Una tienda pensada para comprar con calma: selección curada,
              talles reales y una experiencia simple desde el primer click hasta la entrega.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link
                href="https://www.instagram.com/almalucia08"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-beige-700 shadow-sm transition-colors hover:bg-beige-800 hover:text-white"
              >
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 border-b border-beige-200 pb-1 font-serif text-lg text-beige-800">
              Navegación
            </h4>
            <nav className="grid grid-cols-1 gap-2">
              <Link
                href="/"
                className="text-beige-600 transition-colors hover:text-beige-800"
              >
                Inicio
              </Link>
              <Link
                href="/tienda"
                className="text-beige-600 transition-colors hover:text-beige-800"
              >
                Tienda
              </Link>
              <Link
                href="/carrito"
                className="text-beige-600 transition-colors hover:text-beige-800"
              >
                Carrito
              </Link>
              <Link
                href="/perfil"
                className="text-beige-600 transition-colors hover:text-beige-800"
              >
                Mi perfil
              </Link>
            </nav>
          </div>

          <div>
            <h4 className="mb-4 border-b border-beige-200 pb-1 font-serif text-lg text-beige-800">
              Contacto
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-beige-500" />
                <span className="text-sm text-beige-600">
                  Salta, Salta Argentina
                </span>
              </div>
              <div className="flex items-start">
                <Phone className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-beige-500" />
                <span className="text-sm text-beige-600">+54 387 222 6885</span>
              </div>
              <div className="flex items-start">
                <InstagramIcon className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-beige-500" />
                <span className="text-sm text-beige-600">@almalucia08</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-beige-200 pt-6 md:flex-row">
          <p className="text-sm text-beige-600">
            © {new Date().getFullYear()} Alma Lucia. Todos los derechos reservados.
          </p>
          <p className="text-center text-sm text-beige-500">
            Diseñado para una experiencia de compra simple, clara y elegante.
          </p>
        </div>
      </div>
    </footer>
  );
}
