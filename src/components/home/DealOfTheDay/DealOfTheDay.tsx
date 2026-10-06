"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { formatPrice } from "@/lib/utils/format-price";
import { getProductImage, getProductImageFallback } from "@/lib/utils/product-image";
import { getDiscountPercent, type HomepageProduct } from "@/lib/homepage-products";

interface Props {
  product: HomepageProduct;
}

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { h, m, s };
}

const timeBlockCls =
  "bg-on-paint/15 px-2 py-1 text-[0.8125rem] font-bold [font-variant-numeric:tabular-nums] min-w-8 text-center";

export function DealOfTheDay({ product }: Props) {
  const [time, setTime] = useState(getTimeUntilMidnight);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const discount = getDiscountPercent(product);
  const imgUrl = getProductImage(product.images?.[0]?.url, product.name);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <motion.section
      ref={ref}
      className="mb-6 overflow-hidden bg-paint text-on-paint flex flex-col md:flex-row items-stretch border border-on-paint/5 relative before:content-[''] before:absolute before:inset-0 before:pointer-events-none"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex-1 px-10 py-8 max-md:p-6 flex flex-col justify-center relative z-[1]"
        initial={{ opacity: 0, x: -30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <motion.span
            className="bg-brass text-on-brass text-[0.65rem] font-bold px-2.5 py-0.5 uppercase tracking-[0.05em]"
            animate={isInView ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
          >
            Deal of the Day
          </motion.span>
          <div className="flex gap-1.5 items-center">
            <span className={timeBlockCls}>{pad(time.h)}</span>
            <span className="text-xs opacity-50">:</span>
            <span className={timeBlockCls}>{pad(time.m)}</span>
            <span className="text-xs opacity-50">:</span>
            <span className={timeBlockCls}>{pad(time.s)}</span>
          </div>
        </div>
        <h2 className="text-2xl max-md:text-xl font-extrabold m-0 mb-1.5 leading-[1.2]">{product.name}</h2>
        <p className="text-sm opacity-70 m-0 mb-5 leading-[1.5] max-w-[360px]">
          Limited time offer — grab it before the deal expires!
        </p>
        <div className="flex items-baseline gap-3 mb-5">
          <span className="text-[1.75rem] max-md:text-[1.375rem] font-extrabold text-brass-on-paint">
            {formatPrice(Number(product.price))}
          </span>
          {product.comparePrice && (
            <span className="text-base line-through opacity-50">{formatPrice(Number(product.comparePrice))}</span>
          )}
          {discount > 0 && (
            <span className="bg-brass text-on-brass text-xs font-bold px-2 py-0.5">-{discount}%</span>
          )}
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="inline-flex items-center gap-2 px-7 py-3 bg-brand text-on-brand border-0 text-sm font-bold no-underline cursor-pointer transition-all w-fit hover:-translate-y-px hover:bg-brand-hover"
        >
          Shop Now <ArrowRight size={16} />
        </Link>
      </motion.div>
      <motion.div
        className="w-[280px] max-md:w-full shrink-0 flex items-center justify-center relative z-[1] p-6 max-md:pt-0"
        initial={{ opacity: 0, x: 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <Image
            src={imgUrl}
            alt={product.name}
            width={240}
            height={200}
            className="max-w-full max-h-[200px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getProductImageFallback("240x200");
            }}
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
