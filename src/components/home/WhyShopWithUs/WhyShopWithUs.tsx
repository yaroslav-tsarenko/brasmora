"use client";

import { Shield, Zap, Heart, RefreshCw, Award, Headset } from "lucide-react";
import { motion } from "framer-motion";
import { BRAND } from "@/lib/brand";

const reasons = [
  {
    icon: <Shield size={24} />,
    title: "Secure Shopping",
    desc: "Your data is protected with enterprise-grade encryption and secure payments.",
    gradient: "var(--color-paint)",
  },
  {
    icon: <Zap size={24} />,
    title: "Fast Delivery",
    desc: "Free shipping on orders over £100 with express options available.",
    gradient: "var(--color-paint)",
  },
  {
    icon: <Heart size={24} />,
    title: "Certified Products",
    desc: "Every electrical material is sourced from certified manufacturers and meets professional standards.",
    gradient: "var(--color-paint)",
  },
  {
    icon: <RefreshCw size={24} />,
    title: "Easy Returns",
    desc: "Changed your mind? Return within 30 days — no questions asked.",
    gradient: "var(--color-paint)",
  },
  {
    icon: <Award size={24} />,
    title: "Best Prices",
    desc: "We guarantee competitive pricing. Found it cheaper? We'll match it.",
    gradient: "var(--color-paint)",
  },
  {
    icon: <Headset size={24} />,
    title: "24/7 Support",
    desc: "Our team is available around the clock to help with anything.",
    gradient: "var(--color-paint)",
  },
];

export function WhyShopWithUs() {
  return (
    <section className="section-padding bg-surface-1">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Why choose {BRAND.name}</h2>
          <p className="section-subtitle mx-auto mt-2">
            Professional-grade electrical materials with expert support and fast delivery
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((reason, i) => (
            <motion.div
              key={reason.title}
              className="p-8 bg-surface border border-line transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center text-on-paint mb-5"
                style={{ background: reason.gradient }}
              >
                {reason.icon}
              </div>
              <h3 className="text-[1.0625rem] font-bold text-ink mb-2">{reason.title}</h3>
              <p className="text-sm text-ink-muted leading-[1.6]">{reason.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
