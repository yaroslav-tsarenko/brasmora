import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { RegisterView } from "./RegisterView";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.register.meta");
  return { title: t("title"), description: t("description"), robots: { index: false, follow: true } };
}

export default function RegisterPage() {
  return <RegisterView />;
}
