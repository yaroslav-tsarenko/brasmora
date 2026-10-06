import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

/**
 * Every locale the storefront serves. English is the default and the fallback
 * for anything unrecognised; the order here is the order the language menu
 * shows.
 *
 * Adding one means three things and no more: an entry here, a `messages/<code>.json`
 * translated from `en.json`, and a label in LOCALE_LABELS below.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "sv", "pt"],
  defaultLocale: "en",
  // Every path carries its locale (/en, /fr, …) so a URL is shareable and a
  // page always knows which language to render.
  localePrefix: "always",
  // On a first visit with no stored choice, honour the browser's Accept-Language
  // before falling back to English.
  localeDetection: true,
  // The chosen locale survives across visits. The proxy writes this cookie on
  // every language switch; the client mirrors it into localStorage too.
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];

/**
 * What each language is called in that language — a Swede looking for their
 * language scans for "Svenska", not for "Swedish".
 */
export const LOCALE_LABELS: Record<Locale, { native: string; short: string }> = {
  en: { native: "English", short: "EN" },
  fr: { native: "Français", short: "FR" },
  es: { native: "Español", short: "ES" },
  sv: { native: "Svenska", short: "SV" },
  pt: { native: "Português", short: "PT" },
};

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
