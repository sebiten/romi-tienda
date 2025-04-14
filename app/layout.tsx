import type React from "react";
import "./globals.css";
import { Playfair_Display } from "next/font/google";

import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import { redirect } from "next/navigation";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user for Navbar
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3) Consultamos la tabla profiles para ver isadmin
  const { data: profileData, error: isAdminError } = await supabase
    .from("profiles")
    .select("isadmin")
    .eq("id", user?.id)
    .single();

  if (isAdminError || !profileData) {
    // Si no se pudo obtener el perfil, o no existe
    redirect("/");
  }
  const isAdmin = profileData.isadmin;

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar user={user} isAdmin={isAdmin} />
          <main> {children}</main>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}
