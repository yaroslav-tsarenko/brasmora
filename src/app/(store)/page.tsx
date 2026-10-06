import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { getHomeData } from "@/components/home/data";
import { DresserHero } from "@/components/home/DresserHero";
import { DrawerChest } from "@/components/home/DrawerChest";
import { TopShelf } from "@/components/home/TopShelf";
import { PlateRack } from "@/components/home/PlateRack";
import { HooksRow } from "@/components/home/HooksRow";
import { ReducedBand } from "@/components/home/ReducedBand";
import { NewOnShelf } from "@/components/home/NewOnShelf";
import { CareCupboard } from "@/components/home/CareCupboard";
import { NewsletterPlaque } from "@/components/home/NewsletterPlaque";
import { BRAND, SITE_URL } from "@/lib/brand";
import { COMPANY } from "@/lib/company";
import { POLICY_FACTS } from "@/lib/policy-facts";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  const title = t("metaTitle", { brand: BRAND.name });
  const description = t("metaDescription", {
    brand: BRAND.name,
    dispatchFrom: POLICY_FACTS.dispatchFrom,
    withdrawalDays: POLICY_FACTS.withdrawalDays,
    warrantyMonths: POLICY_FACTS.warrantyMonths,
  });
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/", type: "website", siteName: BRAND.name },
  };
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: BRAND.name,
          legalName: COMPANY.name,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.svg`,
          email: COMPANY.email,
          ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: BRAND.name,
          url: SITE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <DresserHero hero={data.hero} />
      <DrawerChest drawers={data.drawers} totalProducts={data.totalProducts} />
      <TopShelf ranked={data.topShelf.ranked} products={data.topShelf.products} />
      <PlateRack category={data.rack.category} products={data.rack.products} />
      <HooksRow categories={data.hooks.categories} products={data.hooks.products} />
      <ReducedBand products={data.reduced} />
      <NewOnShelf products={data.newest} />
      <CareCupboard />
      <NewsletterPlaque />
    </>
  );
}
