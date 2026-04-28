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
import { ArrowRight, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/client";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/tienda");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Nueva cuenta
        </span>
        <h1 className="font-serif text-4xl text-[var(--color-ink)]">Creá tu espacio</h1>
        <p className="max-w-md text-sm leading-7 text-[var(--color-muted)]">
          Registrate para guardar tus datos, agilizar el checkout y seguir tus compras con más comodidad.
        </p>
      </div>

      <Card className="surface-border overflow-hidden rounded-[1.8rem] border bg-white/90 shadow-[0_18px_45px_rgba(74,54,39,0.08)] backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl text-[#4B3A2E] font-semibold">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-[#5C4A38]">
            Registrate para comenzar tus compras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
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
                <Label
                  htmlFor="password"
                  className="text-[#4B3A2E] font-medium"
                >
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="bg-white border-[#D6CCBF] text-[#4B3A2E]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="repeat-password"
                  className="text-[#4B3A2E] font-medium"
                >
                  Repetir contraseña
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  className="bg-white border-[#D6CCBF] text-[#4B3A2E]"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-[rgba(231,224,214,0.45)] px-4 py-3 text-sm text-[var(--color-muted)]">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                  <p>Al crear la cuenta podés comprar más rápido, mantener tus datos listos y continuar el checkout sin fricción.</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-[#4B3A2E] font-semibold text-white shadow-sm transition-all hover:bg-[#3e3026]"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : (
                  <span className="inline-flex items-center gap-2">
                    Crear cuenta
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-[#4B3A2E]">
              ¿Ya tenés cuenta?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-[#2E241D]"
              >
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
