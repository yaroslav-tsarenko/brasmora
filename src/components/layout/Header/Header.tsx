"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  Basket, MagnifyingGlass, List, X, UserCircle, Shield,
  CaretRight, Heart, CaretDown,
  Plugs, SquaresFour, Lightning, Lightbulb, Cpu, Plug,
  Cube, Wrench, Shield as ShieldIcon, Stack,
} from "@phosphor-icons/react";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AnimatePresence, motion } from "framer-motion";
import { SolvetaMark } from "../SolvetaMark";
import { cachedFetchJSON, readCached } from "@/lib/utils/reliable-fetch";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
  children?: Category[];
}

function subtreeCount(cat: Category): number {
  const own = cat._count?.products || 0;
  return own + (cat.children || []).reduce((s, c) => s + subtreeCount(c), 0);
}

const ICON_MAP: Record<string, React.ElementType> = {
  "wiring": Plugs,
  "cable": Plugs,
  "automation": Cpu,
  "control": Cpu,
  "distribution": SquaresFour,
  "energy": Lightning,
  "protection": ShieldIcon,
  "protective": ShieldIcon,
  "fuse": Lightning,
  "lighting": Lightbulb,
  "light": Lightbulb,
  "terminal": Stack,
  "mounting": Cube,
  "box": Cube,
  "conduit": Wrench,
  "connector": Plug,
  "power": Lightning,
  "plug": Plug,
};

function getIconForCategory(name: string) {
  const lower = name.toLowerCase();
  for (const [keyword, Icon] of Object.entries(ICON_MAP)) {
    if (lower.includes(keyword)) return Icon;
  }
  return SquaresFour;
}

const iconButtonCls =
  "relative flex items-center justify-center w-9 h-9 rounded-md bg-transparent border-0 cursor-pointer text-ink-muted transition-colors no-underline hover:bg-surface-1 hover:text-ink";
const navTabCls =
  "text-[0.8125rem] font-medium text-ink-muted transition-colors py-2.5 border-b-2 border-transparent whitespace-nowrap no-underline bg-transparent cursor-pointer hover:text-ink hover:border-brand focus-visible:text-ink focus-visible:border-brand";
const drawerNavLinkCls =
  "text-[0.9375rem] font-medium text-ink py-3 px-3 rounded-md flex items-center justify-between transition-colors no-underline hover:bg-surface-1";
