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
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border border-[#D6CCBF] bg-[#E7E0D6] shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-[#4B3A2E] font-semibold">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-[#5C4A38]">
            Accedé a tu cuenta para continuar con tu compra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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

              {/* Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#D6CCBF] hover:bg-[#C8BCAE] text-[#4B3A2E] font-semibold rounded-lg shadow-sm transition-all"
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </Button>
            </div>

            {/* Register link */}
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
