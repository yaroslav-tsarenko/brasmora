import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { Bricolage_Grotesque, Karla } from "next/font/google";
import "@/styles/globals.css";

// Brand type: Bricolage Grotesque for display/headings, Karla for body —
// deliberately distinct from the sibling store's Geist stack.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Solvetaworld — Electrical Materials & Supplies",
    template: "%s | Solvetaworld",
  },
  description: "Your trusted source for electrical materials, wiring, and installation supplies. Professional quality delivered to your door.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  applicationName: "Solvetaworld",
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
    siteName: "Solvetaworld",
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
  // Read from the request rather than hardcoded, so a French page is served as
  // French to screen readers and to the browser's translate prompt.
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${karla.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}