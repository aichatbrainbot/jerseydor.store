import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "JerseyDor Admin",
    template: "%s | JerseyDor Admin",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  );
}
