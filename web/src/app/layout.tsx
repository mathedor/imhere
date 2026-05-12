import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I'm Here — check-in social",
  description:
    "Descubra quem está no seu lugar favorito agora. Faça check-in em bares, restaurantes, baladas e conecte-se em tempo real.",
  applicationName: "I'm Here",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "I'm Here" },
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
      <body>{children}</body>
    </html>
  );
}
