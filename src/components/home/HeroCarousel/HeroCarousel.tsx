"use client";

import { useState, useEffect, useCallback } from "react";
import Image, { type StaticImageData } from "next/image";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Link } from "@/i18n/routing";
import banner1 from "@/assets/banner1.jpg";
import banner2 from "@/assets/banner2.jpg";
import banner3 from "@/assets/banner3.jpg";

interface SlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  ctaLabel?: string | null;
  bgColor: string;
  textColor: string;
  badgeText?: string | null;
}

interface DealData {
  id: string;
  title: string;
  oldPrice?: string | null;
  newPrice?: string | null;
  discountText?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
}

interface DefaultSlide {
  id: string;
  badgeText: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  linkUrl: string;
  bgColor: string;
  textColor: string;
  bgImage: StaticImageData;
}

const defaultSlides: DefaultSlide[] = [
  {
    id: "1",
    badgeText: "Professional Grade",
    title: "Switchgear & Distribution Boards",
    subtitle: "Certified panels, circuit breakers, and modular enclosures for residential and commercial installations",
    ctaLabel: "Shop Now",
    linkUrl: "/catalog",
    bgColor: "#1E2420",
    textColor: "#ffffff",
    bgImage: banner1,
  },
  {
    id: "2",
    badgeText: "Complete Range",
    title: "Industrial Control & Automation",
    subtitle: "From compact enclosures to full-size distribution cabinets — everything for your next project",
    ctaLabel: "Browse Equipment",
    linkUrl: "/catalog",
    bgColor: "#20302A",
    textColor: "#ffffff",
    bgImage: banner2,
  },
  {
    id: "3",
    badgeText: "Top Quality",
    title: "Cables, Wiring & Connectors",
    subtitle: "Premium copper cables, flexible wiring, terminal blocks and accessories at wholesale prices",
    ctaLabel: "View Cables",
    linkUrl: "/catalog",
    bgColor: "#1E2420",
    textColor: "#ffffff",
    bgImage: banner3,
  },
];

const bgImageMap: Record<string, StaticImageData> = {
  "1": banner1,
  "2": banner2,
  "3": banner3,
};

interface Props {
  slides: SlideData[];
  deals: DealData[];
}

const controlBtnCls =
  "bg-white/10 border border-white/25 rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-white transition-colors hover:bg-white/25";

export function HeroCarousel({ slides, deals }: Props) {
  const useDefaults = slides.length === 0;
  const activeSlides = useDefaults ? defaultSlides : slides;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, activeSlides.length]);

  const slide = activeSlides[current];
  const bgImage = useDefaults
    ? (slide as DefaultSlide).bgImage
    : bgImageMap[slide.id] || null;

  return (
    <>
      {/* Full-bleed editorial split band */}
      <section
        className="w-full"
        style={{ background: slide.bgColor, color: slide.textColor }}
        aria-roledescription="carousel"
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 max-sm:py-6 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 max-sm:gap-5 items-center">
          {/* Text column leads */}
          <div className="flex flex-col items-start min-w-0">
            {slide.badgeText && (
              <span className="inline-block px-3 py-1 rounded bg-brand text-white text-[0.7rem] font-bold uppercase tracking-[0.05em] mb-4">
                {slide.badgeText}
              </span>
            )}
            <h2 className="text-[2.25rem] max-lg:text-[1.75rem] max-sm:text-xl font-extrabold leading-[1.1] m-0 mb-3 tracking-[-0.02em]">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-[0.9375rem] opacity-85 m-0 mb-6 leading-[1.5] max-w-[460px]">{slide.subtitle}</p>
            )}
            {slide.linkUrl && (
              <Link
                href={slide.linkUrl}
                className="inline-block px-6 py-2.5 rounded-md text-white no-underline text-sm font-semibold transition-opacity bg-brand hover:opacity-90"
              >
                {slide.ctaLabel || "Shop Now"}
              </Link>
            )}

            {activeSlides.length > 1 && (
              <div className="flex items-center gap-4 mt-8 max-sm:mt-5">
                <div className="flex gap-2">
                  <button className={controlBtnCls} onClick={prev} aria-label="Previous slide">
                    <CaretLeft size={20} />
                  </button>
                  <button className={controlBtnCls} onClick={next} aria-label="Next slide">
                    <CaretRight size={20} />
                  </button>
                </div>
                <div className="flex gap-1.5" role="tablist" aria-label="Slides">
                  {activeSlides.map((_, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={i === current}
                      className={`h-2 rounded-full border-0 cursor-pointer transition-all ${
                        i === current ? "bg-white w-5 rounded" : "bg-white/40 w-2"
                      }`}
                      onClick={() => setCurrent(i)}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Imagery column */}
          <div className="relative rounded-[10px] overflow-hidden min-h-[340px] max-lg:min-h-[260px] max-sm:min-h-[180px]">
            {bgImage ? (
              <Image
                src={bgImage}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover [object-position:center_right]"
                priority={current === 0}
              />
            ) : (
              <div className="absolute inset-0" style={{ background: slide.bgColor }} />
            )}
          </div>
        </div>
      </section>

      {/* Deal tiles: equal-width horizontal strip below the campaign band */}
      {deals.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 -mt-5 max-sm:mt-3 relative z-[2]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {deals.map((deal) => (
              <Link
                key={deal.id}
                href={deal.linkUrl || "/catalog"}
                className="bg-surface border border-line rounded-lg p-4 no-underline text-ink flex items-center gap-4 relative transition-all hover:border-line-hover hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              >
                {deal.discountText && (
                  <span className="absolute top-2 right-2 bg-sale text-white text-[0.7rem] font-bold px-1.5 py-0.5 rounded">
                    {deal.discountText}
                  </span>
                )}
                {deal.imageUrl ? (
                  <img src={deal.imageUrl} alt={deal.title} className="w-16 h-16 object-contain rounded-lg shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-surface-2 rounded-lg shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <h4 className="text-[0.8125rem] font-semibold m-0 mb-1.5 leading-[1.3]">{deal.title}</h4>
                  <div className="flex items-center gap-2">
                    {deal.oldPrice && <span className="text-xs text-ink-subtle line-through">{deal.oldPrice}</span>}
                    {deal.newPrice && <span className="text-[0.9375rem] font-bold text-sale">{deal.newPrice}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
