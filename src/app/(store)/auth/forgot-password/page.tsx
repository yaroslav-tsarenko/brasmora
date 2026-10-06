"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Mail, Handbag, ArrowLeft, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
  } as const;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-surface">
      <motion.div
        className="relative w-full max-w-[420px] p-10 max-[480px]:px-5 max-[480px]:py-7 bg-raised border border-line"
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div className="text-center mb-8" custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand text-on-brand mb-5">
            <Handbag size={24} />
          </div>
          <h1 className="text-[1.75rem] max-[480px]:text-2xl font-extrabold text-ink m-0 mb-2 tracking-[-0.04em]">{t("forgotPasswordTitle")}</h1>
          <p className="text-[0.9375rem] text-ink-muted m-0 leading-[1.5]">{t("forgotPasswordSubtitle")}</p>
        </motion.div>

        {sent ? (
          <motion.div className="text-center p-6 bg-surface-1 border border-line [&_svg]:block [&_svg]:mx-auto [&_svg]:mb-3 [&_svg]:text-brand [&_p]:m-0 [&_p]:text-[0.9375rem] [&_p]:text-ink-muted [&_p]:leading-[1.5]" custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <CircleCheck size={32} />
            <p>{t("resetEmailSent")}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <motion.div className="flex flex-col gap-1.5" custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-[0.8125rem] font-medium text-ink-muted">{t("email")}</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-ink-subtle pointer-events-none transition-colors z-[1] peer-focus:text-brand" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="peer w-full pl-10 pr-3 py-2.5 text-sm text-ink bg-surface border border-line outline-none transition-all placeholder:text-ink-subtle hover:border-line-hover focus:border-brand"
                />
              </div>
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="mt-2">
              <Button type="submit" color="primary" fullWidth isLoading={loading}>
                {t("sendResetLink")}
              </Button>
            </motion.div>
          </form>
        )}

        <motion.p className="text-center mt-7 text-sm text-ink-muted [&_a]:text-brand [&_a]:font-semibold [&_a]:no-underline [&_a]:transition-opacity hover:[&_a]:opacity-80" custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <Link href="/auth/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft size={14} />
            {t("backToLogin")}
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}