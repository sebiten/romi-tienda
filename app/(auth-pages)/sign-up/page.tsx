import { signUpAction } from "@/app/actions"
import { FormMessage } from "@/components/form-message"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { LucideGithub, ChromeIcon as LucideGoogle, LucideUser, LucideMail, LucideLock, LucidePhone } from "lucide-react"

export default async function Signup(props: { searchParams: { [key: string]: string | undefined } }) {
  const searchParams = await props.searchParams

  return (
    <div className="container flex items-center justify-center min-h-screen py-10 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LucideUser className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Registro</CardTitle>
          <CardDescription className="text-center">Crea una cuenta para comenzar</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={signUpAction}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideMail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideUser className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input id="name" name="name" placeholder="John Doe" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_phone" className="text-sm font-medium">
                Teléfono
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucidePhone className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input id="user_phone" name="user_phone" placeholder="38865759223" className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <LucideLock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">La contraseña debe tener al menos 6 caracteres</p>
            </div>

            <FormMessage message={searchParams} />

            <SubmitButton className="w-full" pendingText="Registrando..." formAction={signUpAction}>
              Registrarse
            </SubmitButton>
          </form>


        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link className="text-primary font-medium hover:underline" href="/sign-in">
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
