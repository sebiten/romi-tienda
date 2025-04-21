"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartIcon } from "./CartIcon";

interface NavbarProps {
  user: any | null;
  isAdmin?: boolean;
}

export default function Navbar({ user, isAdmin }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-beige-50/95 backdrop-blur-sm shadow-sm"
          : "bg-beige-100"
      }`}
    >
      {/* Top announcement bar */}
      <div className="bg-beige-800 text-beige-50 py-1.5 px-4 md:px-6 text-xs md:text-sm font-light">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p>Empieza la temporada de invierno!</p>
          <div className="flex items-center mt-1 sm:mt-0">
            <span className="font-medium">Teléfono: </span>
            <p className="ml-1 hover:underline">
              +54 3872226885
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-beige-800 hover:text-beige-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 relative rounded-full overflow-hidden">
                <Image
                  src="/almalucia.webp"
                  alt="Alma Lucia"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-serif text-xl md:text-2xl text-beige-800 hidden sm:inline-block">
                Alma Lucia
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/tienda">Tienda</NavLink>
            <NavLink href="/admin">
              {isAdmin ? "Admin" : ""}
            </NavLink>
          </nav>

          {/* Right section: search, cart, user */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <CartIcon />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-beige-700 hover:text-beige-800 hover:bg-beige-200/50 h-9 px-3 gap-1">
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-beige-50 border-beige-200"
                >
                  <div className="px-3 py-2 text-sm font-medium text-beige-800 border-b border-beige-100">
                    <p className="truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/perfil"
                      className="cursor-pointer text-beige-700 focus:text-beige-800 focus:bg-beige-100"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-beige-100" />
                  <DropdownMenuItem asChild>
                    <form action={signOutAction} className="w-full">
                      <button
                        type="submit"
                        className="flex items-center w-full text-beige-700 focus:text-beige-800 focus:bg-beige-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-1">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-beige-700 hover:text-beige-800 hover:bg-beige-200/50"
                >
                  <Link href="/sign-in">Iniciar Sesión</Link>
                </Button>
                <Button
                  asChild
                  className="bg-beige-700 hover:bg-beige-800 text-beige-50"
                >
                  <Link href="/sign-up">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-beige-50 border-t border-beige-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </MobileNavLink>
              <MobileNavLink
                href="/tienda"
                onClick={() => setIsMenuOpen(false)}
              >
                Tienda
              </MobileNavLink>
              <MobileNavLink href="/about" onClick={() => setIsMenuOpen(false)}>
                Nosotros
              </MobileNavLink>
              <MobileNavLink
                href="/admin"
                onClick={() => setIsMenuOpen(false)}
              >
                {isAdmin ? "Admin" : ""}
              </MobileNavLink>

              {!user && (
                <>
                  <div className="h-px bg-beige-200 my-2"></div>
                  <MobileNavLink
                    href="/sign-in"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </MobileNavLink>
                  <MobileNavLink
                    href="/sign-up"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </MobileNavLink>
                </>
              )}

              {user && (
                <>
                  <div className="h-px bg-beige-200 my-2"></div>
                  <div className="px-3 py-2 text-sm font-medium text-beige-800">
                    <p className="truncate">{user.email}</p>
                  </div>
                  <MobileNavLink
                    href="/perfil"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </MobileNavLink>
                  <form action={signOutAction} className="w-full">
                    <button
                      type="submit"
                      className="flex items-center w-full px-3 py-2 text-beige-700 hover:text-beige-800 hover:bg-beige-100 rounded-md text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </form>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

// Desktop navigation link
function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-beige-700 hover:text-beige-800 hover:bg-beige-200/50 rounded-md text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}

// Mobile navigation link
function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 text-beige-700 hover:text-beige-800 hover:bg-beige-100 rounded-md text-sm"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
