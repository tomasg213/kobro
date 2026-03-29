import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
