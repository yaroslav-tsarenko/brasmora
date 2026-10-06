import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/karla";
import "./fonts.css";
import "@/styles/globals.css";
import { BRAND, SITE_URL } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: "Your trusted source for electrical materials, wiring, and installation supplies. Professional quality delivered to your door.",
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND.name,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2E5E4E" },
    { media: "(prefers-color-scheme: dark)", color: "#161B18" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}