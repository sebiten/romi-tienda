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
import { useState } from "react";
import { ArrowRight, MailCheck, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/client";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(125,91,63,0.14)] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
          Recuperación segura
        </span>
        <h1 className="font-serif text-4xl text-[var(--color-ink)]">Recuperá tu acceso</h1>
        <p className="max-w-md text-sm leading-7 text-[var(--color-muted)]">
          Ingresá tu email y te vamos a enviar un enlace para crear una nueva contraseña de forma segura.
        </p>
      </div>

      {success ? (
        <Card className="surface-border overflow-hidden rounded-[1.8rem] border bg-white/90 shadow-[0_18px_45px_rgba(74,54,39,0.08)] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-[#4B3A2E]">Revisá tu correo</CardTitle>
            <CardDescription className="text-[#5C4A38]">
              Te enviamos instrucciones para recuperar tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-[rgba(231,224,214,0.45)] px-4 py-4 text-sm text-[var(--color-muted)]">
              <div className="flex items-start gap-3">
                <MailCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <p>Si el email está registrado, vas a recibir un enlace para definir una nueva contraseña.</p>
              </div>
            </div>
            <Button asChild className="w-full rounded-xl bg-[#4B3A2E] text-white hover:bg-[#3e3026]">
              <Link href="/login">Volver a iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="surface-border overflow-hidden rounded-[1.8rem] border bg-white/90 shadow-[0_18px_45px_rgba(74,54,39,0.08)] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-[#4B3A2E]">Recuperar contraseña</CardTitle>
            <CardDescription className="text-[#5C4A38]">
              Usá el mismo email con el que creaste tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="font-medium text-[#4B3A2E]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tucorreo@example.com"
                    required
                    className="border-[#D6CCBF] bg-white text-[#4B3A2E]"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-[rgba(231,224,214,0.45)] px-4 py-3 text-sm text-[var(--color-muted)]">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <p>El enlace de recuperación te lleva a una pantalla segura para actualizar tu contraseña.</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-xl bg-[#4B3A2E] font-semibold text-white shadow-sm transition-all hover:bg-[#3e3026]"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : (
                    <span className="inline-flex items-center gap-2">
                      Enviar enlace
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>

              <div className="mt-4 text-center text-sm text-[#4B3A2E]">
                ¿Recordaste tu contraseña?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-[#2E241D]">
                  Iniciar sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
