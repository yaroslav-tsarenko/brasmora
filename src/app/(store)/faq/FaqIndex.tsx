"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export function FaqIndex({ label, groups }: { label: string; groups: { id: string; title: string }[] }) {
  const [active, setActive] = useState(groups[0]?.id);

  useEffect(() => {
    const targets = groups.map((g) => document.getElementById(g.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <nav aria-label={label}>
      <ul className="m-0 flex list-none gap-6 overflow-x-auto border-b border-line p-0 no-scrollbar lg:flex-col lg:gap-0 lg:overflow-visible lg:border-b-0 lg:border-t">
        {groups.map((group) => {
          const isActive = group.id === active;
          return (
            <li key={group.id} className="shrink-0 lg:border-b lg:border-line">
              <a
                href={`#${group.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActive(group.id)}
                className={cn(
                  "relative flex min-h-11 items-center whitespace-nowrap text-ui-sm transition-colors duration-[160ms] lg:py-2",
                  isActive ? "font-medium text-ink" : "text-ink-muted hover-device:hover:text-ink",
                )}
              >
                <span className={cn("transition-transform duration-[260ms] ease-[var(--ease-furniture)]", isActive && "lg:translate-x-1.5")}>{group.title}</span>
                {isActive ? <span aria-hidden="true" className="shelf-rule absolute inset-x-0 -bottom-px" /> : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function OutlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={buttonClasses({ variant: "outline" })}>
      {children}
    </Link>
  );
}
