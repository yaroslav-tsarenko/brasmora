"use client";

import { useTranslations } from "next-intl";
import { Select } from "@/components/ui/Select";

interface ProductSortProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ProductSort({ value, onChange, className }: ProductSortProps) {
  const t = useTranslations("product");

  const options = [
    { value: "newest", label: t("newest") },
    { value: "price-asc", label: t("priceLowHigh") },
    { value: "price-desc", label: t("priceHighLow") },
    { value: "name-asc", label: t("nameAZ") },
  ];

  return (
    <Select
      size="sm"
      inlineLabel="Sort"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      wrapperClassName={className}
      className="min-w-[11rem]"
    />
  );
}
