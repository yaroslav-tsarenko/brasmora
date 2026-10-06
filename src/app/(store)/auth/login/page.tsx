import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LoginView } from "./LoginView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login.meta");
  return { title: t("title"), description: t("description"), robots: { index: false, follow: true } };
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <LoginView />
    </Suspense>
  );
}
