"use client";

import { TopBar } from "../TopBar/TopBar";
import { PromoStrip } from "../PromoStrip/PromoStrip";
import { HorizontalTabs } from "../HorizontalTabs/HorizontalTabs";
import { HeroCarousel } from "../HeroCarousel/HeroCarousel";
import { PromoBannerGrid } from "../PromoBannerGrid/PromoBannerGrid";
import { BrandStrip } from "../BrandStrip/BrandStrip";
import { ProductSection } from "../ProductSection/ProductSection";
import { CategoryShowcase } from "../CategoryShowcase/CategoryShowcase";
import { SaleStrip } from "../SaleStrip/SaleStrip";
import { DealOfTheDay } from "../DealOfTheDay/DealOfTheDay";
import { NewsletterBanner } from "../NewsletterBanner/NewsletterBanner";
import { TrustStrip } from "../TrustStrip/TrustStrip";
import type { HomepageProduct, CategorySection, BrandSection } from "@/lib/homepage-products";

interface BannerData {
  id: string;
  type: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
  oldPrice?: string | null;
  newPrice?: string | null;
  discountText?: string | null;
}

interface SectionData {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  filterType: string;
  categorySlug?: string | null;
  maxProducts: number;
  viewAllUrl?: string | null;
  viewAllLabel: string;
  bgStyle: string;
  columns: number;
}

interface TabData {
  id: string;
  label: string;
  icon?: string | null;
  linkUrl: string;
  color: string;
}

interface UtilityLinkData {
  id: string;
  label: string;
  linkUrl: string;
  icon?: string | null;
  position: string;
}

interface PromoStripData {
  id: string;
  icon: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
}

interface BrandData {
  id: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

interface CategoryShowcaseItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  productCount: number;
}

interface Props {
  data: {
    heroSlides: BannerData[];
    dealCards: BannerData[];
    promoSmall: BannerData[];
    promoWide: BannerData[];
    brands: BrandData[];
    sections: SectionData[];
    tabs: TabData[];
    utilityLinks: UtilityLinkData[];
    promoStripItems: PromoStripData[];
    sectionProducts: Record<string, HomepageProduct[]>;
    categories: { id: string; name: string; slug: string; _count: { products: number } }[];
    featuredProducts: HomepageProduct[];
    saleProducts: HomepageProduct[];
    newProducts: HomepageProduct[];
    popularProducts: HomepageProduct[];
    categorySections: CategorySection[];
    brandSections: BrandSection[];
    categoryShowcase: CategoryShowcaseItem[];
  };
}

const containerCls = "max-w-[1400px] mx-auto px-4 lg:px-6 max-sm:px-2";

