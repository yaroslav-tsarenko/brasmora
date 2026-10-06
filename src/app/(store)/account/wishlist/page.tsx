import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SavedItems } from "@/components/account/SavedItems";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.meta");
  return { title: t("saved"), description: t("description"), robots: { index: false, follow: false } };
}

export default function WishlistPage() {
  return <SavedItems />;
}
