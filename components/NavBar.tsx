"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, Menu, Sparkles, User, X } from "lucide-react";

import { signOutAction } from "@/app/actions";
import { CartIcon } from "./CartIcon";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-beige-200/70 bg-beige-50/85 backdrop-blur-xl shadow-[0_12px_35px_rgba(93,75,60,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="border-b border-beige-200/60 bg-beige-900 text-[11px] font-medium uppercase tracking-[0.22em] text-beige-100 md:text-xs">
        <div className="container mx-auto flex flex-col items-center justify-between gap-1 px-4 py-2 sm:flex-row">
          <div className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Nueva temporada disponible online
          </div>
          <div className="text-beige-200/90">
            Envíos a todo el país · Salta, Argentina
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          <button
            className="p-2 text-beige-800 transition hover:text-beige-600 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-beige-300/80 bg-white shadow-sm md:h-12 md:w-12">
              <Image
                src="/almalucia.webp"
                alt="Alma Lucia"
                fill
                className="object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block font-serif text-xl text-beige-900 md:text-2xl">
                Alma Lucia
              </span>
              <span className="block text-[11px] uppercase tracking-[0.22em] text-beige-500">
                Indumentaria
              </span>
            </div>
          </Link>

          <nav className="hidden items-center space-x-2 rounded-full border border-beige-200/70 bg-white/70 px-3 py-2 shadow-sm md:flex">
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/tienda">Tienda</NavLink>
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-3">
            <CartIcon />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-10 items-center gap-1 rounded-full border border-beige-200 bg-white/85 px-4 font-medium text-beige-700 shadow-sm transition hover:bg-white">
                  <span className="hidden max-w-[120px] truncate sm:inline-block">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown size={16} />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 border border-beige-200 bg-beige-50 shadow-lg"
                >
                  <div className="border-b border-beige-200 px-3 py-2 text-sm font-medium text-beige-800">
                    <p className="truncate">{user.email}</p>
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/perfil"
                      className="flex items-center text-beige-700 hover:text-beige-900"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mi perfil
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-beige-200" />

                  <DropdownMenuItem asChild>
                    <form action={signOutAction} className="w-full">
                      <button className="flex w-full items-center text-beige-700 hover:text-beige-900">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden items-center space-x-1 sm:flex">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="rounded-full px-4 text-beige-700 hover:bg-white/80 hover:text-beige-900"
                >
                  <Link href="/login">Iniciar sesión</Link>
                </Button>

                <Button
                  asChild
                  className="rounded-full bg-beige-800 px-5 text-beige-50 shadow-md transition hover:bg-beige-900"
                >
                  <Link href="/sign-up">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-beige-200 bg-beige-50 shadow-lg animate-in fade-in slide-in-from-top-2 md:hidden">
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
                  <div className="my-2 h-px bg-beige-200"></div>
                  <MobileNav href="/login">Iniciar sesión</MobileNav>
                  <MobileNav href="/sign-up">Registrarse</MobileNav>
                </>
              )}

              {user && (
                <>
                  <div className="my-2 h-px bg-beige-200" />
                  <div className="truncate px-3 py-2 text-sm font-medium text-beige-800">
                    {user.email}
                  </div>

                  <MobileNav href="/perfil">
                    <User className="mr-2 h-4 w-4" />
                    Mi perfil
                  </MobileNav>

                  <form action={signOutAction} className="mt-2 w-full">
                    <button className="flex w-full items-center rounded-md px-3 py-2 text-beige-700 hover:bg-beige-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
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
      className="rounded-full px-4 py-2 text-sm font-medium text-beige-700 transition hover:bg-beige-200/50 hover:text-beige-900"
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
      className="flex items-center rounded-md px-3 py-2 text-sm text-beige-700 hover:bg-beige-200/60 hover:text-beige-900"
    >
      {children}
    </Link>
  );
}