export function MarketplaceHome({ data }: Props) {
  const {
    heroSlides, dealCards, promoSmall, promoWide,
    brands, sections, tabs, utilityLinks, promoStripItems,
    sectionProducts, saleProducts, newProducts,
    popularProducts, categorySections, categoryShowcase,
  } = data;

  return (
    <div className="bg-surface-1 min-h-screen">
      {/* Full-bleed editorial hero + deal strip */}
      <HeroCarousel slides={heroSlides} deals={dealCards} />

      {tabs.length > 0 && (
        <div className={`${containerCls} pt-6`}>
          <HorizontalTabs tabs={tabs} />
        </div>
      )}

      {/* Benefits divider band */}
      <div className="mt-6">
        <PromoStrip items={promoStripItems} />
      </div>

      {/* Category quick access as a tile grid */}
      {categoryShowcase.length > 0 && (
        <div className={`${containerCls} pt-6`}>
          <CategoryShowcase categories={categoryShowcase} />
        </div>
      )}

      {/* Most Popular */}
      {popularProducts.length > 0 && (
        <div className={containerCls}>
          <ProductSection
            title="Most Popular"
            subtitle="Top products by availability"
            products={popularProducts}
            viewAllHref="/catalog?sort=popular"
            viewAllLabel="View all popular"
            bg="white"
            columns={5}
          />
        </div>
      )}

      {/* First top category, contained */}
      {categorySections.slice(0, 1).map((cs) => (
        <div key={cs.category.id} className={containerCls}>
          <ProductSection
            title={cs.category.name}
            subtitle={`${cs.products.length}+ products`}
            products={cs.products}
            tabs={cs.subcategoryTabs}
            viewAllHref={`/catalog/${cs.category.slug}`}
            viewAllLabel={`All ${cs.category.name}`}
            bg="white"
            columns={5}
          />
        </div>
      ))}

      {/* Deal of the Day pulled up, right after the first rail */}
      {saleProducts.length > 0 && (
        <div className={containerCls}>
          <DealOfTheDay product={saleProducts[0]} />
        </div>
      )}

      {/* Hot deals rail inside a full-bleed band */}
      {saleProducts.length > 0 && (
        <div className="bg-surface py-8 border-y border-line">
          <div className={containerCls}>
            <SaleStrip products={saleProducts} />
          </div>
        </div>
      )}

      {/* Categories 2-3, contained */}
      {categorySections.slice(1, 3).map((cs, i) => (
        <div key={cs.category.id} className={i === 0 ? `${containerCls} pt-6` : containerCls}>
          <ProductSection
            title={cs.category.name}
            subtitle={`${cs.products.length}+ products`}
            products={cs.products}
            tabs={cs.subcategoryTabs}
            viewAllHref={`/catalog/${cs.category.slug}`}
            viewAllLabel={`All ${cs.category.name}`}
            bg="white"
            columns={5}
          />
        </div>
      ))}

      {/* Promo composition: one dominant wide + stacked column */}
      <div className={containerCls}>
        <PromoBannerGrid smallBanners={promoSmall} wideBanners={promoWide} />
      </div>

      {/* Category 4 as a full-bleed contrasting band */}
      {categorySections.slice(3, 4).map((cs) => (
        <div key={cs.category.id} className="bg-surface py-8 border-y border-line">
          <div className={containerCls}>
            <ProductSection
              title={cs.category.name}
              subtitle={`${cs.products.length}+ products`}
              products={cs.products}
              tabs={cs.subcategoryTabs}
              viewAllHref={`/catalog/${cs.category.slug}`}
              viewAllLabel={`All ${cs.category.name}`}
              bg="white"
              columns={5}
            />
          </div>
        </div>
      ))}

      {/* Categories 5-6, contained */}
      {categorySections.slice(4, 6).map((cs, i) => (
        <div key={cs.category.id} className={i === 0 ? `${containerCls} pt-6` : containerCls}>
          <ProductSection
            title={cs.category.name}
            subtitle={`${cs.products.length}+ products`}
            products={cs.products}
            tabs={cs.subcategoryTabs}
            viewAllHref={`/catalog/${cs.category.slug}`}
            viewAllLabel={`All ${cs.category.name}`}
            bg="white"
            columns={5}
          />
        </div>
      ))}

      {/* Admin-configured sections */}
      {sections.map((section) => {
        const products = sectionProducts[section.slug] || [];
        if (!products.length) return null;
        return (
          <div key={section.id} className={containerCls}>
            <ProductSection
              title={section.title}
              subtitle={section.subtitle || undefined}
              products={products}
              viewAllHref={section.viewAllUrl || "/catalog"}
              viewAllLabel={section.viewAllLabel}
              bg={section.bgStyle as "white" | "gray"}
              columns={section.columns}
            />
          </div>
        );
      })}

      {/* Brands rail */}
      {brands.length > 0 && (
        <div className={containerCls}>
          <BrandStrip brands={brands} />
        </div>
      )}

      {/* Newsletter paired with trust cards in one band */}
      <div className="bg-surface py-8 border-y border-line">
        <div className={`${containerCls} grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 items-stretch`}>
          <NewsletterBanner />
          <TrustStrip />
        </div>
      </div>

      {/* New Arrivals, denser contained grid */}
      {newProducts.length > 0 && (
        <div className={`${containerCls} pt-6`}>
          <ProductSection
            title="New Arrivals"
            subtitle="Just landed in store"
            products={newProducts}
            viewAllHref="/catalog?sort=newest"
            viewAllLabel="View all new"
            bg="white"
            columns={5}
          />
        </div>
      )}

      {/* Utility links relocated to a pre-footer strip */}
      <TopBar links={utilityLinks} />
    </div>
  );
}
