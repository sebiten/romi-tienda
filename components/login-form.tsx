"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/client";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Acceso seguro
        </span>
        <h1 className="font-serif text-4xl text-[var(--color-ink)]">Bienvenida otra vez</h1>
        <p className="max-w-md text-sm leading-7 text-[var(--color-muted)]">
          Ingresá a tu cuenta para revisar pedidos, continuar tu compra y gestionar el checkout con tus datos guardados.
        </p>
      </div>

      <Card className="surface-border overflow-hidden rounded-[1.8rem] border bg-white/90 shadow-[0_18px_45px_rgba(74,54,39,0.08)] backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-[#4B3A2E] font-semibold">
            Iniciar sesión
          </CardTitle>
          <CardDescription className="text-[#5C4A38]">
            Usá tu email y contraseña para entrar de forma segura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#4B3A2E] font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tucorreo@example.com"
                  required
                  className="bg-white border-[#D6CCBF] text-[#4B3A2E]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-[#4B3A2E] font-medium">
                    Contraseña
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm text-[#4B3A2E] hover:text-[#2E241D] underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="bg-white border-[#D6CCBF] text-[#4B3A2E]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-[rgba(231,224,214,0.45)] px-4 py-3 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <p>Tu sesión se valida con Supabase y el checkout vuelve a verificar precio, stock y envío antes del pago.</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#4B3A2E] font-semibold text-white shadow-sm transition-all hover:bg-[#3e3026]"
              >
                {isLoading ? "Ingresando..." : (
                  <span className="inline-flex items-center gap-2">
                    Ingresar
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-[#4B3A2E]">
              ¿No tenés cuenta?{" "}
              <Link
                href="/sign-up"
                className="underline underline-offset-4 hover:text-[#2E241D]"
              >
                Registrarse
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
