"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    });

    if (error) {
      setErrorMessage(error.message || "Algo salió mal");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitted(true);
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-14 bg-[#1F1F22] text-white">
      <CardHeader className="space-y-1">
        <div className="flex items-center">
          <img
            src="/logoreal.webp"
            alt="Logo"
            className="mr-2 h-10 w-10"
          />
          <CardTitle className="text-2xl font-bold text-white">VitaeSpark</CardTitle>
        </div>

        <CardDescription className="text-gray-300">
          {!isSubmitted
            ? "Ingresa tu correo electrónico para recuperar tu contraseña"
            : "Revisa tu bandeja de entrada"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                className="bg-[#2A2A2D] border-[#3A3A3D] text-white"
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Recuperar Contraseña"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="rounded-full bg-green-100 p-3 mx-auto w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <p>
              Hemos enviado un correo a <strong>{email}</strong> con las instrucciones.
            </p>
            <p className="text-lg text-green-500 animate-pulse">
              Si no lo ves, revisa tu carpeta de spam.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="w-full text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-sm hover:underline text-white"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
