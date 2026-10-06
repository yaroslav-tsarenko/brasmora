"use client";

import {
  Truck, ArrowCounterClockwise, Shield, Gift, Medal, Headset,
  Lightning, Heart, Star, Package, Clock, CheckCircle,
} from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, RotateCcw: ArrowCounterClockwise, Shield, Gift, Award: Medal, Headphones: Headset,
  Zap: Lightning, Heart, Star, Package, Clock, CheckCircle,
};

interface PromoItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string | null;
  linkUrl?: string | null;
}

interface Props {
  items: PromoItem[];
}

const defaultItems: PromoItem[] = [
  { id: "1", icon: "Truck", title: "Free Delivery", subtitle: "Orders over £100" },
  { id: "2", icon: "RotateCcw", title: "Easy Returns", subtitle: "30-day policy" },
  { id: "3", icon: "Shield", title: "2-Year Warranty", subtitle: "On all products" },
  { id: "4", icon: "Gift", title: "Gift Cards", subtitle: "Available now" },
  { id: "5", icon: "Award", title: "Premium Quality", subtitle: "Certified goods" },
  { id: "6", icon: "Headphones", title: "24/7 Support", subtitle: "Always here" },
];

export function PromoStrip({ items }: Props) {
  const data = items.length > 0 ? items : defaultItems;

  return (
    <div className="bg-surface border-y border-line">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-center max-md:justify-start gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {data.map((b, i) => {
          const Icon = ICON_MAP[b.icon] || Package;
          return (
            <div
              key={b.id}
              className={`flex items-center gap-2 px-5 max-sm:px-3 whitespace-nowrap shrink-0 cursor-default ${
                i > 0 ? "border-l border-line" : ""
              }`}
            >
              <Icon size={16} className="text-brand shrink-0" />
              <span className="text-xs font-semibold text-ink">{b.title}</span>
              {b.subtitle && <span className="text-[0.65rem] text-ink-subtle">· {b.subtitle}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
