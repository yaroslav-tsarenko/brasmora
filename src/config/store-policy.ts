import { COMPANY } from "@/lib/company";

export const STORE_POLICY = {
  currency: "GBP",
  supportedCurrencies: ["GBP", "EUR", "USD"],
  vatRegistered: COMPANY.vatRegistered,
  tax: {
    vatRatePercent: 20,
    pricesIncludeVat: true,
  },
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
  support: {
    replyTime: "within 1 business day",
    channels: ["email", "contact form"],
  },
  payment: {
    methods: ["Visa", "Mastercard"],
    providerName: null as string | null,
    chargeCurrencies: ["GBP", "EUR", "USD"],
  },
  orders: {
    cancelBefore: "dispatch",
    deliveryDeadlineDays: 30,
  },
  complaints: {
    acknowledgeTime: "within 1 business day",
    responseDays: 14,
  },
  processors: [
    { role: "Card payments", purpose: "Takes card payments on its own hosted page and runs 3-D Secure checks", name: null as string | null },
    { role: "Fulfilment warehouse", purpose: "Picks, packs and hands your order to the carrier in Spain", name: null as string | null },
    { role: "Delivery carriers", purpose: "Deliver parcels and send tracking updates", name: null as string | null },
    { role: "Website hosting and database", purpose: "Runs the store and stores account and order records", name: null as string | null },
    { role: "Email delivery", purpose: "Sends order, account and support emails", name: null as string | null },
    { role: "Image storage", purpose: "Stores and serves product photographs", name: null as string | null },
  ],
  retention: {
    orderRecordsYears: 6,
    supportMessagesMonths: 24,
    inactiveAccountYears: 3,
  },
} as const;
