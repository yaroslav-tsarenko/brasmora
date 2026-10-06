"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCurrency } from "@/providers/CurrencyProvider";
import { Plate } from "@/components/ui/Plate";
import { Checkbox, Radio } from "@/components/ui/Choice";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Dialog";
import { FilterChip, FilterChipRow } from "@/components/ui/Chip";
import { SkeletonBar } from "@/components/ui/ShelfLoader";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
  children?: Category[];
}

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  brands: string[];
  selectedBrand: string;
  onCategoryChange: (slug: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onInStockChange: (value: boolean) => void;
  onSaleChange: (value: boolean) => void;
  onBrandChange: (value: string) => void;
  priceBounds?: { min: number; max: number } | null;
  extraGroups?: ReactNode;
  className?: string;
}

function subtree(cat: Category): number {
  return (cat._count?.products || 0) + (cat.children || []).reduce((s, c) => s + subtree(c), 0);
}

export function FilterDrawer({
  title,
  selectedCount = 0,
  defaultOpen = false,
  children,
}: {
  title: string;
  selectedCount?: number;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div data-drawer="" className="border-b border-line">
      <h3 className="m-0 font-sans tracking-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-trigger`}
          onClick={() => setOpen((v) => !v)}
          className="flex h-[52px] w-full cursor-pointer items-center gap-3 text-left text-ink"
        >
          <span className="eyebrow flex-1">{title}</span>
          {selectedCount > 0 ? (
            <Plate size="sm" aria-label={`${selectedCount} selected`}>
              {selectedCount}
            </Plate>
          ) : null}
          <ChevronDown size={16} aria-hidden="true" className={cn("text-ink-muted transition-transform duration-[260ms] ease-[var(--ease-furniture)]", open && "rotate-180")} />
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        inert={!open}
        className={cn("grid transition-[grid-template-rows] duration-[260ms] ease-[var(--ease-furniture)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line bg-raised px-4 py-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

function CategoryOptions({ cats, depth, selected, onChange, name }: { cats: Category[]; depth: number; selected: string; onChange: (slug: string) => void; name: string }) {
  return (
    <>
      {cats.map((cat) => (
        <div key={cat.id} style={{ paddingLeft: depth * 16 }}>
          <Radio name={name} label={cat.name} count={subtree(cat)} checked={selected === cat.slug} onChange={() => onChange(cat.slug)} wrapperClassName="py-1.5" />
          {cat.children && cat.children.length > 0 ? <CategoryOptions cats={cat.children} depth={depth + 1} selected={selected} onChange={onChange} name={name} /> : null}
        </div>
      ))}
    </>
  );
}

export interface PriceRangeProps {
  bounds: { min: number; max: number };
  value: { min: number; max: number };
  onCommit: (value: { min: number; max: number }) => void;
  format: (n: number) => string;
  step?: number;
}

export function PriceRange({ bounds, value, onCommit, format, step = 1 }: PriceRangeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [local, setLocal] = useState(value);
  const dragging = useRef<"min" | "max" | null>(null);
  const span = Math.max(step, bounds.max - bounds.min);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const pct = (n: number) => ((n - bounds.min) / span) * 100;
  const clampStep = (n: number) => Math.round(Math.min(bounds.max, Math.max(bounds.min, n)) / step) * step;

  const fromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return bounds.min;
    return clampStep(bounds.min + ((clientX - rect.left) / rect.width) * span);
  };

  const update = (thumb: "min" | "max", next: number) => {
    setLocal((cur) => (thumb === "min" ? { min: Math.min(next, cur.max), max: cur.max } : { min: cur.min, max: Math.max(next, cur.min) }));
  };

  const onKey = (thumb: "min" | "max") => (e: KeyboardEvent<HTMLSpanElement>) => {
    const current = local[thumb];
    const big = Math.max(step, Math.round(span / 10));
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = current + step;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = current - step;
    else if (e.key === "PageUp") next = current + big;
    else if (e.key === "PageDown") next = current - big;
    else if (e.key === "Home") next = bounds.min;
    else if (e.key === "End") next = bounds.max;
    if (next === null) return;
    e.preventDefault();
    update(thumb, clampStep(next));
  };

  const thumb = (which: "min" | "max") => (
    <span
      role="slider"
      tabIndex={0}
      aria-label={which === "min" ? "Minimum price" : "Maximum price"}
      aria-valuemin={which === "min" ? bounds.min : local.min}
      aria-valuemax={which === "min" ? local.max : bounds.max}
      aria-valuenow={local[which]}
      aria-valuetext={format(local[which])}
      onKeyDown={onKey(which)}
      onKeyUp={() => onCommit(local)}
      onBlur={() => onCommit(local)}
      onPointerDown={(e: PointerEvent<HTMLSpanElement>) => {
        dragging.current = which;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e: PointerEvent<HTMLSpanElement>) => {
        if (dragging.current === which) update(which, fromPointer(e.clientX));
      }}
      onPointerUp={() => {
        dragging.current = null;
        onCommit(local);
      }}
      style={{ left: `${pct(local[which])}%` }}
      className="bevel-xs absolute top-1/2 z-[1] size-[18px] -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none before:bg-brand active:cursor-grabbing focus-visible:outline-offset-2"
    />
  );

  return (
    <div className="px-2 pb-2 pt-5">
      <div ref={trackRef} className="relative h-[18px]">
        <span aria-hidden="true" className="shelf-rule absolute inset-x-0 top-[6px] opacity-40" />
        <span aria-hidden="true" className="shelf-rule-solid absolute top-[6px]" style={{ left: `${pct(local.min)}%`, right: `${100 - pct(local.max)}%` }} />
        {thumb("min")}
        {thumb("max")}
      </div>
    </div>
  );
}

export function ProductFilters({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  inStock,
  onSale,
  brands,
  selectedBrand,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onInStockChange,
  onSaleChange,
  onBrandChange,
  priceBounds,
  extraGroups,
  className,
}: ProductFiltersProps) {
  const name = useId();
  const { currency, rates } = useCurrency();
  const rate = rates[currency] || 1;
  const toDisplay = (base: string) => (base ? String(Math.round(Number(base) * rate * 100) / 100) : "");
  const toBase = (display: string) => (display ? String(Math.round((Number(display) / rate) * 100) / 100) : "");
  const signature = `${minPrice}|${maxPrice}|${rate}`;
  const [draft, setDraft] = useState({ signature, min: toDisplay(minPrice), max: toDisplay(maxPrice) });
  if (draft.signature !== signature) setDraft({ signature, min: toDisplay(minPrice), max: toDisplay(maxPrice) });
  const draftMin = draft.min;
  const draftMax = draft.max;
  const setDraftMin = (min: string) => setDraft((d) => ({ ...d, min }));
  const setDraftMax = (max: string) => setDraft((d) => ({ ...d, max }));
  const symbol = currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$";
  const format = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);

  const priceCount = (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);
  const availabilityCount = (inStock ? 1 : 0) + (onSale ? 1 : 0);

  return (
    <div className={cn("border-t border-line", className)}>
      <FilterDrawer title="Category" selectedCount={selectedCategory ? 1 : 0} defaultOpen>
        {categories.length === 0 ? (
          <div className="flex flex-col gap-3 py-2" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBar key={i} className={i % 2 ? "w-3/5" : "w-4/5"} />
            ))}
          </div>
        ) : (
          <div role="radiogroup" aria-label="Category" className="max-h-[360px] overflow-y-auto">
            <Radio name={`${name}-cat`} label="All categories" checked={!selectedCategory} onChange={() => onCategoryChange("")} wrapperClassName="py-1.5" />
            <CategoryOptions cats={categories} depth={0} selected={selectedCategory} onChange={onCategoryChange} name={`${name}-cat`} />
          </div>
        )}
      </FilterDrawer>

      <FilterDrawer title="Price" selectedCount={priceCount} defaultOpen={priceCount > 0}>
        <form
          className="grid grid-cols-2 gap-3 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            onMinPriceChange(toBase(draftMin));
            onMaxPriceChange(toBase(draftMax));
          }}
        >
          <Input label="Min" size="sm" inputMode="decimal" prefix={symbol} value={draftMin} onChange={(e) => setDraftMin(e.target.value.replace(/[^0-9.]/g, ""))} onBlur={() => onMinPriceChange(toBase(draftMin))} />
          <Input label="Max" size="sm" inputMode="decimal" prefix={symbol} value={draftMax} onChange={(e) => setDraftMax(e.target.value.replace(/[^0-9.]/g, ""))} onBlur={() => onMaxPriceChange(toBase(draftMax))} />
          <button type="submit" className="sr-only">
            Apply price
          </button>
        </form>
        {priceBounds && priceBounds.max > priceBounds.min ? (
          <PriceRange
            bounds={{ min: Math.floor(priceBounds.min * rate), max: Math.ceil(priceBounds.max * rate) }}
            value={{
              min: draftMin ? Number(draftMin) : Math.floor(priceBounds.min * rate),
              max: draftMax ? Number(draftMax) : Math.ceil(priceBounds.max * rate),
            }}
            format={format}
            onCommit={(v) => {
              const lo = Math.floor(priceBounds.min * rate);
              const hi = Math.ceil(priceBounds.max * rate);
              onMinPriceChange(v.min > lo ? toBase(String(v.min)) : "");
              onMaxPriceChange(v.max < hi ? toBase(String(v.max)) : "");
            }}
          />
        ) : null}
      </FilterDrawer>

      {brands.length > 0 ? (
        <FilterDrawer title="Brand" selectedCount={selectedBrand ? 1 : 0} defaultOpen={Boolean(selectedBrand)}>
          <div role="radiogroup" aria-label="Brand" className="max-h-[300px] overflow-y-auto">
            <Radio name={`${name}-brand`} label="All brands" checked={!selectedBrand} onChange={() => onBrandChange("")} wrapperClassName="py-1.5" />
            {brands.map((brand) => (
              <Radio key={brand} name={`${name}-brand`} label={brand} checked={selectedBrand === brand} onChange={() => onBrandChange(brand)} wrapperClassName="py-1.5" />
            ))}
          </div>
        </FilterDrawer>
      ) : null}

      {extraGroups}

      <FilterDrawer title="Availability" selectedCount={availabilityCount} defaultOpen={availabilityCount > 0}>
        <Checkbox dense label="In stock only" checked={inStock} onChange={(e) => onInStockChange(e.target.checked)} />
        <Checkbox dense label="Reduced" checked={onSale} onChange={(e) => onSaleChange(e.target.checked)} />
      </FilterDrawer>
    </div>
  );
}

