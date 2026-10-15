/**
 * Canonical live storefront configuration for PALLUVO.
 * https://palluvo.store is the live serving host (palluvo.com returns DNS NXDOMAIN).
 */
export const SITE_URL = "https://palluvo.store";

/**
 * Returns an absolute URL pointing to the live canonical domain.
 */
export function getAbsoluteUrl(path: string = ""): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}
