import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-src",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body-src",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://horely.lykos.com.ar"),
  title: {
    default: "Horely · Sistema de Reserva de Turnos Online",
    template: "%s · Horely",
  },
  description:
    "Sistema web de reserva de turnos online y panel de administración en tiempo real. Demo por Lykos Software Solutions.",
  openGraph: {
    title: "Horely · Sistema de Reserva de Turnos Online",
    description:
      "Plataforma de reserva de turnos online y panel de administración en tiempo real por Lykos Software Solutions.",
    url: "https://horely.lykos.com.ar",
    siteName: "Horely",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Horely · Sistema de Reserva de Turnos Online",
    description:
      "Plataforma de reserva de turnos online y panel de administración en tiempo real por Lykos Software Solutions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body
        className={`${display.variable} ${body.variable} bg-paper text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
