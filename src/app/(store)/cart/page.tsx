import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CartView } from "./CartView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart.meta");
  return { title: t("title"), description: t("description"), robots: { index: false, follow: true } };
}

export default function CartPage() {
  return <CartView />;
}
