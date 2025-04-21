import Link from "next/link"
import Image from "next/image"
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone, InstagramIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-beige-100 border-t border-beige-200">
      {/* Wave decoration at top */}
      <div className="relative h-12 overflow-hidden">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute -top-1 w-full h-full rotate-180">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C0,0,0,0,0,0z"
            fill="#F5F1EA"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-12 h-12 relative mr-3">
                <Image src="/almalucia.webp" alt="Alma Lucia" fill className="object-cover rounded-full" />
              </div>
              <h3 className="font-serif text-2xl text-beige-800">Alma Lucia</h3>
            </div>
            <p className="text-beige-600 text-sm leading-relaxed">
              Descubre las últimas tendencias en ropa oversized para sentirte cómodo y con estilo. Prendas atemporales
              diseñadas para expresar tu esencia.
            </p>
            <div className="flex space-x-3 pt-2">
              <Link
                href="https://instagram.com"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-beige-50 text-beige-700 hover:bg-beige-200 hover:text-beige-800 transition-colors"
              >
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://facebook.com"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-beige-50 text-beige-700 hover:bg-beige-200 hover:text-beige-800 transition-colors"
              >
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-beige-50 text-beige-700 hover:bg-beige-200 hover:text-beige-800 transition-colors"
              >
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* Links section */}
          <div>
            <h4 className="font-serif text-lg text-beige-800 mb-4 pb-1 border-b border-beige-200">Enlaces</h4>
            <nav className="grid grid-cols-1 gap-2">
              <Link href="/" className="text-beige-600 hover:text-beige-800 transition-colors">
                Inicio
              </Link>
              <Link href="/tienda" className="text-beige-600 hover:text-beige-800 transition-colors">
                Tienda
              </Link>
              {/* <Link href="/about" className="text-beige-600 hover:text-beige-800 transition-colors">
                Nosotros
              </Link>
              <Link href="/blog" className="text-beige-600 hover:text-beige-800 transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-beige-600 hover:text-beige-800 transition-colors">
                Contacto
              </Link> */}
            </nav>
          </div>

          {/* Contact section */}
          <div>
            <h4 className="font-serif text-lg text-beige-800 mb-4 pb-1 border-b border-beige-200">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-beige-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-beige-600 text-sm">Salta, Salta Argentina</span>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-beige-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-beige-600 text-sm"> +54 3872226885</span>
              </div>
              <div className="flex items-start">
                <InstagramIcon className="w-5 h-5 text-beige-500 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-beige-600 text-sm">@almalucia08</span>
              </div>
            </div>
          </div>

          {/* Newsletter section */}
          <div>
            <h4 className="font-serif text-lg text-beige-800 mb-4 pb-1 border-b border-beige-200">Newsletter</h4>
            <p className="text-beige-600 text-sm mb-4">
              Suscríbete para recibir noticias sobre nuevas colecciones y ofertas exclusivas.
            </p>
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Tu email"
                className="bg-beige-50 border-beige-200 focus:border-beige-300 focus:ring-beige-300 text-beige-700 placeholder:text-beige-400"
              />
              <Button className="bg-beige-700 hover:bg-beige-800 text-beige-50">Enviar</Button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-6 border-t border-beige-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-beige-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Alma Lucia. Todos los derechos reservados.
          </p>
          <div className="flex space-x-4 text-sm">
            <Link href="/privacy" className="text-beige-600 hover:text-beige-800 transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="text-beige-600 hover:text-beige-800 transition-colors">
              Términos
            </Link>
            <Link href="/cookies" className="text-beige-600 hover:text-beige-800 transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

