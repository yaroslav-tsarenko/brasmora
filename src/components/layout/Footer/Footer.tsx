"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { LinkedinLogo, InstagramLogo } from "@phosphor-icons/react";
import { SolvetaMark } from "../SolvetaMark";
import { COMPANY } from "@/lib/company";
import visaLogo from "@/assets/visa-logo.svg";
import mastercardLogo from "@/assets/mastercard-logo.svg";
import pciDssLogo from "@/assets/pci-dss-compliant-logo-vector.svg";

const linkCls =
  "text-sm text-ink-muted transition-all hover:text-brand hover:pl-1";
const sectionTitleCls =
  "text-[0.8125rem] font-bold uppercase tracking-[0.06em] text-ink mb-4";
const socialIconCls =
  "w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center text-ink-muted transition-all cursor-pointer border-0 hover:bg-brand hover:text-white hover:-translate-y-0.5";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-1 border-t border-line mt-auto">
      <div className="max-w-container mx-auto px-4 lg:px-8">
        <div className="pt-12 pb-10 grid grid-cols-1 lg:grid-cols-[1.6fr_2fr_1fr] gap-10 lg:gap-12">
          {/* Brand + company contact details */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-extrabold tracking-[-0.04em] text-ink"
            >
              <SolvetaMark size={28} gradientId="solvetaMarkFooter" />
              <span>
                Solveta<span className="text-brand">world</span>
              </span>
            </Link>
            <p className="text-sm text-ink-muted leading-[1.6] max-w-[280px]">
              Your trusted source for electrical materials, wiring, and installation supplies. Professional quality delivered to your door.
            </p>
            <div className="text-xs text-ink-subtle leading-[1.7]">
              <p className="font-semibold text-ink mb-1">{COMPANY.name}</p>
              <p>
                Company number: {COMPANY.companyNumber}
                <br />
                {COMPANY.registeredOffice}
                <br />
                {COMPANY.phone ? (
                  <>
                    Phone:{" "}
                    <a
                      href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}
                      className="hover:text-brand transition-colors"
                    >
                      {COMPANY.phone}
                    </a>
                    {" "}&middot;{" "}
                  </>
                ) : null}
                Email:{" "}
                <a href={`mailto:${COMPANY.email}`} className="hover:text-brand transition-colors">
                  {COMPANY.email}
                </a>
              </p>
            </div>
          </div>

          {/* Explore: shop + account links merged under one heading, two columns */}
          <div>
            <h3 className={sectionTitleCls}>Explore</h3>
            <div className="grid grid-cols-2 gap-x-8">
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                <li><Link href="/catalog" className={linkCls}>{nav("catalog")}</Link></li>
                <li><Link href="/catalog?sort=newest" className={linkCls}>New Arrivals</Link></li>
                <li><Link href="/catalog?onSale=true" className={linkCls}>Sale</Link></li>
                <li><Link href="/catalog?sort=popular" className={linkCls}>Best Sellers</Link></li>
              </ul>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                <li><Link href="/auth/login" className={linkCls}>{nav("login")}</Link></li>
                <li><Link href="/account/orders" className={linkCls}>My Orders</Link></li>
                <li><Link href="/account/wishlist" className={linkCls}>Wishlist</Link></li>
                <li><Link href="/contact" className={linkCls}>{t("contact")}</Link></li>
              </ul>
            </div>
          </div>

          {/* Information: policies */}
          <div>
            <h3 className={sectionTitleCls}>Information</h3>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
              <li><Link href="/policies/terms" className={linkCls}>{t("terms")}</Link></li>
              <li><Link href="/policies/privacy" className={linkCls}>{t("privacy")}</Link></li>
              <li><Link href="/policies/returns" className={linkCls}>{t("returns")}</Link></li>
              <li><Link href="/policies/shipping" className={linkCls}>Shipping Policy</Link></li>
              <li><Link href="/policies/warranty" className={linkCls}>Warranty</Link></li>
              <li><Link href="/policies/payment" className={linkCls}>Payment Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Slim bottom bar: copyright · social · payment */}
        <div className="border-t border-line py-5 flex flex-wrap items-center gap-4 justify-between max-md:flex-col max-md:items-start">
          <p className="text-xs text-ink-subtle m-0">
            {t("copyright", { year: currentYear, storeName: "Solvetaworld" })}
          </p>
          <div className="flex items-center gap-2">
            {process.env.NEXT_PUBLIC_LINKEDIN_URL && (
              <a href={process.env.NEXT_PUBLIC_LINKEDIN_URL} className={socialIconCls} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <LinkedinLogo size={16} />
              </a>
            )}
            {process.env.NEXT_PUBLIC_INSTAGRAM_URL && (
              <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} className={socialIconCls} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <InstagramLogo size={16} />
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center">
              <Image src={visaLogo} alt="Visa" height={100} width={100} className="!w-[60px] !h-auto object-contain" />
            </span>
            <span className="flex items-center justify-center">
              <Image src={mastercardLogo} alt="Mastercard" height={100} width={100} className="!w-[60px] !h-auto object-contain" />
            </span>
            <span className="flex items-center justify-center">
              <Image src={pciDssLogo} alt="PCI DSS Compliant" height={100} width={100} className="!w-[60px] !h-auto object-contain" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
