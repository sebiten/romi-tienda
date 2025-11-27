import type React from "react";
import type { Metadata, Viewport } from "next";
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

// ---------- CONFIGURACIÓN SEO GLOBAL ----------

const SITE_NAME = "Alma Lucía";
const SITE_DESCRIPTION =
  "Alma Lucía es una tienda de ropa femenina y masculina en Salta-Argentina. Moda actual, talles reales y toda la moda.";
const SITE_URL = "https://almalucia.shop";
const OG_IMAGE = `${SITE_URL}/almalucia.webp`; // Imagen principal
const LOGO_IMAGE = `${SITE_URL}/almalucia.webp`; // También como logo para schema

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Moda femenina y masculina`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "alma lucía",
    "almalucia",
    "ropa femenina",
    "tienda online de ropa",
    "moda mujer argentina",
    "ropa argentina",
    "envíos a todo el país",
    "talles reales",
    "tienda de ropa en Salta",
    "shop online argentina",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | Moda femenina y masculina online en Argentina`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "es_AR",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - tienda de ropa femenina y masculina online`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Moda femenina y masculina online en Argentina`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/almalucia.webp", type: "image/webp" },
    ],
    apple: [{ url: "/almalucia.webp", sizes: "180x180" }],
  },
  category: "fashion",
};

// Mejor UX/SEO mobile
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
};

// Schema.org — Organization + ClothingStore
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ClothingStore"],
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_IMAGE,
  image: OG_IMAGE,
  sameAs: [
    // poner tus redes reales si las tenés
    "https://www.instagram.com/almalucia08",
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "AR",
    addressRegion: "Salta",
    addressLocality: "Salta",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+54-XXX-XXXXXXX", // si no querés poner teléfono, lo elimino
      contactType: "customer service",
      availableLanguage: ["es"],
      areaServed: "AR",
    },
  ],
};

// ---------- ROOT LAYOUT ----------

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
    <html lang="es-AR" suppressHydrationWarning>
      <body className={`${playfair.variable} font-sans antialiased`}>
        {/* JSON-LD para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Navbar user={user} isAdmin={isAdmin} />
          <main >{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
