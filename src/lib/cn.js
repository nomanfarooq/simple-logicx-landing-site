import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose class names, with later Tailwind utilities correctly overriding
 * earlier ones (`twMerge` resolves conflicts like `px-4 px-8` -> `px-8`).
 *
 * Without this, a `className` prop passed to a primitive silently loses to the
 * component's own defaults depending on CSS source order — which is how
 * layout containers end up with the wrong padding and drift off-centre.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
