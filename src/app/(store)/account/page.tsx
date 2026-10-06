import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { AccountOverview } from "@/components/account/AccountOverview";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.meta");
  return { title: t("overview"), description: t("description"), robots: { index: false, follow: false } };
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountOverview />
    </Suspense>
  );
}
