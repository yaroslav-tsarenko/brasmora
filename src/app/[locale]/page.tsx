import { prisma } from "@/lib/prisma";
import { JsonLd } from "@/components/shared/SEO/JsonLd";
import { MarketplaceHome } from "@/components/home/MarketplaceHome/MarketplaceHome";
import {
  getFeaturedProducts,
  getSaleProducts,
  getNewProducts,
  getPopularProducts,
  getHomepageCategorySections,
  getBrandSections,
  pickForShelf,
  TOP_BRANDS,
} from "@/lib/homepage-products";

export const dynamic = "force-dynamic";

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

async function getHomeData() {
  try {
    const productInclude = {
      images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
      categories: {
        include: { category: { select: { name: true, slug: true } } },
      },
    };

    const [
      heroSlides,
      dealCards,
      promoSmall,
      promoWide,
      brands,
      sections,
      tabs,
      utilityLinks,
      promoStripItems,
      allActiveProducts,
      categoriesWithChildren,
    ] = await Promise.all([
      prisma.banner.findMany({ where: { isActive: true, type: "HERO" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "DEAL_CARD" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "PROMO_SMALL" }, orderBy: { sortOrder: "asc" } }),
      prisma.banner.findMany({ where: { isActive: true, type: "PROMO_WIDE" }, orderBy: { sortOrder: "asc" } }),
      prisma.brand.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.homepageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.homepageTab.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.utilityLink.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.promoStripItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        include: productInclude,
        orderBy: { createdAt: "desc" },
        take: 500,
      }),
      prisma.category.findMany({
        where: { isActive: true, parentId: null },
        orderBy: { sortOrder: "asc" },
        include: {
          children: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
            select: { id: true, name: true, slug: true },
          },
          _count: { select: { products: true } },
        },
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = allActiveProducts as any[];

    // Acquirer compliance: every homepage section must show its own distinct
    // assortment — no product may appear in two sections. Sections claim their
    // picks in the order they render on the page; later sections draw only
    // from what is left.
    const claimed = new Set<string>();
    const unclaimed = () => products.filter((p) => !claimed.has(p.id));
    const claim = <T extends { id: string }>(picked: T[]): T[] => {
      picked.forEach((p) => claimed.add(p.id));
      return picked;
    };

    const popularProducts = claim(getPopularProducts(unclaimed(), 10));
    const saleProducts = claim(getSaleProducts(unclaimed(), 15));

    const categorySections = getHomepageCategorySections(
      unclaimed(),
      categoriesWithChildren.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        children: c.children,
        _count: c._count,
      })),
      10,
      6,
    );
    categorySections.forEach((cs) => claim(cs.products));

    const sectionProducts: Record<string, typeof allActiveProducts> = {};
    for (const section of sections) {
      let pool = unclaimed();
      switch (section.filterType) {
        case "featured":
          pool = pool.filter((p) => p.isFeatured);
          break;
        case "newest":
          pool = [...pool].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case "onSale":
          pool = pool.filter((p) => p.comparePrice !== null);
          break;
        case "category":
          if (section.categorySlug) {
            pool = pool.filter((p) =>
              p.categories.some((c: { category: { slug: string } }) => c.category.slug === section.categorySlug)
            );
          }
          break;
        case "popular":
          pool = [...pool].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case "all":
        default:
          break;
      }
      // Same shelf picker the helper sections use, so an admin-defined section
      // is drawn from this store's slice of the shared catalogue too.
      sectionProducts[section.slug] = claim(pickForShelf(
        pool,
        section.maxProducts,
        `section:${section.slug}`,
      ));
    }

    const newProducts = claim(getNewProducts(unclaimed(), 10));
    const featuredProducts = getFeaturedProducts(unclaimed(), 10);
    const brandSections = getBrandSections(unclaimed(), TOP_BRANDS, 8);

    const categoryShowcase = categoriesWithChildren.map((c) => {
      const directCount = c._count.products;
      const childSlugs = c.children.map((ch) => ch.slug);
      const childProductCount = childSlugs.length > 0
        ? products.filter((p: { categories?: { category: { slug: string } }[] }) =>
            p.categories?.some((pc) => childSlugs.includes(pc.category.slug))
          ).length
        : 0;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: null as string | null,
        productCount: directCount + childProductCount,
      };
    }).filter((c) => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 8);

    return serialize({
      heroSlides,
      dealCards,
      promoSmall,
      promoWide,
      brands,
      sections,
      tabs,
      utilityLinks,
      promoStripItems,
      sectionProducts,
      categories: categoriesWithChildren,
      featuredProducts,
      saleProducts,
      newProducts,
      popularProducts,
      categorySections,
      brandSections,
      categoryShowcase,
    });
  } catch (e) {
    console.error("Homepage data fetch error:", e);
    return {
      heroSlides: [], dealCards: [], promoSmall: [], promoWide: [],
      brands: [], sections: [], tabs: [], utilityLinks: [],
      promoStripItems: [], sectionProducts: {}, categories: [],
      featuredProducts: [], saleProducts: [], newProducts: [],
      popularProducts: [], categorySections: [], brandSections: [],
      categoryShowcase: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Solvetaworld",
          url: siteUrl,
          description: "Your trusted source for electrical materials, wiring, and installation supplies.",
        }}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <MarketplaceHome data={data as any} />
    </>
  );
}
