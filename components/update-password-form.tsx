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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/client";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      router.push("/login");
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
          <CardTitle className="text-2xl text-[#4B3A2E]">
            Restablecer contraseña
          </CardTitle>
          <CardDescription className="text-[#5C4A38]">
            Ingresá tu nueva contraseña.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[#4B3A2E] font-medium">
                  Nueva contraseña
                </Label>

                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="bg-white border-[#D6CCBF] text-[#4B3A2E]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-[#D6CCBF] hover:bg-[#C8BCAE] text-[#4B3A2E] font-semibold rounded-lg shadow-sm transition-all"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
