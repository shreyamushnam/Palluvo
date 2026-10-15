/**
 * Phone number normalization utilities for Palluvo storefront.
 */

/**
 * Normalizes phone numbers for display and profile/address storage in Indian standard format:
 * e.g., "+91 98765 43210".
 * Handles compact format "+919876543210", 10-digit "9876543210", leading zeros "09876543210",
 * and custom formatted strings.
 */
export function formatStoredPhone(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== "string") return "+91 98765 43210";
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, "");
  const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
  if (tenDigits.length === 10) {
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }
  return trimmed || "+91 98765 43210";
}

/**
 * Extracts the clean 10-digit national number required by the checkout phone field,
 * ensuring no "+", country code "91", spaces, hyphens, or extra prefixes remain.
 * This guarantees compliance with pattern="[0-9]*" and maxLength={10}.
 */
export function extract10DigitPhone(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== "string") return "";
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}
