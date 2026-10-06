import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderHistory } from "@/components/account/OrderHistory/OrderHistory";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.meta");
  return { title: t("orders"), description: t("description"), robots: { index: false, follow: false } };
}

export default function OrdersPage() {
  return <OrderHistory />;
}
