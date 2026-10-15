/**
 * Phone number normalization and validation utilities for Palluvo storefront.
 */

/**
 * Validates whether an entered string is a valid Indian mobile number.
 * Accepts:
 * - 10 digits starting with 6, 7, 8, 9 (e.g. 9876543210)
 * - 11 digits starting with 0 followed by 6-9 (e.g. 09876543210)
 * - 12 digits starting with +91 or 91 followed by 6-9 (e.g. +91 98765 43210, +919876543210)
 * Rejects numbers with unsupported country codes, incomplete lengths (<10 digits), or extra digits (>12).
 */
export function isValidIndianMobile(rawPhone?: string | null): boolean {
  if (!rawPhone || typeof rawPhone !== "string") return false;
  const trimmed = rawPhone.trim();
  // Reject unsupported international country codes (starts with + but not +91)
  if (trimmed.startsWith("+") && !trimmed.startsWith("+91")) {
    return false;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return /^[6-9]\d{9}$/.test(digits.slice(1));
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^[6-9]\d{9}$/.test(digits.slice(2));
  }
  return false;
}

/**
 * Normalizes phone numbers for display and profile/address storage in Indian standard format:
 * e.g., "+91 98765 43210".
 * Handles compact format "+919876543210", 10-digit "9876543210", leading zeros "09876543210",
 * and custom formatted strings.
 * Falls back to default demo number "+91 98765 43210" if malformed or incomplete.
 */
export function formatStoredPhone(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== "string") return "+91 98765 43210";
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, "");
  let tenDigits = "";
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    tenDigits = digits;
  } else if (digits.length === 11 && digits.startsWith("0") && /^[6-9]\d{9}$/.test(digits.slice(1))) {
    tenDigits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    tenDigits = digits.slice(2);
  } else if (digits.length >= 10) {
    const candidate = digits.slice(-10);
    if (/^[6-9]\d{9}$/.test(candidate)) {
      tenDigits = candidate;
    }
  }

  if (tenDigits) {
    return `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`;
  }
  return "+91 98765 43210";
}

/**
 * Extracts the clean 10-digit national number required by the checkout phone field,
 * ensuring no "+", country code "91", spaces, hyphens, or extra prefixes remain.
 * Returns empty string if the number is incomplete or malformed (< 10 digits).
 */
export function extract10DigitPhone(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== "string") return "";
  const digits = rawPhone.replace(/\D/g, "");
  let tenDigits = "";
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    tenDigits = digits;
  } else if (digits.length === 11 && digits.startsWith("0") && /^[6-9]\d{9}$/.test(digits.slice(1))) {
    tenDigits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith("91") && /^[6-9]\d{9}$/.test(digits.slice(2))) {
    tenDigits = digits.slice(2);
  } else if (digits.length >= 10) {
    const candidate = digits.slice(-10);
    if (/^[6-9]\d{9}$/.test(candidate)) {
      tenDigits = candidate;
    }
  }
  return tenDigits;
}
