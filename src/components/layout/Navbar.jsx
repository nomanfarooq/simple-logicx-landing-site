import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import Container from "../ui/Container";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import ThemeToggle from "./ThemeToggle";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import { mainNav } from "../../content/navigation";
import { cn } from "../../lib/cn";

/**
 * Primary navigation (§4.3).
 *
 * Sticky rather than fixed: `position: sticky` keeps the bar in normal flow,
 * so it cannot overlap the first section or require a magic top-padding
 * elsewhere — which is the usual source of "the hero is 80px too short".
 */
export default function Navbar({ onOpenSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const burgerRef = useRef(null);
  const { pathname } = useLocation();

  // Read after mount, not during render: the hint text differs per platform and
  // rendering the wrong one first would be a visible swap on hydration.
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation dismisses the overlay, including browser back/forward.
  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-line bg-base/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container size="wide" className="flex items-center justify-between gap-4 py-3">
        <Link to="/" aria-label="SimpleLogicX — home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  {item.mega ? (
                    <MegaMenu item={item} isActive={active} />
                  ) : (
                    <NavLink
                      to={item.href}
                      className={cn(
                        "relative inline-flex rounded-(--radius-pill) px-3 py-2 text-sm font-medium transition-colors",
                        active ? "text-ink" : "text-ink-soft hover:text-ink",
                      )}
                    >
                      {item.label}
                      {/* Active indicator — a real element, not a border, so it
                          cannot shift the text baseline between states. */}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="grad-primary absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                        />
                      )}
                    </NavLink>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Search trigger. The ⌘K binding lives in RootLayout; this is what
              makes it discoverable, and it is the only way to reach the
              palette by pointer.

              The shortcut is repeated in the accessible name on purpose. WCAG
              2.5.3 requires the name to contain the visible label, and the
              hint is visible text however decorative it looks — naming this
              only "Search the site" failed the check for the same reason the
              logo did. aria-keyshortcuts is what actually tells assistive tech
              about the binding; the label just has to agree with the pixels. */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label={`Search the site — ${isMac ? "⌘K" : "Ctrl K"}`}
            aria-keyshortcuts="Meta+K Control+K"
            className="group grid h-10 min-w-10 place-items-center rounded-(--radius-pill) border border-line text-ink-soft transition-colors hover:bg-surface hover:text-ink md:flex md:items-center md:gap-2 md:px-3"
          >
            <Search aria-hidden="true" className="size-4" />
            <span
              aria-hidden="true"
              className="hidden font-mono text-[11px] text-ink-muted md:inline"
            >
              {isMac ? "⌘K" : "Ctrl K"}
            </span>
          </button>

          <ThemeToggle />
          <Button to="/contact" className="hidden sm:inline-flex">
            Start a project
          </Button>
          <button
            ref={burgerRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="grid size-10 place-items-center rounded-(--radius-pill) border border-line text-ink-soft transition-colors hover:bg-surface hover:text-ink lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </button>
        </div>
      </Container>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        nav={mainNav}
        triggerRef={burgerRef}
      />
    </header>
  );
}
