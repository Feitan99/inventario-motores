import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const SITE_URL = "https://eurodaguer.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EuroDaguer — Culatas de Motor | Peñaflor, Santiago",
    template: "%s | EuroDaguer",
  },
  description:
    "Compra culatas de motor para autos y camionetas en Peñaflor, Región Metropolitana. Stock amplio de culatas verificadas con garantía de procedencia. Atendemos todo Santiago.",
  keywords: [
    "culatas de motor",
    "culatas usadas",
    "culatas reconstruidas",
    "culatas Santiago",
    "culatas Peñaflor",
    "culatas autos",
    "culatas camionetas",
    "repuestos motor Chile",
    "EuroDaguer",
  ],
  authors: [{ name: "EuroDaguer" }],
  creator: "EuroDaguer",
  openGraph: {
    title: "EuroDaguer — Culatas de Motor | Peñaflor, Santiago",
    description:
      "Stock amplio de culatas para autos y camionetas en Peñaflor, RM. Todas verificadas, con garantía de procedencia.",
    url: SITE_URL,
    siteName: "EuroDaguer",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EuroDaguer — Culatas de Motor",
    description:
      "Stock amplio de culatas verificadas en Peñaflor, Región Metropolitana. Atendemos todo Santiago.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  name: "EuroDaguer",
  description:
    "Venta de culatas de motor para autos y camionetas. Stock amplio, todas verificadas con garantía de procedencia.",
  url: SITE_URL,
  telephone: "+56978740432",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Camino a Melipilla 4500",
    addressLocality: "Peñaflor",
    addressRegion: "Región Metropolitana",
    addressCountry: "CL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -33.5963,
    longitude: -70.9063,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday"],
      opens: "09:00",
      closes: "14:00",
    },
  ],
  areaServed: {
    "@type": "State",
    name: "Región Metropolitana",
  },
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
      >
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          <Navbar />
          {children}
          <footer>
            © 2026 EuroDaguer — Todos los derechos reservados
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
