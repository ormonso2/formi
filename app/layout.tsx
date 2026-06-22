import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Background } from "@/components/layout/Background";
import { Header } from "@/components/layout/Header";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FORMI — Convierte archivos sin perder calidad",
  description:
    "Plataforma de conversión inteligente para equipos que exigen precisión y velocidad. Convierte documentos, imágenes y datos en segundos.",
  keywords: "convertir archivos, PDF, DOCX, PNG, JPG, conversión de archivos, FORMI",
  authors: [{ name: "FORMI" }],
  icons: {
    icon: [
      { url: "/2.png", sizes: "32x32", type: "image/png" },
      { url: "/2.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/2.png",
    apple: { url: "/2.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "FORMI",
    description: "Convierte archivos sin perder calidad.",
    siteName: "FORMI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{
          fontFamily: "'Sora', sans-serif",
          backgroundColor: "#0F1115",
          color: "#FFFFFF",
        }}
      >
        <AuthProvider>
          <Background />
          <Header />
          <main className="flex-1 pt-32 sm:pt-40">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'glass',
              style: {
                background: 'rgba(18, 22, 27, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                color: '#FFFFFF',
                fontFamily: "'Sora', sans-serif",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
