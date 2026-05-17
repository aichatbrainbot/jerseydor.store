import type { Metadata } from "next";
import { Inter, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Clarity from "@/components/Clarity";

const SITE_URL = "https://jerseydor.store";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "JerseyDor - Premium Football Streetwear",
    template: "%s | JerseyDor",
  },
  description:
    "Shop premium football jerseys styled for the streets. Retro kits, oversized silhouettes, and editorial drops at JerseyDor.",
  authors: [{ name: "JerseyDor", url: SITE_URL }],
  creator: "JerseyDor",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "JerseyDor",
    title: "JerseyDor - Premium Football Streetwear",
    description:
      "Shop premium football jerseys styled for the streets. Retro kits, oversized silhouettes, and editorial drops.",
    images: [
      {
        url: "https://jerseydor.store/og-image.png",
        width: 1200,
        height: 630,
        alt: "JerseyDor - Premium Football Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JerseyDor - Premium Football Streetwear",
    description:
      "Shop premium football jerseys styled for the streets. Retro kits, oversized silhouettes, and editorial drops.",
    images: ["https://jerseydor.store/og-image.png"],
    creator: "@jerseydor",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full font-sans bg-background text-foreground"
      >
        {children}
        <Clarity />
      </body>
    </html>
  );
}
