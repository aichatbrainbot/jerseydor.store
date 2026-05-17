import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { MobileDock } from "@/components/MobileDock";
import { Navbar } from "@/components/Navbar";

const SITE_URL = "https://jerseydor.store";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "JerseyDor",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
};

export const metadata: Metadata = {
  title: {
    default: "JerseyDor | Premium Football Jerseys",
    template: "%s | JerseyDor",
  },
  description: "Premium football jerseys, retro shirts, player version kits, and streetwear-ready football pieces with clear product photography.",
  openGraph: {
    title: "JerseyDor | Premium Football Jerseys",
    description: "Premium football jerseys, retro shirts, player version kits, and streetwear-ready football pieces with clear product photography.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "JerseyDor",
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
    title: "JerseyDor | Premium Football Jerseys",
    description: "Premium football jerseys, retro shirts, player version kits, and streetwear-ready football pieces with clear product photography.",
    images: ["https://jerseydor.store/og-image.png"],
  },
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Navbar />
      <main className="flex min-h-screen flex-col">
        {children}
      </main>
      <Footer />
      <MobileDock />
    </>
  );
}
