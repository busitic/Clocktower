export { cn } from "cn"
/**
 * Convert pence to a UK-formatted price string.
 * 47500 → "£475"
 */
export function formatPrice(pence: number, showPence = false): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: showPence ? 2 : 0,
    maximumFractionDigits: showPence ? 2 : 0,
  }).format(pence / 100);
}

/** Convert a pounds input from a form into pence for storage. 475 → 47500 */
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100);
}

/** Convert stored pence back to pounds for form fields. 47500 → 475 */
export function penceToPounds(pence: number): number {
  return pence / 100;
}