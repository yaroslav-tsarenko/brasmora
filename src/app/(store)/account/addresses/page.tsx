import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AddressBook } from "@/components/account/AddressBook/AddressBook";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account.meta");
  return { title: t("addresses"), description: t("description"), robots: { index: false, follow: false } };
}

export default function AddressesPage() {
  return <AddressBook />;
}
