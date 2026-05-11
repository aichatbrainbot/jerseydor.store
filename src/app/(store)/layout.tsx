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
  description: "Premium football jerseys, retro shirts, player version kits, and streetwear-ready football pieces with real product imagery.",
  keywords: [
    "lamine yamal 7 year old jersey",
    "socceroos jersey",
    "chelsea shirts for sale",
    "arsenal jersey",
    "crystal palace kit",
    "retro football jersey",
    "streetwear soccer shirt",
    "custom football shirt",
    "vintage soccer jersey",
  ],
  openGraph: {
    title: "JerseyDor | Premium Football Jerseys",
    description: "Premium football jerseys, retro shirts, player version kits, and streetwear-ready football pieces with real product imagery.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "JerseyDor",
  },
  twitter: {
    card: "summary_large_image",
    title: "JerseyDor | Premium Football Jerseys",
    description: "Premium football jerseys, retro shirts, player version kits, and streetwear-ready football pieces with real product imagery.",
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
