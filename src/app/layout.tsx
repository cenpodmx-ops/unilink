import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Unilink — Tu negocio en un link",
  description:
    "Crea la página profesional de tu negocio: servicios, precios, ubicación, redes, WhatsApp y citas en un solo enlace. Pago único. Sin complicaciones.",
  keywords: [
    "página de negocio",
    "micrositio",
    "link en bio",
    "negocios pequeños",
    "presencia digital",
    "tarjeta digital",
    "agendamiento",
  ],
  authors: [{ name: "Unilink" }],
  openGraph: {
    title: "Unilink — Tu negocio en un link",
    description:
      "Crea la página profesional de tu negocio en un solo enlace. Servicios, precios, ubicación, WhatsApp y citas.",
    siteName: "Unilink",
    type: "website",
    locale: "es_MX",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unilink — Tu negocio en un link",
    description: "Crea la página profesional de tu negocio en un solo enlace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
