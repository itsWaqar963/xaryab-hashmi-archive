import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xaryab Hashmi | Knowledge Archive & Video Directory",
  description: "Official digital archive dedicated to the lectures, podcasts, and teachings of Xaryab Hashmi — Journey Towards Karbala & The Grey Lounge.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/icon-192.png",
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  verification: {
    google: "HJfNlsnSQ7xNb4a9bMdFuTsXSSUqfxxj4fKr3uNQITg",
  },
  openGraph: {
    title: "The Xaryab Hashmi Archive",
    description: "Timeless ideas, philosophy, spirituality and lectures — collected in one searchable archive.",
    url: "https://xaryabhashmi.vercel.app",
    siteName: "Xaryab Hashmi Archive",
    images: [
      {
        url: "/images/xaryab-hashmi.jpg",
        width: 1200,
        height: 630,
        alt: "Xaryab Hashmi Archive",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Xaryab Hashmi Archive",
    description: "Timeless ideas, philosophy, spirituality and lectures — collected in one searchable archive.",
    images: ["/images/xaryab-hashmi.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-white">
        {children}
      </body>
    </html>
  );
}
