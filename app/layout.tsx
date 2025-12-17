import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reservas Tandem Centinela",
  description: "Sistema de reserva de pasajes de bus para Tandem Centinela",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Centinela",
  },
  icons: {
    icon: "/icons/icon-512.png", // 👈 faltaba (Android / desktop)
    apple: "/apple-icon-180.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover", // 👈 CLAVE para fullscreen iOS
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
