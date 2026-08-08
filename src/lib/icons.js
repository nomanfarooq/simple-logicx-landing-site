import {
  Boxes,
  Building2,
  Cloud,
  Cpu,
  Github,
  Globe,
  Linkedin,
  Smartphone,
  Sparkles,
  Twitter,
} from "lucide-react";

/**
 * Explicit icon registry.
 *
 * Content files reference icons by name (a string), so they stay plain data
 * and can be serialised. Resolving those names through a hand-written map —
 * rather than lucide's dynamic import helper — keeps tree-shaking intact: only
 * the icons listed here reach the bundle.
 */
const ICONS = {
  Boxes,
  Building2,
  Cloud,
  Cpu,
  Github,
  Globe,
  Linkedin,
  Smartphone,
  Sparkles,
  Twitter,
};

export function getIcon(name) {
  return ICONS[name] ?? Boxes;
}
