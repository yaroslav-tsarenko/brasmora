import type { Metadata, Viewport } from "next";
import { getLocale } from "next-intl/server";
import { preload } from "react-dom";
import "@fontsource-variable/commissioner/wght.css";
import "./fonts.css";
import "@/styles/globals.css";
import { BRAND, SITE_URL } from "@/lib/brand";

const SITE_DESCRIPTION = "Cookware, bakeware, tableware, glassware and bar tools, delivered to the UK and EU.";

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: SITE_DESCRIPTION,
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
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: SITE_DESCRIPTION,
    locale: "en_GB",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B2620" },
    { media: "(prefers-color-scheme: dark)", color: "#120D0B" },
  ],
};

const THEME_INIT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var d=document.documentElement;d.setAttribute("data-theme",t);d.classList.toggle("dark",t==="dark")}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  preload("/fonts/gloock-latin-400-normal.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        {children}
      </body>
    </html>
  );
}
