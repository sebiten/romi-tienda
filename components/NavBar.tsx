
import Link from "next/link";
import { signOutAction } from "@/app/actions";
import { createClient } from "@/utils/supabase/server";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ThemeSwitcher } from "./theme-switcher";


export default async function Navbar() {
  // Creamos el cliente de Supabase en el servidor
  const supabase = await createClient();

  // Obtenemos al usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className=" shadow-sm p-4">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        {/* Sección izquierda: Link de Inicio y, si hay user, link a Perfil */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Badge variant="secondary" className="cursor-pointer">
              Inicio
            </Badge>
          </Link>
          {user && (
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Perfil
              </Button>
            </Link>
          )}
        </div>

        {/* Sección derecha: Theme Switcher + estado de usuario */}
        <div className="flex gap-2 items-center mt-2 md:mt-0">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {user ? (
            <>
              <span className="text-sm text-gray-600">Hey, {user.email}!</span>
              <form action={signOutAction}>
                <Button type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
