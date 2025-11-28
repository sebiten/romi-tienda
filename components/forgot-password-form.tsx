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
      {success ? (
        <Card className="border border-[#D6CCBF] bg-[#E7E0D6] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-[#4B3A2E]">
              Revisá tu correo
            </CardTitle>
            <CardDescription className="text-[#5C4A38]">
              Te enviamos instrucciones para recuperar tu contraseña.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#4B3A2E]">
              Si tu email está registrado, vas a recibir un enlace para cambiar
              tu contraseña.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-[#D6CCBF] bg-[#E7E0D6] shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-[#4B3A2E]">
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-[#5C4A38]">
              Ingresá tu email y te enviaremos un enlace para restablecerla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
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

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full bg-[#D6CCBF] hover:bg-[#C8BCAE] text-[#4B3A2E] font-semibold rounded-lg shadow-sm transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar enlace"}
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
      )}
    </div>
  );
}
