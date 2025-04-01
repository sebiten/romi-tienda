import type React from "react";
import "./globals.css";
import { Playfair_Display } from "next/font/google";

import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";

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

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${playfair.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar user={user} />
          <main> {children}</main>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}
