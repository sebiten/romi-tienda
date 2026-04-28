import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Page({ searchParams }: { searchParams: Promise<{ error: string }> }) {
  const params = await searchParams

  return (
    <div className="relative flex min-h-svh w-full items-center justify-center overflow-hidden bg-[#F5F0E7] px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(177,146,113,0.22),transparent_62%)]" />
      <div className="relative w-full max-w-lg">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(125,91,63,0.08)] text-[var(--color-accent)]">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-4xl text-[var(--color-ink)]">Algo salió mal</h1>
          <p className="mx-auto max-w-md text-sm leading-7 text-[var(--color-muted)]">
            No pudimos completar la acción. Si estabas validando acceso o recuperando tu cuenta, podés intentarlo nuevamente.
          </p>
        </div>

        <Card className="surface-border mt-6 overflow-hidden rounded-[1.8rem] border bg-white/90 shadow-[0_18px_45px_rgba(74,54,39,0.08)] backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-[#4B3A2E]">Detalle del error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-2xl border border-[rgba(125,91,63,0.12)] bg-[rgba(231,224,214,0.45)] px-4 py-4 text-sm text-[var(--color-muted)]">
              {params?.error ? (
                <p>Código recibido: <span className="font-medium text-[var(--color-ink)]">{params.error}</span></p>
              ) : (
                <p>No recibimos un código específico, pero la operación no pudo completarse.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1 rounded-xl bg-[#4B3A2E] text-white hover:bg-[#3e3026]">
                <Link href="/login">Volver al inicio de sesión</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 rounded-xl border-[rgba(125,91,63,0.18)]">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
