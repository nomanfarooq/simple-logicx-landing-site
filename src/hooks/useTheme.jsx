import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Theme control (§9).
 *
 * Three states, not two: "system" is a real, persistable choice, distinct from
 * having picked light or dark. When theme === "system" we remove [data-theme]
 * entirely and let the CSS `light-dark()` tokens follow the OS.
 *
 * The token layer does the actual colour work (see styles/theme.css). This
 * hook only owns: which of the three states is active, persistence, and
 * keeping <meta name="theme-color"> in sync.
 *
 * The pre-paint flash is prevented by the inline script in index.html, NOT
 * here — by the time React mounts, first paint has already happened.
 */

const STORAGE_KEY = "slx-theme";
const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Private mode / blocked storage — fall back to following the OS.
    return "system";
  }
}

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  // Tracks what is actually rendered ("light" | "dark"), resolving "system".
  const [resolved, setResolved] = useState(() =>
    readStoredTheme() === "system" ? (systemPrefersDark() ? "dark" : "light") : readStoredTheme(),
  );

  // Apply to <html> and persist.
  useEffect(() => {
    const root = document.documentElement;

    // Suppress transitions for one frame (§9.7) — otherwise every element on
    // the page animates its colour simultaneously and reads as a glitch.
    root.classList.add("theme-transition-off");

    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }

    setResolved(theme === "system" ? (systemPrefersDark() ? "dark" : "light") : theme);

    try {
      if (theme === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Non-fatal: the theme still applies for this session.
    }

    const frame = requestAnimationFrame(() => {
      root.classList.remove("theme-transition-off");
    });
    return () => cancelAnimationFrame(frame);
  }, [theme]);

  // Follow the OS live while in "system" mode.
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => setResolved(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  // Keep the browser chrome colour in sync (§9.5).
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#050505" : "#ffffff");
  }, [resolved]);

  const setTheme = useCallback((next) => setThemeState(next), []);

  const toggle = useCallback(() => {
    // Toggling from "system" commits to the opposite of what is on screen.
    setThemeState(resolved === "dark" ? "light" : "dark");
  }, [resolved]);

  const value = useMemo(
    () => ({ theme, resolved, setTheme, toggle }),
    [theme, resolved, setTheme, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}
