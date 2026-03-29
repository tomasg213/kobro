import type { Metadata } from "next";
import "./globals.css";
import { BusinessProvider } from "@/contexts/BusinessContext";

export const metadata: Metadata = {
  title: "Kobro - WhatsApp B2B Platform",
  description: "Plataforma de mensajería automatizada de WhatsApp para empresas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        <BusinessProvider>{children}</BusinessProvider>
      </body>
    </html>
  );
}
