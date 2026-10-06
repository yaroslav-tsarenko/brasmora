import { Store } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { BRAND } from "@/lib/brand";
import { PaymentLogos } from "@/components/shared/PaymentLogos/PaymentLogos";

export function MerchantInfo({ title, showLogos = true }: { title: string; showLogos?: boolean }) {
  return (
    <div className="mt-5 border-t border-line pt-5 text-ui-xs leading-[1.7] text-ink-muted">
      {showLogos ? <PaymentLogos height={28} className="mb-4" /> : null}
      <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-ink">
        <Store size={16} aria-hidden="true" />
        {title}
      </div>
      <p className="m-0">
        <strong className="font-semibold text-ink">{COMPANY.name}</strong>
        <br />
        {BRAND.name} is a trading name of {COMPANY.name}.
        <br />
        {COMPANY.addressLine}
        <br />
        {COMPANY.country}
        <br />
        Company number: {COMPANY.companyNumber}
        <br />
        {COMPANY.phone ? (
          <>
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:text-ink hover:underline">
              {COMPANY.phone}
            </a>
            {" · "}
          </>
        ) : null}
        <a href={`mailto:${COMPANY.email}`} className="underline-offset-4 hover:text-ink hover:underline">
          {COMPANY.email}
        </a>
      </p>
    </div>
  );
}
