import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
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
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const burgerRef = useRef(null);
  const { pathname } = useLocation();

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
