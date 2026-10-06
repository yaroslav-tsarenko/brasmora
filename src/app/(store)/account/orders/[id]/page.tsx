import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { OrderDetail } from "@/components/account/OrderDetail/OrderDetail";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.meta");
  return { title: t("order"), description: t("description"), robots: { index: false, follow: false } };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
