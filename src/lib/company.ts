export const COMPANY_REGISTERED = true;

export const COMPANY: {
  name: string;
  companyNumber: string;
  vatNumber: string;
  vatRegistered: boolean;
  addressLine: string;
  country: string;
  registeredOffice: string;
  phone: string | null;
  email: string;
  supportHours: string;
} = {
  name: "SOLVETA LTD",
  companyNumber: "17349586",
  vatNumber: "",
  vatRegistered: false,
  addressLine: "Dept 6953, 196 High Road, Wood Green, London, N22 8HH",
  country: "United Kingdom",
  registeredOffice: "Dept 6953, 196 High Road, Wood Green, London, N22 8HH",
  phone: null,
  email: "info@brasmora.com",
  supportHours: "Mon–Fri, 09:00–18:00 (GMT)",
};
