"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function Newsletter() {
  const t = useTranslations("home");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
    }
  };

  return (
    <motion.section
      className="section-padding bg-brand relative overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute opacity-15 pointer-events-none w-[400px] h-[400px] bg-stage -top-24 -right-24 blur-[80px]" />
      <div className="absolute opacity-15 pointer-events-none w-[300px] h-[300px] bg-stage -bottom-24 -left-12 blur-[60px]" />
      <div className="max-w-container mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left md:justify-between relative z-[1]">
        <div className="flex-1">
          <h2 className="text-[1.75rem] font-extrabold text-on-paint mb-2 tracking-[-0.02em]">
            {t("newsletter")}
          </h2>
          <p className="text-on-paint/85 text-[0.9375rem] max-w-[400px] leading-[1.5]">
            {t("newsletterSubtitle")}
          </p>
        </div>
        <form className="flex gap-2 w-full max-w-[420px]" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletterPlaceholder")}
            className="flex-1 px-5 py-3 border-2 border-on-paint/25 bg-on-paint/10 text-on-paint text-sm outline-none transition-all placeholder:text-on-paint/55 focus:border-on-paint/50 focus:bg-on-paint/20"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-stage text-brand font-bold text-sm border-0 cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send size={16} />
            {t("newsletterCta")}
          </button>
        </form>
      </div>
    </motion.section>
  );
}
