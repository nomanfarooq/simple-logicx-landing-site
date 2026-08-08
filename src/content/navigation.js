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

export const offices = [
  { city: "London", region: "United Kingdom", timezone: "GMT" },
  { city: "Lahore", region: "Pakistan", timezone: "PKT" },
  { city: "Dubai", region: "United Arab Emirates", timezone: "GST" },
];

export const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: "Linkedin" },
  { label: "GitHub", href: "https://github.com/", icon: "Github" },
  { label: "X", href: "https://x.com/", icon: "Twitter" },
];
