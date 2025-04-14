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
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user?.id) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("isadmin")
      .eq("id", user.id)
      .single();

    isAdmin = profileData?.isadmin ?? false;
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navbar user={user} isAdmin={isAdmin} />
          <main>{children}</main>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  );
}