const drawerBtnCls =
  "flex items-center justify-center py-3 rounded-md font-semibold text-sm border-0 cursor-pointer";

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { itemCount, cartBounce } = useCart();
  const { user, role } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Cache is read in an effect (not the useState initializer) so the first
  // client render matches the server markup — category tabs are now SSR'd.
  const [categories, setCategories] = useState<Category[]>([]);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const cached = readCached<Category[]>({ cacheKey: "header:categories", storage: "session" });
    if (cached) setCategories(cached);
    cachedFetchJSON<Category[]>("/api/categories", {
      cacheKey: "header:categories",
      storage: "session",
    })
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  const topCategories = useMemo(
    () => [...categories].sort((a, b) => subtreeCount(b) - subtreeCount(a)),
    [categories]
  );

  const openMega = useCallback(() => {
    clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 200);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/en/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-line bg-surface transition-shadow ${
          scrolled ? "shadow-[0_2px_8px_rgba(15,23,42,0.06)]" : ""
        }`}
      >
        {/* Tier 1: logo / catalog trigger / search / actions */}
        <div className="max-w-[1400px] mx-auto px-4 max-sm:px-3 lg:px-6 h-[64px] flex items-center gap-4 max-sm:gap-2">
          <button
            className={`${iconButtonCls} flex lg:hidden -ml-1`}
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <List size={22} />
          </button>

          <Link
            href="/"
            className="text-2xl max-sm:text-lg font-extrabold tracking-[-0.04em] text-ink whitespace-nowrap flex items-center gap-[0.4rem] max-sm:gap-1 shrink-0 no-underline"
          >
            <SolvetaMark size={24} gradientId="solvetaMarkHeader" />
            <span className="font-black">
              Solveta<span className="text-brand">world</span>
            </span>
          </Link>

          <div
            className="relative hidden lg:block shrink-0"
            ref={megaRef}
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button
              className="flex items-center gap-2 h-[38px] px-4 rounded-md bg-brand text-white text-[0.8125rem] font-semibold border-0 cursor-pointer transition-colors hover:bg-brand-hover"
              onClick={() => setMegaOpen(!megaOpen)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              <SquaresFour size={16} />
              {t("catalog")}
              <CaretDown
                size={14}
                style={{
                  transition: "transform 0.2s",
                  transform: megaOpen ? "rotate(180deg)" : undefined,
                }}
              />
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  className="absolute top-[calc(100%+8px)] left-0 z-[45] w-[560px] bg-surface border border-line rounded-lg shadow-[0_12px_40px_rgba(15,23,42,0.1)] overflow-hidden"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <div className="p-3">
                    {topCategories.length === 0 ? (
                      <div className="grid grid-cols-2 gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md">
                            <div className="w-9 h-9 rounded-md bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer shrink-0" />
                            <div className="flex flex-col gap-1.5 flex-1">
                              <div
                                className="h-2.5 rounded-[5px] bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer"
                                style={{ width: `${55 + (i * 17) % 35}%` }}
                              />
                              <div className="h-2.5 rounded-[5px] bg-[linear-gradient(90deg,var(--color-bg-tertiary)_25%,var(--color-bg-secondary)_50%,var(--color-bg-tertiary)_75%)] bg-[length:200%_100%] animate-shimmer w-[40%]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-1">
                        {topCategories.slice(0, 10).map((cat) => {
                          const Icon = getIconForCategory(cat.name);
                          const count = subtreeCount(cat);
                          return (
                            <Link
                              key={cat.id}
                              href={`/catalog/${cat.slug}`}
                              className="group flex items-center gap-3 px-3 py-2.5 rounded-md no-underline text-ink transition-colors hover:bg-surface-1"
                              onClick={() => setMegaOpen(false)}
                            >
                              <div className="w-9 h-9 rounded-md bg-brand-soft flex items-center justify-center shrink-0 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                                <Icon size={20} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[0.8rem] font-semibold leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                                  {cat.name}
                                </span>
                                <span className="text-[0.675rem] text-ink-subtle">
                                  {count} products
                                </span>
                              </div>
                              <CaretRight
                                size={14}
                                className="ml-auto shrink-0 text-line opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5"
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    <div className="mt-2 pt-2.5 border-t border-line flex items-center px-3 pb-1">
                      <Link
                        href="/catalog"
                        className="text-[0.8125rem] font-semibold text-brand flex items-center gap-1 no-underline transition-all hover:gap-2"
                        onClick={() => setMegaOpen(false)}
                      >
                        Browse all categories <CaretRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <form
            className="hidden md:flex flex-1 relative items-center h-[38px] border-2 border-brand rounded-lg overflow-hidden bg-surface"
            onSubmit={handleSearch}
            role="search"
          >
            <MagnifyingGlass size={16} className="absolute left-2.5 text-ink-subtle pointer-events-none" />
            <input
              type="text"
              className="flex-1 h-full pl-8 pr-3 border-0 outline-none text-[0.8125rem] bg-transparent text-ink placeholder:text-ink-subtle"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="h-full px-5 bg-brand text-white border-0 text-[0.8125rem] font-semibold cursor-pointer transition-colors whitespace-nowrap hover:bg-brand-hover"
            >
              {tCommon("search")}
            </button>
          </form>

          <div className="flex items-center gap-0.5 ml-auto shrink-0">
            <Link
              href="/search"
              className={`${iconButtonCls} flex md:hidden`}
              aria-label={t("search")}
            >
              <MagnifyingGlass size={20} />
            </Link>

            <LanguageSwitcher />

            <ThemeToggle />

            {user && (
              <Link href="/account/wishlist" className={iconButtonCls} aria-label="Wishlist">
                <Heart size={20} />
              </Link>
            )}

            <Link
              href="/cart"
              className={`${iconButtonCls} relative`}
              aria-label={t("cart")}
            >
              <Basket size={20} />
              {itemCount > 0 && (
                <motion.span
                  key={cartBounce}
                  className="absolute -top-[3px] -right-[3px] bg-brand text-white text-[0.625rem] font-bold min-w-[1.125rem] h-[1.125rem] flex items-center justify-center rounded-full px-1 border-2 border-surface"
                  initial={cartBounce > 0 ? { scale: 0.5 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 400 }}
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </motion.span>
              )}
            </Link>

            {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
              <a href="/admin" className={iconButtonCls} aria-label="Admin">
                <Shield size={20} />
              </a>
            )}

            {user ? (
              <Link href="/account" className={iconButtonCls} aria-label={t("account")}>
                <UserCircle size={20} />
              </Link>
            ) : (
              <Link href="/auth/login" className={iconButtonCls} aria-label={t("login")}>
                <UserCircle size={20} />
              </Link>
            )}
          </div>
        </div>

        {/* Tier 2: category tabs row (desktop) */}
        <nav
          className="hidden lg:block border-t border-line"
          aria-label="Primary"
        >
          <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Link href="/" className={navTabCls}>
              {t("home")}
            </Link>
            {topCategories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/catalog/${cat.slug}`}
                className={navTabCls}
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/catalog?onSale=true" className={navTabCls}>
              Deals
            </Link>
            <Link href="/catalog?sort=newest" className={navTabCls}>
              New Arrivals
            </Link>
            <Link href="/contact" className={`${navTabCls} ml-auto`}>
              {t("contact")}
            </Link>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-[90]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 left-0 bottom-0 w-[min(85vw,380px)] bg-surface z-[100] flex flex-col shadow-[4px_0_20px_rgba(15,23,42,0.08)]"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <span className="text-lg font-bold text-ink">Menu</span>
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-md bg-transparent border-0 cursor-pointer text-ink-muted hover:bg-surface-1 hover:text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <nav className="flex flex-col gap-1">
                  <Link href="/" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    {t("home")} <CaretRight size={18} />
                  </Link>
                  <Link href="/catalog" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    {t("catalog")} <CaretRight size={18} />
                  </Link>
                  <Link href="/catalog?sort=newest" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    New Arrivals <CaretRight size={18} />
                  </Link>
                  <Link href="/catalog?onSale=true" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    Deals <CaretRight size={18} />
                  </Link>

                  {topCategories.length > 0 && (
                    <>
                      <div className="h-px bg-line my-2" />
                      {topCategories.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/catalog/${cat.slug}`}
                          className={drawerNavLinkCls}
                          onClick={() => setMobileOpen(false)}
                        >
                          {cat.name} <CaretRight size={18} />
                        </Link>
                      ))}
                    </>
                  )}

                  <div className="h-px bg-line my-2" />

                  <Link href="/contact" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                    {t("contact")} <CaretRight size={18} />
                  </Link>
                  {user && (role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <a href="/admin" className={drawerNavLinkCls} onClick={() => setMobileOpen(false)}>
                      Admin Panel <CaretRight size={18} />
                    </a>
                  )}
                </nav>
              </div>

              <div className="px-5 py-4 border-t border-line flex flex-col gap-3">
                {user ? (
                  <Link href="/account" onClick={() => setMobileOpen(false)}>
                    <div className={`${drawerBtnCls} bg-brand text-white`}>My Account</div>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <div className={`${drawerBtnCls} bg-brand text-white`}>Sign In</div>
                    </Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                      <div className={`${drawerBtnCls} bg-surface-1 text-ink`}>Create Account</div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
