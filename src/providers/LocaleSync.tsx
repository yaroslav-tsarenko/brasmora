"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

export const LOCALE_STORAGE_KEY = "locale";

// Mirrors the locale that the server rendered into localStorage. The cookie is
// the source of truth for SSR (the proxy reads it), but keeping localStorage in
// sync lets client code read the preference without parsing cookies and makes
// the choice inspectable/portable on the client.
export function LocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    try {
      if (localStorage.getItem(LOCALE_STORAGE_KEY) !== locale) {
        localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      }
    } catch {
      // storage unavailable (private mode, blocked) — non-fatal
    }
  }, [locale]);

  return null;
}
