import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ResetView } from "./ResetView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset.meta");
  return { title: t("title"), description: t("description"), robots: { index: false, follow: false } };
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <ResetView />
    </Suspense>
  );
}
