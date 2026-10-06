import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

/** Static routes that exist in every language, with their crawl weighting. */
const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/policies/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/terms", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/returns", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
  });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  /** Every language's URL for one path, so each entry declares its own siblings. */
  const languages = (path: string) =>
    Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`]));

  const now = new Date();

  const staticPages = routing.locales.flatMap((locale) =>
    STATIC_ROUTES.map((route) => ({
      url: `${siteUrl}/${locale}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: languages(route.path) },
    })),
  );

  // Product and category pages are listed in the default locale only: the
  // catalogue text itself comes from the database and is not translated, so
  // five URLs per product would be five near-identical pages.
  const productPages = products.map((product) => ({
    url: `${siteUrl}/${routing.defaultLocale}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map((category) => ({
    url: `${siteUrl}/${routing.defaultLocale}/catalog/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
