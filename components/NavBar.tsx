"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

import { signOutAction } from "@/app/actions";
import { Button } from "./ui/button";

import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

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

export default function NavbarClient({ user, isAdmin }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
        ? "bg-beige-50/95 backdrop-blur-md shadow-md border-b border-beige-200/60"
        : "bg-beige-100"
        }`}
    >
      {/* Top strip */}
      <div className="bg-beige-800 text-beige-50 py-1.5 text-xs md:text-sm font-light px-4 md:px-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          <p>Empieza la temporada de Verano! ☀️😎</p>
          <div className="flex items-center mt-1 sm:mt-0">
            <span className="font-medium">Teléfono:</span>
            <p className="ml-1 hover:underline cursor-pointer">
              +54 3872226885
            </p>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-beige-800 hover:text-beige-600 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 md:w-11 md:h-11 relative rounded-full overflow-hidden border border-beige-300 shadow-sm">
              <Image
                src="/almalucia.webp"
                alt="Alma Lucia"
                fill
                className="object-cover"
              />
            </div>
            <span className="font-serif text-xl md:text-2xl text-beige-800 hidden sm:block">
              Alma Lucia
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-2">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/tienda">Tienda</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <CartIcon />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1 h-9 px-3 rounded-md bg-beige-200/60 hover:bg-beige-300 text-beige-700 font-medium">
                  <span className="hidden sm:inline-block max-w-[120px] truncate">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-beige-50 border border-beige-200 shadow-lg"
                >
                  <div className="px-3 py-2 text-sm font-medium text-beige-800 border-b border-beige-200">
                    <p className="truncate">{user.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/perfil"
                      className="flex items-center text-beige-700 hover:text-beige-900"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-beige-200" />

                  <DropdownMenuItem asChild>
                    <form action={signOutAction} className="w-full">
                      <button className="flex items-center w-full text-beige-700 hover:text-beige-900">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center space-x-1">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="text-beige-700 hover:text-beige-900 hover:bg-beige-200/60"
                >
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>

                <Button
                  asChild
                  className="bg-beige-700 hover:bg-beige-800 text-beige-50 shadow-md"
                >
                  <Link href="/sign-up">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-beige-50 border-t border-beige-200 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-3">
              <MobileNav href="/" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </MobileNav>
              <MobileNav href="/tienda" onClick={() => setIsMenuOpen(false)}>
                Tienda
              </MobileNav>
              {isAdmin && (
                <MobileNav href="/admin" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </MobileNav>
              )}

              {!user && (
                <>
                  <div className="h-px bg-beige-200 my-2"></div>
                  <MobileNav href="/login">Iniciar Sesión</MobileNav>
                  <MobileNav href="/sign-up">Registrarse</MobileNav>
                </>
              )}

              {user && (
                <>
                  <div className="h-px bg-beige-200 my-2" />
                  <div className="px-3 py-2 text-sm text-beige-800 font-medium truncate">
                    {user.email}
                  </div>

                  <MobileNav href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Mi Perfil
                  </MobileNav>

                  <form action={signOutAction} className="w-full mt-2">
                    <button className="w-full flex items-center px-3 py-2 text-beige-700 hover:bg-beige-200 rounded-md">
                      <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
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

/* --- Subcomponents --- */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-beige-700 hover:text-beige-900 hover:bg-beige-200/50 rounded-md text-sm font-medium transition"
    >
      {children}
    </Link>
  );
}

function MobileNav({
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
      onClick={onClick}
      className="flex items-center px-3 py-2 text-beige-700 hover:text-beige-900 hover:bg-beige-200/60 rounded-md text-sm"
    >
      {children}
    </Link>
  );
}
