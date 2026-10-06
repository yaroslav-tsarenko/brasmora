import { COMPANY } from "@/lib/company";

export const STORE_POLICY = {
  currency: "GBP",
  supportedCurrencies: ["GBP", "EUR", "USD"],
  vatRegistered: COMPANY.vatRegistered,
  shipping: {
    standardCost: 5.99,
    freeThreshold: 75,
    processingDays: "1–2 business days",
    dispatchFrom: "our fulfilment warehouse in Spain",
    deliveryTimes: {
      eu: "3–6 business days after dispatch",
      uk: "4–8 business days after dispatch",
    },
    ukImportNote:
      "Parcels to the United Kingdom are shipped from the EU. Any import VAT or duty charged by the carrier on delivery is shown before payment where it applies, otherwise it is covered by us.",
    countries: ["United Kingdom", "European Union member states"],
  },
  returns: {
    withdrawalDays: 14,
    returnShipDays: 14,
    refundDays: 14,
    returnShippingPaidBy: "customer",
    faultyReturnShippingPaidBy: "us",
  },
  warranty: {
    months: 24,
  },
  limits: {
    maxQtyPerItem: 10,
    maxItemsPerOrder: 40,
  },
  minAge: 18,
  policiesLastUpdated: "2026-10-06",
} as const;
