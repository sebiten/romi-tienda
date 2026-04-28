import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#F5F0E7] px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(177,146,113,0.22),transparent_62%)]" />
      <div className="relative w-full max-w-lg">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(125,91,63,0.08)] text-[var(--color-accent)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl text-[var(--color-ink)]">Revisá tu correo</h1>
          <p className="mx-auto max-w-md text-sm leading-7 text-[var(--color-muted)]">
            Ya registramos tu cuenta. Solo falta confirmar tu email para que puedas iniciar sesión y seguir comprando.
          </p>
        </div>

        <Card className="surface-border mt-6 overflow-hidden rounded-[1.8rem] border bg-white/90 shadow-[0_18px_45px_rgba(74,54,39,0.08)] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#4B3A2E]">
              Confirmación pendiente
            </CardTitle>
            <CardDescription className="text-[#5C4A38]">
              Buscá el mensaje en tu casilla principal, promociones o spam.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-[rgba(231,224,214,0.45)] px-4 py-4 text-sm text-[var(--color-muted)]">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                <p>Cuando confirmes tu email, vas a poder entrar con normalidad y continuar el proceso de compra desde tu cuenta.</p>
              </div>
            </div>

            <Button asChild className="w-full rounded-xl bg-[#4B3A2E] text-white hover:bg-[#3e3026]">
              <Link href="/login">Ir a iniciar sesión</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