export function FilterSummary({
  total,
  parts = [],
  chips = [],
  onClearAll,
  className,
}: {
  total: number;
  parts?: string[];
  chips?: { key: string; label: string; onRemove: () => void }[];
  onClearAll?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="tabular text-ui-sm text-ink" aria-live="polite">
        {[`${total} ${total === 1 ? "product" : "products"}`, ...parts].join(" · ")}
      </p>
      {chips.length > 0 ? (
        <FilterChipRow onClearAll={onClearAll}>
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </FilterChipRow>
      ) : null}
    </div>
  );
}

export function ProductFiltersDrawer({
  open,
  onClose,
  total,
  onClearAll,
  children,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  onClearAll: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <Sheet open={open} onClose={onClose} side="left" labelledBy={titleId} motion="drawer-left">
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line pl-4 pr-2">
          <h2 id={titleId} className="text-step-2 leading-none">
            Filter
          </h2>
          <button type="button" onClick={onClose} aria-label="Close filters" className="flex size-11 cursor-pointer items-center justify-center text-ink">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4">{children}</div>
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-line bg-raised px-4 py-3">
          <Button variant="ghost" onPress={onClearAll}>
            Clear all
          </Button>
          <Button onPress={onClose} className="flex-1">
            Show {total} {total === 1 ? "product" : "products"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
