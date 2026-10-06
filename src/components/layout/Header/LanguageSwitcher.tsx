"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Check, Globe } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { hasMultipleLocales, isLocale, localeLabels, locales, defaultLocale, type Locale } from "@/i18n/config";
import { setLocale } from "@/i18n/client";

export function LanguageSwitcher() {
  if (!hasMultipleLocales) return null;
  return <LanguageMenu />;
}

function LanguageMenu() {
  const rendered = useLocale();
  const locale: Locale = isLocale(rendered) ? rendered : defaultLocale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    setLocale(next, router);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        className="flex h-9 items-center gap-1 rounded-md px-2 text-ink-muted transition-colors hover:bg-surface-1 hover:text-ink"
      >
        <Globe size={19} />
        <span className="text-xs font-semibold tracking-wide max-sm:hidden">{localeLabels[locale].short}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Language"
          className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-md border border-line bg-surface py-1 shadow-md"
        >
          {locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => switchTo(code)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-1 ${
                    active ? "font-semibold text-ink" : "text-ink-muted"
                  }`}
                >
                  <span className="w-7 shrink-0 text-xs font-semibold tracking-wide text-ink-subtle">
                    {localeLabels[code].short}
                  </span>
                  <span className="flex-1">{localeLabels[code].native}</span>
                  {active ? <Check size={15} className="shrink-0 text-brand" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
