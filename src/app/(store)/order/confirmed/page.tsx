import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ShelfLoader } from "@/components/ui/ShelfLoader";
import { ConfirmedView } from "./ConfirmedView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout.confirmed.meta");
  return { title: t("title"), description: t("description"), robots: { index: false, follow: false } };
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<ShelfLoader block />}>
      <ConfirmedView />
    </Suspense>
  );
}
