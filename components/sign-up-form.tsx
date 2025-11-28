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
      // 1) Crear usuario
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // 2) Iniciar sesión automáticamente
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 3) Redirigir a la tienda
      router.push("/tienda");

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-[#D6CCBF] bg-[#E7E0D6] shadow-sm rounded-xl">
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
              {/* Email */}
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

              {/* Password */}
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
                  className="bg-white border-[#D6CCBF] text-[#4B3A2E]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Repeat */}
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

              {/* Button */}
              <Button
                type="submit"
                className="w-full bg-[#D6CCBF] hover:bg-[#C8BCAE] text-[#4B3A2E] font-semibold rounded-lg shadow-sm transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </div>

            {/* Already have account */}
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
