import type { Metadata, Viewport } from "next";
import { SWRegister } from "@/components/SWRegister";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://imhere.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "I'm Here — check-in social",
    template: "%s · I'm Here",
  },
  description:
    "Descubra quem está no seu lugar favorito agora. Faça check-in em bares, restaurantes, baladas e conecte-se em tempo real.",
  applicationName: "I'm Here",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "I'm Here",
    startupImage: "/icon-512.png",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "I'm Here",
    title: "I'm Here — descubra quem tá no seu lugar agora",
    description:
      "Check-in social em bares, restaurantes e baladas. Conheça gente real, em tempo real, no lugar onde você está.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "I'm Here · descubra quem tá no seu lugar agora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "I'm Here — descubra quem tá no seu lugar agora",
    description:
      "Check-in social em bares, restaurantes e baladas. Conheça gente real, em tempo real.",
    images: ["/og.png"],
  },
  keywords: [
    "check-in social",
    "rede social geolocalizada",
    "encontrar pessoas",
    "bares e baladas",
    "vida noturna",
    "conhecer gente",
    "litoral SC",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
