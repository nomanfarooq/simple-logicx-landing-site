import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "../hooks/useTheme";
import { LenisProvider } from "../hooks/useLenisInstance";

/**
 * Global providers.
 *
 * `reducedMotion="user"` is the global enforcement point required by §5.4 —
 * every Framer animation in the tree becomes a no-op when the OS asks for
 * reduced motion, so a component that forgets its own guard still complies.
 * v1 had a useReducedMotion hook that nothing imported; this replaces it.
 *
 * LenisProvider sits inside MotionConfig but outside the router, so a single
 * scroll instance survives every route change rather than being torn down and
 * recreated per page.
 */
export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <LenisProvider>{children}</LenisProvider>
      </MotionConfig>
    </ThemeProvider>
  );
}
