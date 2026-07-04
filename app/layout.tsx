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
  title: "Horely · Turnos online",
  description:
    "Reservá tu turno en Barbería Norte en menos de un minuto. Horely, turnos online sin vueltas.",
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
