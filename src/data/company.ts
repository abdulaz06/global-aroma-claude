/**
 * Company facts. Every value here was read from the official site
 * (globalaroma.me) on 23 Nov 2026. See docs/01-research.md for sources.
 * Anything marked `confirm: true` is published but needs owner confirmation
 * before a commercial release (docs/06-owner-approvals.md).
 */
export const company = {
  legalName: 'Global DWC LLC',
  groupName: 'Global Aroma',
  divisions: ['Global Aroma', 'Global Hospitality', 'Global Technology'],
  address: {
    lines: ['Office 531, 5th Floor, Building A3', 'Dubai World Central', 'Dubai, United Arab Emirates'],
    poBox: 'P.O. Box 712930',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=24.9095235,55.1178151',
  },
  phone: { display: '+971 4 351 7399', href: 'tel:+97143517399' },
  whatsapp: { display: '+971 55 582 7212', number: '971555827212' },
  /** Listed in the footer without a division; shown only on the contact page. */
  otherMobiles: [
    { display: '+971 50 954 2841', href: 'tel:+971509542841', confirm: true },
    { display: '+971 50 631 1538', href: 'tel:+971506311538', confirm: true },
  ],
  email: { general: 'info@globaldwc.com', business: 'bdm@globaldwc.com' },
  store: {
    base: 'https://globalaroma.me',
    shop: 'https://globalaroma.me/shop/',
    oils: 'https://globalaroma.me/product-category/oils/',
    diffusers: 'https://globalaroma.me/product-category/diffusers/',
    cart: 'https://globalaroma.me/cart/',
  },
} as const;

export function waLink(text: string): string {
  return `https://wa.me/${company.whatsapp.number}?text=${encodeURIComponent(text)}`;
}

export function mailLink(subject: string, body: string, to: string = company.email.general): string {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Industries exactly as the official home page lists them. */
export const industries = [
  { id: 'hotels', name: 'Hotels' },
  { id: 'restaurants', name: 'Restaurants' },
  { id: 'residential', name: 'Residential buildings' },
  { id: 'hospitals', name: 'Hospitals' },
  { id: 'airports', name: 'Airports' },
  { id: 'malls', name: 'Malls' },
  { id: 'it', name: 'Information technology' },
  { id: 'datacenter', name: 'AI and data centres' },
] as const;
