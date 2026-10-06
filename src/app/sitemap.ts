import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/brand";

export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.4 },
  { path: "/policies/privacy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/terms", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/returns", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/shipping", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/payment", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/warranty", changeFrequency: "monthly", priority: 0.3 },
  { path: "/policies/cookies", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const now = new Date();

  const staticPages = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productPages = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryPages = categories.map((category) => ({
    url: `${SITE_URL}/catalog/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
