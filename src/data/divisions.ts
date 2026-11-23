/**
 * Division offers. Category names are the official site's own (footer menus
 * and category pages). Descriptions are our copy; they describe what each
 * category is and make no claims about specifications, brands, stock or
 * service levels, which are not published.
 */
export type DivisionId = 'aroma' | 'hospitality' | 'technology';

export interface Category {
  id: string;
  name: string;
  line: string;
  /** Buy online only where the existing store actually sells it. */
  buy?: string;
}

export interface Division {
  id: DivisionId;
  name: string;
  short: string;
  behaviour: 'flow' | 'weave' | 'signal';
  kicker: string;
  statement: string;
  intro: string;
  href: string;
  categories: Category[];
}

export const divisions: Division[] = [
  {
    id: 'aroma',
    name: 'Global Aroma',
    short: 'Aroma',
    behaviour: 'flow',
    kicker: 'Scent marketing',
    statement: 'A space people remember.',
    intro:
      'Fragrance oils, commercial and home diffusers, and signature scents designed around a brand. A library of 67 fragrances, many available to order online.',
    href: '/aroma',
    categories: [
      { id: 'library', name: 'Scent collection', line: '67 fragrances with full top, heart and base notes.' },
      { id: 'oils', name: 'Oils for diffusers', line: 'Diffuser oils, ordered online in several volumes.', buy: 'https://globalaroma.me/product-category/oils/' },
      { id: 'diffusers', name: 'Aroma diffusers', line: 'From compact units to HVAC-connected systems.', buy: 'https://globalaroma.me/product-category/diffusers/' },
      { id: 'home', name: 'Candles, reed diffusers & room spray', line: 'Home fragrance for rooms, suites, spas and offices.' },
      { id: 'sampler', name: 'Scent boxes', line: 'A sampler of 21 fragrances, 5 ml each.' },
      { id: 'custom', name: 'Signature scent', line: 'A bespoke fragrance designed to match a brand’s identity.' },
      { id: 'car', name: 'Car diffusers & scent bottles', line: 'Available on request.' },
    ],
  },
  {
    id: 'hospitality',
    name: 'Global Hospitality',
    short: 'Hospitality',
    behaviour: 'weave',
    kicker: 'Guest experience & supplies',
    statement: 'Every detail a guest touches.',
    intro:
      'Supplies for hotels, serviced residences and restaurants, from the linen on the bed to the trolley in the corridor and the furniture in the ballroom.',
    href: '/hospitality',
    categories: [
      { id: 'room-linen', name: 'Guest room linen', line: 'Bed and bath linen for guest rooms.' },
      { id: 'room-electrical', name: 'Guest room electrical', line: 'In-room electrical items and appliances.' },
      { id: 'amenities', name: 'Guest amenities', line: 'Bathroom and in-room amenities.' },
      { id: 'trolleys', name: 'Housekeeping & front-office trolleys', line: 'Service trolleys for housekeeping, luggage and front office.' },
      { id: 'fb-linen', name: 'F&B linen', line: 'Table linen for restaurants and banqueting.' },
      { id: 'banquet', name: 'Banquet furniture', line: 'Furniture for ballrooms, meeting and event spaces.' },
    ],
  },
  {
    id: 'technology',
    name: 'Global Technology',
    short: 'Technology',
    behaviour: 'signal',
    kicker: 'ICT & smart business solutions',
    statement: 'Systems that keep a building connected.',
    intro:
      'Connectivity, digital signage and integrated systems for commercial buildings, with support and maintenance once they are running.',
    href: '/technology',
    categories: [
      { id: 'smart', name: 'Smart solutions', line: 'Smart building and business systems.' },
      { id: 'ict', name: 'ICT & connectivity', line: 'Networks and connectivity infrastructure.' },
      { id: 'signage', name: 'Digital signage', line: 'Screens and content display for public and guest areas.' },
      { id: 'integration', name: 'System integration', line: 'Bringing separate systems together to work as one.' },
      { id: 'support', name: 'Support & maintenance', line: 'Keeping installed systems running.' },
    ],
  },
];

export const divisionById = Object.fromEntries(divisions.map((d) => [d.id, d])) as Record<DivisionId, Division>;
