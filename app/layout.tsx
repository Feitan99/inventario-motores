import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Navbar from "../components/Navbar";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "EuroDaguer — Catálogo de Motores",
  description: "Amplio stock de motores para autos y camionetas. Todos verificados, con garantía de procedencia.",
  openGraph: {
    title: "EuroDaguer — Catálogo de Motores",
    description: "Amplio stock de motores para autos y camionetas. Todos verificados, con garantía de procedencia.",
    url: "https://eurodaguer.com",
    siteName: "EuroDaguer",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EuroDaguer — Catálogo de Motores",
    description: "Amplio stock de motores verificados.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${barlow.variable} ${barlowCondensed.variable} antialiased`}
      >
        <Navbar />
        {children}
        <footer>
          © 2026 EuroDaguer — Todos los derechos reservados
        </footer>
      </body>
    </html>
  );
}

