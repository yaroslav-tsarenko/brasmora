/**
 * The selling entity behind Solvetaworld.
 *
 * Single source of truth: the footer, the policy pages, the checkout's merchant
 * block, the contact page and the transactional emails all read from here, so
 * a change to the registration only has to be made once.
 */
export const COMPANY_REGISTERED = true;

export const COMPANY: {
  name: string;
  companyNumber: string;
  addressLine: string;
  country: string;
  registeredOffice: string;
  /** Null when there is no number to publish, so no page renders a dead tel: link. */
  phone: string | null;
  email: string;
} = {
  name: "SOLVETA LTD",
  companyNumber: "17349586",
  addressLine: "Dept 6953, 196 High Road, Wood Green, London, N22 8HH",
  country: "United Kingdom",
  registeredOffice:
    "Dept 6953, 196 High Road, Wood Green, London, United Kingdom, N22 8HH",
  phone: "+44 7481 359087",
  email: "info@solvetaworld.com",
};
