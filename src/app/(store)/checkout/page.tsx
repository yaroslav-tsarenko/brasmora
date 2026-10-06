import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout.meta");
  return { title: t("title"), description: t("description"), robots: { index: false, follow: false } };
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <CheckoutView />
    </Suspense>
  );
}
