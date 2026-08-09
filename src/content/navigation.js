import { services } from "./services";

/**
 * Navigation model (§4.3). Shared by the desktop navbar, the mega-menu, the
 * mobile overlay and the footer, so a route can never appear in one and be
 * missing from another.
 */

export const mainNav = [
  {
    label: "Services",
    href: "/services",
    // Presence of `mega` is what makes the navbar render a panel for this item.
    mega: services.map((s) => ({
      label: s.title,
      href: `/services/${s.slug}`,
      description: s.tagline,
      icon: s.icon,
    })),
  },
  { label: "Work", href: "/work" },
  { label: "Process", href: "/process" },
  { label: "Pricing", href: "/pricing" },
  { label: "Insights", href: "/insights" },
  { label: "About", href: "/about" },
];

export const footerNav = [
  {
    heading: "Services",
    links: services.map((s) => ({ label: s.title, href: `/services/${s.slug}` })),
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our Process", href: "/process" },
      { label: "Case Studies", href: "/work" },
      { label: "Insights", href: "/insights" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

/**
 * Offices. `city`, `region` and `timezone` are the fields the footer and the
 * contact panel use; `since`, `headcount` and `role` are extra detail the
 * about page shows and everything else ignores.
 */
export const offices = [
  {
    city: "London",
    region: "United Kingdom",
    timezone: "GMT",
    since: "2014",
    headcount: "14 people",
    role: "Discovery, architecture and design. Where most engagements start and where the client-facing principals sit.",
  },
  {
    city: "Lahore",
    region: "Pakistan",
    timezone: "PKT",
    since: "2016",
    headcount: "22 people",
    role: "The largest engineering office: platform, data and mobile practices, plus the shared deployment tooling every engagement inherits.",
  },
  {
    city: "Dubai",
    region: "United Arab Emirates",
    timezone: "GST",
    since: "2022",
    headcount: "8 people",
    role: "Regional enterprise programmes, applied AI, and the procurement and compliance work multi-squad engagements need.",
  },
];

export const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "Linkedin" },
  { label: "GitHub", href: "https://github.com/", icon: "Github" },
  { label: "X", href: "https://x.com/", icon: "Twitter" },
];
