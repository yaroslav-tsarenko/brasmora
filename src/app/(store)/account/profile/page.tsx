import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProfileForm } from "@/components/account/ProfileForm/ProfileForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.meta");
  return { title: t("profile"), description: t("description"), robots: { index: false, follow: false } };
}

export default function ProfilePage() {
  return <ProfileForm />;
}
