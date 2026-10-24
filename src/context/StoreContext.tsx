"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Product, PRODUCTS } from "@/data/products";
import { OrderRecord, OrderProductItem, MOCK_ORDERS, SavedAddress, MOCK_ADDRESSES } from "@/data/mockOrders";
import { formatStoredPhone, isValidIndianMobile } from "@/utils/phone";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  blouseOption?: string;
}

interface ToastInfo {
  id: number;
  message: string;
  type?: "success" | "info";
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  mobile?: string;
  isConnoisseur?: boolean;
  preferredDrape?: string;
}

interface StoreContextType {
  isHydrated: boolean;
  cart: CartItem[];
  wishlist: string[];
  orders: OrderRecord[];
  addresses: SavedAddress[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  discountAmount: number;
  appliedCoupon: string | null;
  toast: ToastInfo | null;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  finalTotal: number;
  cartCount: number;
  wishlistCount: number;
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (user?: UserProfile) => void;
  logout: () => void;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, blouseOption?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string, blouseOption?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string, blouseOption?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (order: Omit<OrderRecord, "id" | "orderNumber" | "date" | "status" | "deliveryDate">) => OrderRecord;
  clearOrders: () => void;
  addAddress: (address: Omit<SavedAddress, "id">) => SavedAddress;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  showToast: (message: string, type?: "success" | "info") => void;
  formatPrice: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

/**
 * Validates and normalizes raw parsed cart data from storage.
 * Ensures the value is an array of valid CartItem objects, maps each item's product
 * to canonical product records from PRODUCTS by product ID, and sanitizes quantities.
 * Returns a safe array of valid CartItem records.
 */
export function validateAndNormalizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const normalized: CartItem[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;

    // Resolve canonical product ID from item.product object or item.productId property
    const rawProduct = (item as { product?: unknown; productId?: unknown }).product;
    const productId =
      typeof rawProduct === "object" && rawProduct !== null && "id" in rawProduct && typeof (rawProduct as { id?: unknown }).id === "string"
        ? (rawProduct as { id: string }).id
        : typeof (item as { productId?: unknown }).productId === "string"
        ? (item as { productId: string }).productId
        : undefined;

    if (!productId) continue;

    const canonicalProduct = PRODUCTS.find((p) => p.id === productId);
    if (!canonicalProduct) continue;

    // Validate and sanitize quantity (1 to 99)
    const rawQty = (item as { quantity?: unknown }).quantity;
    const parsedQty = typeof rawQty === "number" && Number.isFinite(rawQty) ? Math.floor(rawQty) : 1;
    const quantity = Math.max(1, Math.min(parsedQty, 99));

    // Sanitize optional variant options
    const rawColor = (item as { selectedColor?: unknown }).selectedColor;
    const selectedColor =
      typeof rawColor === "string" && rawColor.trim().length > 0
        ? rawColor.trim()
        : canonicalProduct.color;

    const rawBlouse = (item as { blouseOption?: unknown }).blouseOption;
    let blouseOption: string | undefined = undefined;
    if (canonicalProduct.hasBlousePiece && typeof rawBlouse === "string") {
      let trimmed = rawBlouse.trim();
      if (trimmed === "Unstitched (Included)") {
        trimmed = "With Blouse";
      }
      const validOptions = canonicalProduct.blouseOptions?.length
        ? canonicalProduct.blouseOptions
        : ["With Blouse", "Without Blouse"];
      if (validOptions.includes(trimmed)) {
        blouseOption = trimmed;
      }
    }

    normalized.push({
      product: canonicalProduct,
      quantity,
      selectedColor,
      blouseOption,
    });
  }

  return normalized;
}

const ACCOUNT_MAP_KEY = "palluvo_account_identity_map";
const ACCOUNT_META_KEY = "palluvo_account_identity_metadata";
const MIGRATION_META_KEY = "palluvo_account_migration_meta";

export interface AccountAliasMeta {
  accountId: string;
  type?: "primary" | "changed_email" | "phone";
  ownerEmail?: string;
  phone?: string;
  previousEmail?: string;
  status?: "active" | "unresolved";
  candidateAccountIds?: string[];
  candidateEmails?: string[];
  legacyId?: string;
  createdAt?: number;
  updatedAt?: number;
}

export function getAccountMetadata(): Record<string, AccountAliasMeta> {
  if (typeof window === "undefined" || !window.localStorage) return {};
  try {
    const raw = localStorage.getItem(ACCOUNT_META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setAccountMetadata(meta: Record<string, AccountAliasMeta>): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(ACCOUNT_META_KEY, JSON.stringify(meta));
  } catch {}
}

export interface MigrationMeta {
  migratedCollisionIds: Record<string, string[]>;
  quarantinedCollisionIds: Record<string, string[]>;
  quarantinedLegacyBuckets: Record<string, { quarantinedAt: number; emails: string[] }>;
  tombstonedKeys?: Record<string, boolean>;
  failedQuarantineKeys?: Record<string, boolean>;
  rekeyedOwnerIds?: Record<string, string>;
  unresolvedPhoneAliases?: Record<string, {
    legacyId: string;
    candidateAccountIds: string[];
    candidateEmails: string[];
    quarantinedAt: number;
  }>;
}

export function getMigrationMetadata(): MigrationMeta {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      migratedCollisionIds: {},
      quarantinedCollisionIds: {},
      quarantinedLegacyBuckets: {},
      tombstonedKeys: {},
      failedQuarantineKeys: {},
      rekeyedOwnerIds: {},
      unresolvedPhoneAliases: {},
    };
  }
  try {
    const raw = localStorage.getItem(MIGRATION_META_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      migratedCollisionIds: parsed.migratedCollisionIds || {},
      quarantinedCollisionIds: parsed.quarantinedCollisionIds || {},
      quarantinedLegacyBuckets: parsed.quarantinedLegacyBuckets || {},
      tombstonedKeys: parsed.tombstonedKeys || {},
      failedQuarantineKeys: parsed.failedQuarantineKeys || {},
      rekeyedOwnerIds: parsed.rekeyedOwnerIds || {},
      unresolvedPhoneAliases: parsed.unresolvedPhoneAliases || {},
    };
  } catch {
    return {
      migratedCollisionIds: {},
      quarantinedCollisionIds: {},
      quarantinedLegacyBuckets: {},
      tombstonedKeys: {},
      failedQuarantineKeys: {},
      rekeyedOwnerIds: {},
      unresolvedPhoneAliases: {},
    };
  }
}

export function setMigrationMetadata(meta: MigrationMeta): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(MIGRATION_META_KEY, JSON.stringify(meta));
  } catch {}
}

/**
 * Checks whether an account ID represents a legacy collision namespace that has been quarantined
 * and tombstoned, preventing it from serving as an active storage namespace.
 */
export function isQuarantinedAccountId(accountId?: string | null): boolean {
  if (!accountId || typeof accountId !== "string") return false;
  const trimmed = accountId.trim();
  if (!trimmed) return false;
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const safeId = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
    if (
      localStorage.getItem(`palluvo_tombstone_${safeId}`) === "1" ||
      localStorage.getItem(`palluvo_tombstone_${trimmed}`) === "1"
    ) {
      return true;
    }
    const meta = getMigrationMetadata();
    if (meta.quarantinedLegacyBuckets?.[trimmed] || meta.quarantinedCollisionIds?.[trimmed]) {
      return true;
    }
    if (meta.quarantinedLegacyBuckets?.[safeId] || meta.quarantinedCollisionIds?.[safeId]) {
      return true;
    }
    if (
      meta.tombstonedKeys?.[`palluvo_ecommerce_orders_${safeId}`] ||
      meta.tombstonedKeys?.[`palluvo_ecommerce_orders_${trimmed}`]
    ) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Checks whether a specific storage key is tombstoned or quarantined.
 */
export function isQuarantinedStorageKey(key?: string | null): boolean {
  if (!key || typeof key !== "string") return false;
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    if (localStorage.getItem(`palluvo_tombstone_${key}`) === "1") {
      return true;
    }
    if (localStorage.getItem(`palluvo_quarantine_${key}`) !== null) {
      return true;
    }
    const meta = getMigrationMetadata();
    if (meta.tombstonedKeys?.[key] || meta.failedQuarantineKeys?.[key]) {
      return true;
    }
    const match = key.match(/^palluvo_ecommerce_(?:orders|addresses)_(.+)$/);
    if (match) {
      const suffix = match[1];
      if (
        meta.quarantinedLegacyBuckets?.[suffix] ||
        meta.quarantinedCollisionIds?.[suffix] ||
        localStorage.getItem(`palluvo_tombstone_${suffix}`) === "1"
      ) {
        return true;
      }
    }
  } catch {}
  return false;
}

/**
 * Checks whether a key is recorded as a failed quarantine backup that must be preserved.
 */
export function isFailedQuarantineKey(key?: string | null): boolean {
  if (!key || typeof key !== "string") return false;
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    const meta = getMigrationMetadata();
    return Boolean(meta.failedQuarantineKeys?.[key]);
  } catch {
    return false;
  }
}

/**
 * Safely quarantines ambiguous or unverified legacy customer data buckets (orders and addresses)
 * by moving them to dedicated quarantine keys ('palluvo_quarantine_*') and clearing active storage keys.
 * This guarantees that shared collision buckets or unauthenticated legacy namespaces cannot be hydrated
 * by an alias or user session that did not definitively own all records in that bucket.
 *
 * Verifies each quarantine backup before removing the active source key. If backup fails (e.g. QuotaExceededError),
 * the source bucket is preserved in place and tracked to prevent hydration until it can be safely backed up.
 */
export function quarantineLegacyBucket(accountId: string, relatedEmails?: string[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const trimmedId = accountId.trim();
    const safeId = trimmedId.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);

    const keysToQuarantine = new Set<string>([
      `palluvo_ecommerce_orders_${safeId}`,
      `palluvo_ecommerce_addresses_${safeId}`,
      `palluvo_ecommerce_orders_${trimmedId}`,
      `palluvo_ecommerce_addresses_${trimmedId}`,
    ]);

    if (relatedEmails) {
      for (const email of relatedEmails) {
        if (!email) continue;
        const lowerEmail = email.toLowerCase().trim();
        const legacySanitized = lowerEmail.replace(/[^a-z0-9_.-]/g, "_");
        keysToQuarantine.add(`palluvo_ecommerce_orders_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_orders_usr_email_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_addresses_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_addresses_usr_email_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_orders_${lowerEmail}`);
        keysToQuarantine.add(`palluvo_ecommerce_addresses_${lowerEmail}`);
      }
    }

    const migrationMeta = getMigrationMetadata();
    migrationMeta.quarantinedLegacyBuckets = migrationMeta.quarantinedLegacyBuckets || {};
    migrationMeta.quarantinedCollisionIds = migrationMeta.quarantinedCollisionIds || {};
    migrationMeta.tombstonedKeys = migrationMeta.tombstonedKeys || {};
    migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};

    // Register persistent tombstones on all candidate keys and IDs
    for (const key of keysToQuarantine) {
      migrationMeta.tombstonedKeys[key] = true;
      try {
        localStorage.setItem(`palluvo_tombstone_${key}`, "1");
      } catch {}
    }
    try {
      localStorage.setItem(`palluvo_tombstone_${trimmedId}`, "1");
      localStorage.setItem(`palluvo_tombstone_${safeId}`, "1");
    } catch {}

    for (const key of keysToQuarantine) {
      try {
        const val = localStorage.getItem(key);
        if (val !== null) {
          const quarantineKey = `palluvo_quarantine_${key}`;
          let copyVerified = false;
          try {
            localStorage.setItem(quarantineKey, val);
            const verified = localStorage.getItem(quarantineKey);
            if (verified === val) {
              copyVerified = true;
            }
          } catch {
            copyVerified = false;
          }

          if (copyVerified) {
            try {
              localStorage.removeItem(key);
            } catch {}
            if (migrationMeta.failedQuarantineKeys?.[key]) {
              delete migrationMeta.failedQuarantineKeys[key];
            }
          } else {
            // Backup failed (e.g. QuotaExceededError).
            // Preserve the source bucket and keep it from hydration until safely handled.
            migrationMeta.failedQuarantineKeys[key] = true;
          }
        }
      } catch {}
    }

    // Retry any previously failed quarantine keys
    if (migrationMeta.failedQuarantineKeys) {
      for (const failedKey of Object.keys(migrationMeta.failedQuarantineKeys)) {
        if (!keysToQuarantine.has(failedKey)) {
          try {
            const val = localStorage.getItem(failedKey);
            if (val !== null) {
              const qKey = `palluvo_quarantine_${failedKey}`;
              localStorage.setItem(qKey, val);
              if (localStorage.getItem(qKey) === val) {
                try {
                  localStorage.removeItem(failedKey);
                } catch {}
                delete migrationMeta.failedQuarantineKeys[failedKey];
              }
            } else {
              delete migrationMeta.failedQuarantineKeys[failedKey];
            }
          } catch {}
        }
      }
    }

    if (!migrationMeta.quarantinedLegacyBuckets[trimmedId]) {
      migrationMeta.quarantinedLegacyBuckets[trimmedId] = {
        quarantinedAt: Date.now(),
        emails: relatedEmails ? Array.from(new Set(relatedEmails.map((e) => e.toLowerCase().trim()))) : [],
      };
    }
    if (relatedEmails && relatedEmails.length > 0) {
      const existing = migrationMeta.quarantinedCollisionIds[trimmedId] || [];
      migrationMeta.quarantinedCollisionIds[trimmedId] = Array.from(
        new Set([...existing, ...relatedEmails.map((e) => e.toLowerCase().trim())])
      );
    }
    setMigrationMetadata(migrationMeta);
  } catch {}
}


/**
 * Encodes an identifier (such as an email address) into a safe, collision-resistant string.
 * Uses an injective encoding where every character outside [a-z0-9] is encoded as _<hex>_.
 * Because '_' itself is encoded as _5f_, the output is 100% collision-resistant and
 * mathematically injective: distinct inputs will never produce identical outputs
 * (e.g. "nina+orders@example.com" -> "nina_2b_orders_40_example_2e_com",
 *  while "nina_orders@example.com" -> "nina_5f_orders_40_example_2e_com").
 */
export function encodeIdentifierToId(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
}

/**
 * Returns the exact direct legacy sanitized account ID formula used in pre-migration releases:
 * usr_email_${email.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "_")}
 */
export function getDirectLegacyEmailId(email: string): string {
  return `usr_email_${email.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "_")}`;
}

/**
 * Resolves a known real email address registered to an account ID, if any.
 */
export function lookupEmailByAccountId(accountId?: string | null): string | null {
  if (!accountId || typeof accountId !== "string") return null;
  const targetId = accountId.trim();
  if (!targetId) return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      if (map && typeof map === "object") {
        for (const [k, v] of Object.entries(map)) {
          if (typeof v === "string" && v.trim() === targetId && k.includes("@") && !k.startsWith("connoisseur.")) {
            return k.toLowerCase().trim();
          }
        }
      }
    }
    const meta = getAccountMetadata();
    for (const [k, m] of Object.entries(meta)) {
      if (m?.accountId === targetId && k.includes("@") && !k.startsWith("connoisseur.")) {
        return k.toLowerCase().trim();
      }
      if (m?.accountId === targetId && m?.ownerEmail && !m.ownerEmail.startsWith("connoisseur.")) {
        return m.ownerEmail.toLowerCase().trim();
      }
    }
  } catch {}
  return null;
}

/**
 * Normalizes an explicit phone value to its exact 10-digit subscriber number.
/**
 * Normalizes phone tokens into a standard 10-digit Indian subscriber number.
 * Accepts exact 10-digit numbers starting with 6-9, 11-digit numbers with leading '0' followed by 6-9,
 * or 12-digit numbers with leading '91' or '+91' followed by 6-9.
 * Validates subscriber numbers against Indian mobile rules (/^[6-9]\d{9}$/) and rejects
 * malformed tokens or unsupported international country codes.
 */
export function normalizeExplicitPhoneToken(raw: unknown): string | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const rawStr = String(raw).trim();
  if (rawStr.startsWith("+") && !rawStr.startsWith("+91")) {
    return null;
  }
  const digits = rawStr.replace(/\D/g, "");
  let tenDigits: string | null = null;
  if (digits.length === 10) {
    tenDigits = digits;
  } else if (digits.length === 11 && digits.startsWith("0")) {
    tenDigits = digits.slice(1);
  } else if (digits.length === 12 && digits.startsWith("91")) {
    tenDigits = digits.slice(2);
  }
  if (tenDigits && /^[6-9]\d{9}$/.test(tenDigits)) {
    return tenDigits;
  }
  // Reject extra trailing or leading digits or non-Indian mobile format; fail closed rather than slicing
  return null;
}

/**
 * Extracts explicit normalized 10-digit phone tokens from an object or address string.
 * Rejects arbitrary concatenated digits (e.g. flat number + pincode) by requiring
 * explicit phone fields, labeled phone tokens, or bounded standalone 10-digit phone tokens.
 * Parses exactly one phone number from a label and rejects extra trailing digits
 * rather than slicing them off into a synthetic phone token.
 */
export function extractExplicitPhoneTokens(source: unknown): string[] {
  if (!source) return [];
  const tokens = new Set<string>();

  const addIfValid = (raw: unknown) => {
    const normalized = normalizeExplicitPhoneToken(raw);
    if (normalized) {
      tokens.add(normalized);
    }
  };

  // 1. Explicit object fields
  if (typeof source === "object" && source !== null) {
    const obj = source as Record<string, unknown>;
    addIfValid(obj.phone);
    addIfValid(obj.mobile);
    addIfValid(obj.tel);
    addIfValid(obj.contactPhone);
    addIfValid(obj.contactNumber);
    addIfValid(obj.phoneNumber);
    if (obj.customer && typeof obj.customer === "object") {
      const cust = obj.customer as Record<string, unknown>;
      addIfValid(cust.phone);
      addIfValid(cust.mobile);
      addIfValid(cust.tel);
    }
    if (obj.shippingAddress) {
      if (typeof obj.shippingAddress === "object") {
        const ship = obj.shippingAddress as Record<string, unknown>;
        addIfValid(ship.phone);
        addIfValid(ship.mobile);
        addIfValid(ship.tel);
      } else if (typeof obj.shippingAddress === "string") {
        for (const t of extractExplicitPhoneTokens(obj.shippingAddress)) {
          tokens.add(t);
        }
      }
    }
    return Array.from(tokens);
  }

  // 2. String parsing
  if (typeof source === "string") {
    const str = source.trim();
    if (!str) return [];

    // Pattern A: Explicitly labeled phone prefixes
    // Parse exactly one phone number immediately after the label, bounded so trailing digits
    // (such as a pincode, e.g. "Phone: 9876598765 560001") are never captured or sliced into synthetic phones.
    // Accepts parenthesized subscriber grouping (e.g. "Phone: (987) 654-3210") while retaining the extra-digit guard.
    const labeledRegex =
      /(?:phone|ph|mobile|mob|tel|contact|cell)\b[\s.:#-]*((?:\+?91[\s.-]?|\(\+?91\)[\s.-]?|0[\s.-]?)?(?:\(\s*\d{2}\s*\)[\s.-]?(?:\d[\s.-]?){7}\d|\(\s*\d{3}\s*\)[\s.-]?(?:\d[\s.-]?){6}\d|\(\s*\d{4}\s*\)[\s.-]?(?:\d[\s.-]?){5}\d|\(\s*\d{5}\s*\)[\s.-]?(?:\d[\s.-]?){4}\d|(?:\d[\s.-]?){9}\d))(?!\d)/gi;
    let match: RegExpExecArray | null;
    while ((match = labeledRegex.exec(str)) !== null) {
      const captured = match[1];
      if (captured) {
        const norm = normalizeExplicitPhoneToken(captured);
        if (norm) {
          tokens.add(norm);
        }
      }
    }

    // Pattern B: Delimited standalone 10-digit phone patterns
    // e.g. bounded by delimiters/non-digits, optionally prefixed by +91 or 91
    const standaloneRegex = /(?:^|[^\d])(?:\+?91[\s-]?)?([6-9]\d{9})(?=$|[^\d])/g;
    while ((match = standaloneRegex.exec(str)) !== null) {
      const captured = match[1];
      if (captured && captured.length === 10) {
        tokens.add(captured);
      }
    }
  }

  return Array.from(tokens);
}

/**
 * Scans order and address records in the legacy storage bucket or its quarantine backup
 * to associate a phone alias with an email belonging to candidate account owners.
 * Collects all matching canonical owners across the legacy records and resolves only
 * when exactly one distinct owner remains; otherwise fails closed and returns null
 * to keep the alias quarantined/unresolved.
 * Strictly excludes unresolved changed_email aliases (missing/cyclic chains) from being
 * treated as root canonical owners.
 */
export function findOwnerEmailForPhoneInRecords(
  phoneDigits: string,
  candidateEmails: string[],
  legacyAccountId: string
): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  if (!phoneDigits || !candidateEmails.length || !legacyAccountId) return null;

  const targetPhone = normalizeExplicitPhoneToken(phoneDigits);
  if (!targetPhone) return null;

  const lowerCandidates = candidateEmails
    .map((e) => e.toLowerCase().trim())
    .filter((e) => e && e.includes("@"));
  if (!lowerCandidates.length) return null;

  const safeLegacyId = legacyAccountId.toLowerCase().trim().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);

  const orderKeys = Array.from(new Set([
    `palluvo_ecommerce_orders_${safeLegacyId}`,
    `palluvo_ecommerce_orders_${legacyAccountId}`,
    `palluvo_quarantine_palluvo_ecommerce_orders_${safeLegacyId}`,
    `palluvo_quarantine_palluvo_ecommerce_orders_${legacyAccountId}`,
  ]));

  const meta = getAccountMetadata();
  const matchedCanonicalOwners = new Set<string>();
  let hasAmbiguousOwner = false;

  const getVerifiedCanonicalOwner = (email: string): string | undefined => {
    return getVerifiedRootOwner(email, meta);
  };

  for (const k of orderKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      for (const ord of parsed) {
        if (!ord || typeof ord !== "object") continue;
        const ordObj = ord as Record<string, unknown>;

        const tokens = extractExplicitPhoneTokens(ordObj);
        if (!tokens.includes(targetPhone)) {
          continue;
        }

        const cust = ordObj.customer as Record<string, unknown> | undefined;
        const custEmail = typeof cust?.email === "string" ? cust.email.toLowerCase().trim() : "";
        const ordEmail = typeof ordObj.email === "string" ? ordObj.email.toLowerCase().trim() : "";

        for (const em of [custEmail, ordEmail]) {
          if (em && em.includes("@")) {
            const norm = em.toLowerCase().trim();
            const m = meta[norm];
            if (m?.type === "changed_email") {
              const root = getVerifiedRootOwner(norm, meta);
              if (!root) {
                // Unresolved changed_email entry: ambiguous ownership!
                // Skip treating alias as root and fail closed.
                hasAmbiguousOwner = true;
                continue;
              }
              matchedCanonicalOwners.add(root);
            } else {
              const canonical = getVerifiedRootOwner(norm, meta) || norm;
              matchedCanonicalOwners.add(canonical);
            }
          }
        }
      }
    } catch {}
  }

  const addressKeys = Array.from(new Set([
    `palluvo_ecommerce_addresses_${safeLegacyId}`,
    `palluvo_ecommerce_addresses_${legacyAccountId}`,
    `palluvo_quarantine_palluvo_ecommerce_addresses_${safeLegacyId}`,
    `palluvo_quarantine_palluvo_ecommerce_addresses_${legacyAccountId}`,
  ]));

  for (const k of addressKeys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      for (const addr of parsed) {
        if (!addr || typeof addr !== "object") continue;
        const addrObj = addr as Record<string, unknown>;

        const tokens = extractExplicitPhoneTokens(addrObj);
        if (!tokens.includes(targetPhone)) {
          continue;
        }

        const addrEmail = typeof addrObj.email === "string" ? addrObj.email.toLowerCase().trim() : "";
        const ownerEmail = typeof addrObj.ownerEmail === "string" ? addrObj.ownerEmail.toLowerCase().trim() : "";
        const userEmail = typeof addrObj.userEmail === "string" ? addrObj.userEmail.toLowerCase().trim() : "";

        for (const em of [addrEmail, ownerEmail, userEmail]) {
          if (em && em.includes("@")) {
            const norm = em.toLowerCase().trim();
            const m = meta[norm];
            if (m?.type === "changed_email") {
              const root = getVerifiedRootOwner(norm, meta);
              if (!root) {
                // Unresolved changed_email entry: ambiguous ownership!
                // Skip treating alias as root and fail closed.
                hasAmbiguousOwner = true;
                continue;
              }
              matchedCanonicalOwners.add(root);
            } else {
              const canonical = getVerifiedRootOwner(norm, meta) || norm;
              matchedCanonicalOwners.add(canonical);
            }
          }
        }
      }
    } catch {}
  }

  // Resolve only when exactly one distinct canonical owner remains across historical records,
  // and no ambiguous/unresolved changed_email entries were attached to this phone.
  // Otherwise fail closed (0 matches, conflicting owners, or ambiguous ownership).
  if (hasAmbiguousOwner || matchedCanonicalOwners.size !== 1) {
    return null;
  }

  const singleCanonicalOwner = Array.from(matchedCanonicalOwners)[0];

  // 1. Exact match in lowerCandidates (verify candidate itself is not an unresolved changed_email)
  if (lowerCandidates.includes(singleCanonicalOwner)) {
    const verifiedOwner = getVerifiedCanonicalOwner(singleCanonicalOwner);
    if (verifiedOwner === singleCanonicalOwner) {
      return singleCanonicalOwner;
    }
  }

  // 2. Candidate that resolves to singleCanonicalOwner
  const matchingCandidate = lowerCandidates.find((cand) => {
    const root = getVerifiedCanonicalOwner(cand);
    return root && root === singleCanonicalOwner;
  });

  if (matchingCandidate) {
    return matchingCandidate;
  }

  return null;
}

/**
 * Resolves the root/canonical base owner for an email alias by following the chain of
 * ownerEmail and previousEmail metadata references. Cycle-safe and stops at the root base email.
 * Returns undefined if the alias is marked changed_email but has unresolvable/ambiguous ownership.
 */
export function resolveRootOwner(
  email: string,
  meta: Record<string, AccountAliasMeta>
): string | undefined {
  if (!email || typeof email !== "string") return undefined;
  let current = email.toLowerCase().trim();
  if (!current || !current.includes("@")) return undefined;

  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);
    const m = meta[current];
    // If no metadata exists for current:
    // If reached from a prior pointer, or starting email without changed_email tag,
    // current represents an unregistered or implicit base email.
    if (!m) {
      return current;
    }

    // If explicitly marked as NOT a changed_email (e.g. primary or phone), it is a root email
    if (m.type && m.type !== "changed_email") {
      return current;
    }

    // For changed_email, check ownerEmail first, then previousEmail (ignoring self-pointers)
    const rawOwner = m.ownerEmail?.toLowerCase().trim();
    const rawPrev = m.previousEmail?.toLowerCase().trim();

    const nextTarget = (rawOwner && rawOwner !== current && rawOwner.includes("@"))
      ? rawOwner
      : (rawPrev && rawPrev !== current && rawPrev.includes("@") ? rawPrev : undefined);

    if (!nextTarget) {
      // Changed email with no predecessor/owner pointer -> unresolvable / ambiguous
      return undefined;
    }

    const targetMeta = meta[nextTarget];
    if (!targetMeta || (targetMeta.type && targetMeta.type !== "changed_email")) {
      return nextTarget;
    }

    current = nextTarget;
  }

  return undefined;
}

/**
 * Resolves the verified root owner for an email address.
 * Strictly excludes unresolved changed_email aliases (missing predecessor, cyclic, or ambiguous chains)
 * by returning undefined, failing closed instead of falling back to the alias itself.
 */
export function getVerifiedRootOwner(
  email: string | undefined | null,
  meta: Record<string, AccountAliasMeta>
): string | undefined {
  if (!email || typeof email !== "string") return undefined;
  const norm = email.toLowerCase().trim();
  if (!norm || !norm.includes("@")) return undefined;

  const m = meta[norm];
  if (m?.type === "changed_email") {
    const root = resolveRootOwner(norm, meta);
    // For changed_email, resolveRootOwner MUST return a valid base owner.
    // If undefined (missing predecessor, cyclic, or ambiguous), fail closed and return undefined.
    return root ? root.toLowerCase().trim() : undefined;
  }

  const root = resolveRootOwner(norm, meta);
  return (root || norm).toLowerCase().trim();
}

/**
 * Partitions a group of emails mapped to the same ID into distinct account owners.
 * Uses explicit changed_email metadata, root owner resolution, and active session signals to group aliases
 * belonging to the same account owner together, separating distinct account owners and preserving quarantine
 * when ownership is ambiguous or split across different original owners.
 */
export function partitionEmailsByAccountOwner(
  emails: string[],
  meta: Record<string, AccountAliasMeta>,
  activeUserEmail?: string | null
): {
  isSingleOwner: boolean;
  clusters: Array<{
    canonicalEmail: string;
    canonicalId: string;
    emails: string[];
    isChangedEmailChain: boolean;
  }>;
} {
  const normalized = Array.from(new Set(emails.map((e) => e.toLowerCase().trim()).filter((e) => e && e.includes("@"))));
  if (normalized.length <= 1) {
    const singleEmail = normalized[0] || "";
    const canonicalId = singleEmail === "radhika.sharma@example.com"
      ? "usr_demo_radhika"
      : `usr_email_${encodeIdentifierToId(singleEmail)}`;
    return {
      isSingleOwner: true,
      clusters: [{ canonicalEmail: singleEmail, canonicalId, emails: normalized, isChangedEmailChain: false }],
    };
  }

  const changedEmails = normalized.filter((e) => meta[e]?.type === "changed_email");
  const baseEmails = normalized.filter((e) => meta[e]?.type !== "changed_email");

  // Determine whether all aliases in the group verifiably belong to a single account owner
  let isSingleOwner = false;

  if (baseEmails.length === 1) {
    const singleBase = baseEmails[0];
    const hasConflictingOrAmbiguousOwner = changedEmails.some((c) => {
      const root = resolveRootOwner(c, meta);
      return root !== singleBase;
    });
    isSingleOwner = !hasConflictingOrAmbiguousOwner;
  } else if (baseEmails.length === 0) {
    // When every key is marked changed_email, verify that all aliases resolve to the same root owner
    // and keep/quarantine the bucket if ownership is ambiguous or divergent.
    const roots = changedEmails.map((c) => resolveRootOwner(c, meta));
    const uniqueRoots = new Set(roots);
    isSingleOwner = !uniqueRoots.has(undefined) && uniqueRoots.size === 1;
  }

  if (isSingleOwner) {
    let canonicalEmail: string;
    if (activeUserEmail && normalized.includes(activeUserEmail)) {
      canonicalEmail = activeUserEmail;
    } else if (changedEmails.length > 0) {
      // Pick the latest changed email
      const sorted = [...changedEmails].sort((a, b) => (meta[b]?.updatedAt || 0) - (meta[a]?.updatedAt || 0));
      canonicalEmail = sorted[0];
    } else {
      canonicalEmail = baseEmails[0] || normalized[0];
    }

    const canonicalId = canonicalEmail === "radhika.sharma@example.com"
      ? "usr_demo_radhika"
      : `usr_email_${encodeIdentifierToId(canonicalEmail)}`;

    return {
      isSingleOwner: true,
      clusters: [
        {
          canonicalEmail,
          canonicalId,
          emails: normalized,
          isChangedEmailChain: changedEmails.length > 0,
        },
      ],
    };
  }

  // Multi-owner collision or ambiguous ownership group:
  // Partition into separate clusters by resolved root owner, isolating ambiguous aliases.
  const clustersByRoot = new Map<string, {
    canonicalEmail: string;
    canonicalId: string;
    emails: string[];
    isChangedEmailChain: boolean;
  }>();

  const ambiguousClusters: Array<{
    canonicalEmail: string;
    canonicalId: string;
    emails: string[];
    isChangedEmailChain: boolean;
  }> = [];

  for (const e of normalized) {
    const root = resolveRootOwner(e, meta);
    if (root) {
      const existing = clustersByRoot.get(root);
      if (existing) {
        existing.emails.push(e);
        if (meta[e]?.type === "changed_email") {
          existing.isChangedEmailChain = true;
        }
        if (activeUserEmail && e === activeUserEmail) {
          existing.canonicalEmail = e;
          existing.canonicalId = e === "radhika.sharma@example.com"
            ? "usr_demo_radhika"
            : `usr_email_${encodeIdentifierToId(e)}`;
        } else if (
          (!activeUserEmail || existing.canonicalEmail !== activeUserEmail) &&
          (meta[e]?.updatedAt || 0) >= (meta[existing.canonicalEmail]?.updatedAt || 0)
        ) {
          existing.canonicalEmail = e;
          existing.canonicalId = e === "radhika.sharma@example.com"
            ? "usr_demo_radhika"
            : `usr_email_${encodeIdentifierToId(e)}`;
        }
      } else {
        const canonicalId = e === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(e)}`;
        clustersByRoot.set(root, {
          canonicalEmail: e,
          canonicalId,
          emails: [e],
          isChangedEmailChain: meta[e]?.type === "changed_email",
        });
      }
    } else {
      // Ambiguous / unresolvable alias: isolated to its own cluster
      const canonicalId = e === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(e)}`;
      ambiguousClusters.push({
        canonicalEmail: e,
        canonicalId,
        emails: [e],
        isChangedEmailChain: meta[e]?.type === "changed_email",
      });
    }
  }

  const clusters = [...clustersByRoot.values(), ...ambiguousClusters];

  return {
    isSingleOwner: false,
    clusters,
  };
}

export interface CopyCustomerDataOptions {
  filterByOwnerEmail?: string;
  allowedEmails?: string[];
  verifiedPhones?: string[];
}

/**
 * Safely copies and merges orders and addresses from a source legacy ID to a canonical account ID.
 * Merges and deduplicates records instead of skipping the source when destination records already exist.
 * Verifies writes to localStorage and returns a boolean indicating whether both datasets were verified.
 * When filterByOwnerEmail is specified, accepts records owned through verified prior-email aliases
 * or verified phone numbers, while keeping multi-owner quarantined records strictly isolated.
 */
export function copyCustomerData(
  fromAccountId: string,
  toAccountId: string,
  options?: CopyCustomerDataOptions | string
): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  if (!fromAccountId || !toAccountId) return false;
  if (fromAccountId === toAccountId) return true;
  try {
    const filterEmail = (
      typeof options === "string" ? options : options?.filterByOwnerEmail
    )?.toLowerCase().trim();

    const allowedEmailsInput = (
      typeof options === "object" && options && Array.isArray(options.allowedEmails)
        ? options.allowedEmails
        : []
    );

    const rawPhones = (
      typeof options === "object" && options && Array.isArray(options.verifiedPhones)
        ? options.verifiedPhones
        : []
    );
    const verifiedPhoneList = rawPhones
      .map((p) => normalizeExplicitPhoneToken(p))
      .filter(Boolean) as string[];

    const fromSafe = fromAccountId.toLowerCase().trim().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
    const toSafe = toAccountId.toLowerCase().trim().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);

    const meta = getAccountMetadata();
    const allowedEmailSet = new Set<string>();
    if (filterEmail) {
      allowedEmailSet.add(filterEmail);
      const root = resolveRootOwner(filterEmail, meta);
      if (root) {
        allowedEmailSet.add(root.toLowerCase().trim());
      }
    }
    for (const em of allowedEmailsInput) {
      if (em && em.includes("@")) {
        const norm = em.toLowerCase().trim();
        allowedEmailSet.add(norm);
        const root = resolveRootOwner(norm, meta);
        if (root) {
          allowedEmailSet.add(root.toLowerCase().trim());
        }
      }
    }
    if (filterEmail) {
      const root = resolveRootOwner(filterEmail, meta) || filterEmail;
      for (const [em] of Object.entries(meta)) {
        if (em.includes("@")) {
          const norm = em.toLowerCase().trim();
          const emRoot = resolveRootOwner(norm, meta);
          if (emRoot && (emRoot === root || emRoot === filterEmail)) {
            allowedEmailSet.add(norm);
          }
        }
      }
    }
    const filterRoot = filterEmail ? (resolveRootOwner(filterEmail, meta) || filterEmail).toLowerCase().trim() : undefined;

    const isEmailVerified = (emailCandidate?: string | null): boolean => {
      if (!emailCandidate || typeof emailCandidate !== "string") return false;
      const norm = emailCandidate.toLowerCase().trim();
      if (!norm || !norm.includes("@")) return false;
      if (allowedEmailSet.has(norm)) return true;
      const root = resolveRootOwner(norm, meta);
      if (root) {
        const normRoot = root.toLowerCase().trim();
        if (allowedEmailSet.has(normRoot) || (filterRoot && normRoot === filterRoot)) {
          return true;
        }
      }
      return false;
    };

    const orderSources = Array.from(new Set([
      `palluvo_ecommerce_orders_${fromSafe}`,
      `palluvo_ecommerce_orders_${fromAccountId}`,
      `palluvo_quarantine_palluvo_ecommerce_orders_${fromSafe}`,
      `palluvo_quarantine_palluvo_ecommerce_orders_${fromAccountId}`,
    ]));
    const targetOrdersKey = `palluvo_ecommerce_orders_${toSafe}`;

    const getOrderDedupKey = (ord: Record<string, unknown>): string => {
      if (typeof ord.id === "string" && ord.id.trim()) {
        return `id:${ord.id.trim()}`;
      }
      if (typeof ord.orderNumber === "string" && ord.orderNumber.trim()) {
        return `num:${ord.orderNumber.trim()}`;
      }
      return `json:${JSON.stringify(ord)}`;
    };

    const isOrderVerifiedForOwner = (ord: Record<string, unknown>): boolean => {
      const cust = ord.customer as Record<string, unknown> | undefined;
      const custEmail = typeof cust?.email === "string" ? cust.email.toLowerCase().trim() : "";
      const ordEmail = typeof ord.email === "string" ? ord.email.toLowerCase().trim() : "";

      if (!filterEmail && allowedEmailSet.size === 0 && verifiedPhoneList.length === 0) {
        if (custEmail && ordEmail && custEmail !== ordEmail) {
          const root1 = resolveRootOwner(custEmail, meta) || custEmail;
          const root2 = resolveRootOwner(ordEmail, meta) || ordEmail;
          if (root1.toLowerCase().trim() !== root2.toLowerCase().trim()) {
            return false;
          }
        }
        return true;
      }

      const orderEmails = [custEmail, ordEmail].filter(Boolean);
      if (orderEmails.length > 0) {
        // Require every non-empty owner email to resolve to this account,
        // and fail closed on a conflict.
        return orderEmails.every((e) => isEmailVerified(e));
      }

      // If no email was attached to the order, check if phone matches this owner's verified phone
      if (verifiedPhoneList.length > 0) {
        const explicitTokens = extractExplicitPhoneTokens(ord);
        for (const token of explicitTokens) {
          if (verifiedPhoneList.includes(token)) {
            return true;
          }
        }
      }
      return false;
    };

    let sourceReadSuccess = true;

    // Load existing target orders
    const mergedOrders: Record<string, unknown>[] = [];
    const seenOrderKeys = new Set<string>();

    const targetOrderKeys = Array.from(new Set([
      targetOrdersKey,
      `palluvo_ecommerce_orders_${toAccountId}`,
    ]));

    for (const tk of targetOrderKeys) {
      try {
        const rawTarget = localStorage.getItem(tk);
        if (rawTarget && rawTarget.trim()) {
          const parsed = JSON.parse(rawTarget);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && typeof item === "object") {
                const dedupKey = getOrderDedupKey(item as Record<string, unknown>);
                if (!seenOrderKeys.has(dedupKey)) {
                  seenOrderKeys.add(dedupKey);
                  mergedOrders.push(item as Record<string, unknown>);
                }
              }
            }
          } else {
            sourceReadSuccess = false;
          }
        }
      } catch {
        sourceReadSuccess = false;
      }
    }

    const initialOrderCount = mergedOrders.length;

    for (const src of orderSources) {
      try {
        const val = localStorage.getItem(src);
        if (val === null || val === undefined || val.trim() === "") continue;
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          sourceReadSuccess = false;
          continue;
        }
        if (parsed.length === 0) continue;

        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          const ord = item as Record<string, unknown>;
          if (!isOrderVerifiedForOwner(ord)) continue;

          const dedupKey = getOrderDedupKey(ord);
          if (!seenOrderKeys.has(dedupKey)) {
            seenOrderKeys.add(dedupKey);
            mergedOrders.push(ord);
          }
        }
      } catch {
        sourceReadSuccess = false;
      }
    }

    let ordersWriteSuccess = true;
    if (sourceReadSuccess && (mergedOrders.length > initialOrderCount || (initialOrderCount === 0 && mergedOrders.length > 0))) {
      try {
        const serialized = JSON.stringify(mergedOrders);
        localStorage.setItem(targetOrdersKey, serialized);
        const verified = localStorage.getItem(targetOrdersKey);
        if (verified !== serialized) {
          ordersWriteSuccess = false;
        }
      } catch {
        ordersWriteSuccess = false;
      }
    } else if (!sourceReadSuccess) {
      ordersWriteSuccess = false;
    }

    // Addresses merging
    const addrSources = Array.from(new Set([
      `palluvo_ecommerce_addresses_${fromSafe}`,
      `palluvo_ecommerce_addresses_${fromAccountId}`,
      `palluvo_quarantine_palluvo_ecommerce_addresses_${fromSafe}`,
      `palluvo_quarantine_palluvo_ecommerce_addresses_${fromAccountId}`,
    ]));
    const targetAddrKey = `palluvo_ecommerce_addresses_${toSafe}`;

    const getAddressDedupKey = (addr: Record<string, unknown>): string => {
      if (typeof addr.id === "string" && addr.id.trim()) {
        return `id:${addr.id.trim()}`;
      }
      const rawPhone = addr.phone;
      const phone = typeof rawPhone === "string"
        ? rawPhone.replace(/\D/g, "").slice(-10)
        : typeof rawPhone === "number" && Number.isFinite(rawPhone)
        ? String(rawPhone).replace(/\D/g, "").slice(-10)
        : "";
      const line = typeof addr.addressLine === "string" ? addr.addressLine.trim().toLowerCase() : "";
      const pin = typeof addr.pincode === "string" ? addr.pincode.trim() : "";
      if (line && pin) {
        return `loc:${phone}_${line}_${pin}`;
      }
      return `json:${JSON.stringify(addr)}`;
    };

    const isAddressVerifiedForOwner = (addr: Record<string, unknown>): boolean => {
      const addrEmail = typeof addr.email === "string" ? addr.email.toLowerCase().trim() : "";
      const ownerEmail = typeof addr.ownerEmail === "string" ? addr.ownerEmail.toLowerCase().trim() : "";
      const userEmail = typeof addr.userEmail === "string" ? addr.userEmail.toLowerCase().trim() : "";

      if (!filterEmail && allowedEmailSet.size === 0 && verifiedPhoneList.length === 0) {
        const nonNulls = [addrEmail, ownerEmail, userEmail].filter(Boolean);
        if (nonNulls.length > 1) {
          const firstRoot = (resolveRootOwner(nonNulls[0], meta) || nonNulls[0]).toLowerCase().trim();
          for (let i = 1; i < nonNulls.length; i++) {
            const r = (resolveRootOwner(nonNulls[i], meta) || nonNulls[i]).toLowerCase().trim();
            if (r !== firstRoot) return false;
          }
        }
        return true;
      }

      const addrEmails = [addrEmail, ownerEmail, userEmail].filter(Boolean);
      if (addrEmails.length > 0) {
        // Require every non-empty owner email to resolve to this account,
        // and fail closed on a conflict.
        return addrEmails.every((e) => isEmailVerified(e));
      }

      // If no email was attached to the address, check verified phone
      if (verifiedPhoneList.length > 0) {
        const explicitTokens = extractExplicitPhoneTokens(addr);
        for (const token of explicitTokens) {
          if (verifiedPhoneList.includes(token)) {
            return true;
          }
        }
      }
      return false;
    };

    const mergedAddrs: Record<string, unknown>[] = [];
    const seenAddrKeys = new Set<string>();

    const targetAddrKeys = Array.from(new Set([
      targetAddrKey,
      `palluvo_ecommerce_addresses_${toAccountId}`,
    ]));

    for (const tk of targetAddrKeys) {
      try {
        const rawTarget = localStorage.getItem(tk);
        if (rawTarget && rawTarget.trim()) {
          const parsed = JSON.parse(rawTarget);
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (item && typeof item === "object") {
                const dedupKey = getAddressDedupKey(item as Record<string, unknown>);
                if (!seenAddrKeys.has(dedupKey)) {
                  seenAddrKeys.add(dedupKey);
                  mergedAddrs.push(item as Record<string, unknown>);
                }
              }
            }
          } else {
            sourceReadSuccess = false;
          }
        }
      } catch {
        sourceReadSuccess = false;
      }
    }

    const initialAddrCount = mergedAddrs.length;

    for (const src of addrSources) {
      try {
        const val = localStorage.getItem(src);
        if (val === null || val === undefined || val.trim() === "") continue;
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) {
          sourceReadSuccess = false;
          continue;
        }
        if (parsed.length === 0) continue;

        for (const item of parsed) {
          if (!item || typeof item !== "object") continue;
          const addr = item as Record<string, unknown>;
          if (!isAddressVerifiedForOwner(addr)) continue;

          const dedupKey = getAddressDedupKey(addr);
          if (!seenAddrKeys.has(dedupKey)) {
            seenAddrKeys.add(dedupKey);
            mergedAddrs.push(addr);
          }
        }
      } catch {
        sourceReadSuccess = false;
      }
    }

    let addrsWriteSuccess = true;
    if (sourceReadSuccess && (mergedAddrs.length > initialAddrCount || (initialAddrCount === 0 && mergedAddrs.length > 0))) {
      try {
        const serialized = JSON.stringify(mergedAddrs);
        localStorage.setItem(targetAddrKey, serialized);
        const verified = localStorage.getItem(targetAddrKey);
        if (verified !== serialized) {
          addrsWriteSuccess = false;
        }
      } catch {
        addrsWriteSuccess = false;
      }
    } else if (!sourceReadSuccess) {
      addrsWriteSuccess = false;
    }

    return sourceReadSuccess && ordersWriteSuccess && addrsWriteSuccess;
  } catch {
    return false;
  }
}

/**
 * Removes quarantine and tombstone markers that were mistakenly applied to a single account owner
 * who merely had changed-email aliases.
 */
export function clearFalseQuarantine(accountId: string, canonicalId: string, migrationMeta?: MigrationMeta): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (!accountId) return;
  try {
    const trimmed = accountId.trim();
    const safeId = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);

    localStorage.removeItem(`palluvo_tombstone_${trimmed}`);
    localStorage.removeItem(`palluvo_tombstone_${safeId}`);
    localStorage.removeItem(`palluvo_tombstone_palluvo_ecommerce_orders_${trimmed}`);
    localStorage.removeItem(`palluvo_tombstone_palluvo_ecommerce_orders_${safeId}`);
    localStorage.removeItem(`palluvo_tombstone_palluvo_ecommerce_addresses_${trimmed}`);
    localStorage.removeItem(`palluvo_tombstone_palluvo_ecommerce_addresses_${safeId}`);

    const metaToUpdate = migrationMeta || getMigrationMetadata();
    if (metaToUpdate.quarantinedLegacyBuckets) {
      delete metaToUpdate.quarantinedLegacyBuckets[trimmed];
      delete metaToUpdate.quarantinedLegacyBuckets[safeId];
    }
    if (metaToUpdate.quarantinedCollisionIds) {
      delete metaToUpdate.quarantinedCollisionIds[trimmed];
      delete metaToUpdate.quarantinedCollisionIds[safeId];
    }
    if (metaToUpdate.tombstonedKeys) {
      delete metaToUpdate.tombstonedKeys[`palluvo_ecommerce_orders_${trimmed}`];
      delete metaToUpdate.tombstonedKeys[`palluvo_ecommerce_orders_${safeId}`];
      delete metaToUpdate.tombstonedKeys[`palluvo_ecommerce_addresses_${trimmed}`];
      delete metaToUpdate.tombstonedKeys[`palluvo_ecommerce_addresses_${safeId}`];
    }
    metaToUpdate.rekeyedOwnerIds = metaToUpdate.rekeyedOwnerIds || {};
    metaToUpdate.rekeyedOwnerIds[trimmed] = canonicalId;
    metaToUpdate.rekeyedOwnerIds[safeId] = canonicalId;
    if (!migrationMeta) {
      setMigrationMetadata(metaToUpdate);
    }
  } catch {}
}

/**
 * Migrates existing legacy colliding email aliases in palluvo_account_identity_map
 * to distinct injective IDs.
 * Does not infer a direct identity mapping solely from equality with the lossy legacy encoding.
 * Strictly preserves aliases pointing to an existing immutable account ID (such as when a customer
 * changed their email before or after the migration) using explicit metadata and session signals.
 */
export function migrateLegacyAccountAliases(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    if (!raw) {
      // Identity map is missing. On older or partially migrated browsers, check if there is an
      // active/persisted auth session with a collision-prone legacy usr_email_* ID.
      // When ownership cannot be established from map/metadata, quarantine the legacy namespace
      // and re-key the session to an injective ID rather than hydrating unverified customer data.
      let activeAuthUser: { id?: string; email?: string } | null = null;
      try {
        const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
        if (authRaw) {
          const parsed = JSON.parse(authRaw);
          if (parsed?.isLoggedIn && parsed?.user && typeof parsed.user === "object") {
            activeAuthUser = parsed.user;
          }
        }
      } catch {}

      if (activeAuthUser?.email && activeAuthUser?.id) {
        const lowerEmail = activeAuthUser.email.toLowerCase().trim();
        const expectedInjectiveId = lowerEmail === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(lowerEmail)}`;

        if (activeAuthUser.id.startsWith("usr_email_") && activeAuthUser.id !== expectedInjectiveId) {
          quarantineLegacyBucket(activeAuthUser.id, [lowerEmail]);
          const newMap: Record<string, string> = { [lowerEmail]: expectedInjectiveId };
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(newMap));
          } catch {}
          const migrationMeta = getMigrationMetadata();
          migrationMeta.migratedCollisionIds[activeAuthUser.id] = [lowerEmail];
          setMigrationMetadata(migrationMeta);
          try {
            const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
            if (authRaw) {
              const parsed = JSON.parse(authRaw);
              if (parsed?.user) {
                parsed.user.id = expectedInjectiveId;
                localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
              }
            }
          } catch {}
        }
      }
      return;
    }

    const map = JSON.parse(raw);
    if (!map || typeof map !== "object" || Array.isArray(map)) return;
    let modified = false;

    const meta = getAccountMetadata();
    const migrationMeta = getMigrationMetadata();
    migrationMeta.rekeyedOwnerIds = migrationMeta.rekeyedOwnerIds || {};

    // Check currently active authenticated user session if available
    let activeAuthUser: { id?: string; email?: string; mobile?: string } | null = null;
    try {
      const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        if (parsed?.isLoggedIn && parsed?.user && typeof parsed.user === "object") {
          activeAuthUser = parsed.user;
        }
      }
    } catch {}

    const activeUserEmail = activeAuthUser?.email ? activeAuthUser.email.toLowerCase().trim() : null;
    const activeUserId = activeAuthUser?.id ? activeAuthUser.id.trim() : null;

    // Group all keys by their mapped value
    const keysByVal = new Map<string, Set<string>>();
    for (const [k, v] of Object.entries(map)) {
      if (typeof v === "string" && v.trim().length > 0) {
        const trimmedVal = v.trim();
        const set = keysByVal.get(trimmedVal) || new Set<string>();
        set.add(k.toLowerCase().trim());
        keysByVal.set(trimmedVal, set);
      } else {
        delete map[k];
        delete meta[k.toLowerCase().trim()];
        modified = true;
      }
    }

    for (const [trimmedVal, groupKeys] of keysByVal.entries()) {
      const allKeys = Array.from(groupKeys);
      const emailKeys = allKeys.filter((k) => k.includes("@"));
      const nonEmailKeys = allKeys.filter((k) => !k.includes("@"));

      if (emailKeys.length === 0) {
        // Group contains only non-email keys (e.g. phone numbers)
        if (isQuarantinedAccountId(trimmedVal)) {
          const redirectedId = migrationMeta.rekeyedOwnerIds?.[trimmedVal];
          const quarantinedEmails = migrationMeta.quarantinedLegacyBuckets?.[trimmedVal]?.emails ||
            migrationMeta.quarantinedCollisionIds?.[trimmedVal] || [];

          if (redirectedId && !isQuarantinedAccountId(redirectedId)) {
            const redirectOwnerEmail = lookupEmailByAccountId(redirectedId)?.toLowerCase().trim();

            for (const p of nonEmailKeys) {
              const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
              const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);

              if (resolvedOwner) {
                const isRedirectOwner = Boolean(
                  map[resolvedOwner] === redirectedId ||
                  meta[resolvedOwner]?.accountId === redirectedId ||
                  (redirectOwnerEmail && resolvedOwner === redirectOwnerEmail)
                );

                if (isRedirectOwner) {
                  map[p] = redirectedId;
                  meta[p] = {
                    ...meta[p],
                    accountId: redirectedId,
                    type: "phone",
                    ownerEmail: resolvedOwner,
                    status: "active",
                    updatedAt: Date.now(),
                  };
                  if (meta[resolvedOwner]) {
                    meta[resolvedOwner] = {
                      ...meta[resolvedOwner],
                      phone: p,
                      updatedAt: Date.now(),
                    };
                  }
                  if (migrationMeta.unresolvedPhoneAliases?.[p]) {
                    delete migrationMeta.unresolvedPhoneAliases[p];
                  }
                  modified = true;
                  continue;
                }

                // Explicit owner names a different owner (e.g. Bob, while redirectedId is Alice).
                // Check if that owner can be safely resolved to a usable non-quarantined account.
                const otherOwnerTargetId = map[resolvedOwner] || meta[resolvedOwner]?.accountId;
                if (otherOwnerTargetId && !isQuarantinedAccountId(otherOwnerTargetId) && otherOwnerTargetId !== trimmedVal) {
                  map[p] = otherOwnerTargetId;
                  meta[p] = {
                    ...meta[p],
                    accountId: otherOwnerTargetId,
                    type: "phone",
                    ownerEmail: resolvedOwner,
                    status: "active",
                    updatedAt: Date.now(),
                  };
                  if (meta[resolvedOwner]) {
                    meta[resolvedOwner] = {
                      ...meta[resolvedOwner],
                      phone: p,
                      updatedAt: Date.now(),
                    };
                  }
                  if (migrationMeta.unresolvedPhoneAliases?.[p]) {
                    delete migrationMeta.unresolvedPhoneAliases[p];
                  }
                  modified = true;
                  continue;
                }

                // Explicit owner has no usable map entry: keep unresolved/isolated, do NOT bind to redirectedId!
                const safePhoneId = `usr_phone_${p}`;
                map[p] = safePhoneId;
                meta[p] = {
                  ...meta[p],
                  accountId: safePhoneId,
                  type: "phone",
                  phone: p,
                  ownerEmail: resolvedOwner,
                  status: "unresolved",
                  legacyId: trimmedVal,
                  candidateAccountIds: otherOwnerTargetId && otherOwnerTargetId !== trimmedVal && !isQuarantinedAccountId(otherOwnerTargetId) ? [otherOwnerTargetId] : [],
                  candidateEmails: [resolvedOwner],
                  updatedAt: Date.now(),
                };
                migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
                migrationMeta.unresolvedPhoneAliases[p] = {
                  legacyId: trimmedVal,
                  candidateAccountIds: otherOwnerTargetId && otherOwnerTargetId !== trimmedVal && !isQuarantinedAccountId(otherOwnerTargetId) ? [otherOwnerTargetId] : [],
                  candidateEmails: [resolvedOwner],
                  quarantinedAt: Date.now(),
                };
                modified = true;
                continue;
              }

              if (recordedOwner && !resolvedOwner) {
                // Unresolved changed_email owner: keep phone unresolved/isolated!
                const safePhoneId = `usr_phone_${p}`;
                map[p] = safePhoneId;
                meta[p] = {
                  ...meta[p],
                  accountId: safePhoneId,
                  type: "phone",
                  phone: p,
                  ownerEmail: recordedOwner,
                  status: "unresolved",
                  legacyId: trimmedVal,
                  candidateAccountIds: [],
                  candidateEmails: [recordedOwner],
                  updatedAt: Date.now(),
                };
                migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
                migrationMeta.unresolvedPhoneAliases[p] = {
                  legacyId: trimmedVal,
                  candidateAccountIds: [],
                  candidateEmails: [recordedOwner],
                  quarantinedAt: Date.now(),
                };
                modified = true;
                continue;
              }

              // No explicit recorded owner on phone: check historical records
              let foundEmail: string | undefined;
              if (quarantinedEmails.length > 0) {
                foundEmail = findOwnerEmailForPhoneInRecords(p, quarantinedEmails, trimmedVal) || undefined;
              }

              if (foundEmail) {
                const isFoundRedirectOwner = map[foundEmail] === redirectedId || redirectOwnerEmail === foundEmail;
                if (isFoundRedirectOwner) {
                  map[p] = redirectedId;
                  meta[p] = { ...meta[p], accountId: redirectedId, type: "phone", ownerEmail: foundEmail, status: "active", updatedAt: Date.now() };
                  if (meta[foundEmail]) {
                    meta[foundEmail] = { ...meta[foundEmail], phone: p, updatedAt: Date.now() };
                  }
                  if (migrationMeta.unresolvedPhoneAliases?.[p]) {
                    delete migrationMeta.unresolvedPhoneAliases[p];
                  }
                  modified = true;
                  continue;
                }

                const targetId = map[foundEmail] || meta[foundEmail]?.accountId;
                if (targetId && !isQuarantinedAccountId(targetId) && targetId !== trimmedVal) {
                  map[p] = targetId;
                  meta[p] = { ...meta[p], accountId: targetId, type: "phone", ownerEmail: foundEmail, status: "active", updatedAt: Date.now() };
                  if (meta[foundEmail]) {
                    meta[foundEmail] = { ...meta[foundEmail], phone: p, updatedAt: Date.now() };
                  }
                  if (migrationMeta.unresolvedPhoneAliases?.[p]) {
                    delete migrationMeta.unresolvedPhoneAliases[p];
                  }
                  modified = true;
                  continue;
                }

                // Found owner not active: isolate as unresolved
                const safePhoneId = `usr_phone_${p}`;
                map[p] = safePhoneId;
                meta[p] = {
                  ...meta[p],
                  accountId: safePhoneId,
                  type: "phone",
                  phone: p,
                  ownerEmail: foundEmail,
                  status: "unresolved",
                  legacyId: trimmedVal,
                  candidateAccountIds: targetId && targetId !== trimmedVal && !isQuarantinedAccountId(targetId) ? [targetId] : [],
                  candidateEmails: [foundEmail],
                  updatedAt: Date.now(),
                };
                migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
                migrationMeta.unresolvedPhoneAliases[p] = {
                  legacyId: trimmedVal,
                  candidateAccountIds: targetId && targetId !== trimmedVal && !isQuarantinedAccountId(targetId) ? [targetId] : [],
                  candidateEmails: [foundEmail],
                  quarantinedAt: Date.now(),
                };
                modified = true;
                continue;
              }

              // Ambiguous phone caught in collision without records: do NOT bind to redirectedId
              if (quarantinedEmails.length > 1) {
                const safePhoneId = `usr_phone_${p}`;
                map[p] = safePhoneId;
                meta[p] = {
                  ...meta[p],
                  accountId: safePhoneId,
                  type: "phone",
                  phone: p,
                  status: "unresolved",
                  legacyId: trimmedVal,
                  candidateAccountIds: [redirectedId],
                  candidateEmails: quarantinedEmails,
                  updatedAt: Date.now(),
                };
                migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
                migrationMeta.unresolvedPhoneAliases[p] = {
                  legacyId: trimmedVal,
                  candidateAccountIds: [redirectedId],
                  candidateEmails: quarantinedEmails,
                  quarantinedAt: Date.now(),
                };
                modified = true;
                continue;
              }

              // Only if single legacy owner with no collision history: bind to redirectedId
              map[p] = redirectedId;
              meta[p] = { ...meta[p], accountId: redirectedId, type: "phone", status: "active", updatedAt: Date.now() };
              modified = true;
            }
          } else {
            // For non-email keys pointing to a quarantined ID without an active redirect:
            // Check metadata and historical records before isolating. Do NOT delete!
            for (const p of nonEmailKeys) {
              const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
              const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
              let targetId: string | undefined;

              const checkOwner = resolvedOwner;
              if (checkOwner && map[checkOwner] && !isQuarantinedAccountId(map[checkOwner]) && map[checkOwner] !== trimmedVal) {
                targetId = map[checkOwner];
              }
              if (!targetId && quarantinedEmails.length > 0) {
                const foundEmail = findOwnerEmailForPhoneInRecords(p, quarantinedEmails, trimmedVal);
                if (foundEmail && map[foundEmail] && !isQuarantinedAccountId(map[foundEmail]) && map[foundEmail] !== trimmedVal) {
                  targetId = map[foundEmail];
                }
              }

              if (targetId) {
                map[p] = targetId;
                meta[p] = { ...meta[p], accountId: targetId, type: "phone", ownerEmail: checkOwner || meta[p]?.ownerEmail, status: "active", updatedAt: Date.now() };
                modified = true;
              } else {
                // Isolate to safe non-quarantined ID and keep recoverable with recorded owner preserved
                const safePhoneId = `usr_phone_${p}`;
                map[p] = safePhoneId;
                meta[p] = {
                  ...meta[p],
                  accountId: safePhoneId,
                  type: "phone",
                  phone: p,
                  ownerEmail: meta[p]?.ownerEmail,
                  status: "unresolved",
                  legacyId: trimmedVal,
                  candidateAccountIds: [],
                  candidateEmails: recordedOwner ? [recordedOwner] : quarantinedEmails,
                  updatedAt: Date.now(),
                };
                migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
                migrationMeta.unresolvedPhoneAliases[p] = {
                  legacyId: trimmedVal,
                  candidateAccountIds: [],
                  candidateEmails: recordedOwner ? [recordedOwner] : quarantinedEmails,
                  quarantinedAt: Date.now(),
                };
                modified = true;
              }
            }
          }
        } else if (trimmedVal.startsWith("usr_phone_")) {
          const phoneDigits = trimmedVal.slice("usr_phone_".length);
          if (phoneDigits.length < 10) {
            for (const p of nonEmailKeys) {
              delete map[p];
              delete meta[p];
              modified = true;
            }
          }
        }
        continue;
      }

      if (emailKeys.length === 1) {
        const singleEmail = emailKeys[0];
        const expectedInjectiveId = singleEmail === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(singleEmail)}`;

        const safeVal = trimmedVal.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
        const historicalEmails = Array.from(
          new Set([
            ...(migrationMeta.quarantinedLegacyBuckets?.[trimmedVal]?.emails || []),
            ...(migrationMeta.quarantinedLegacyBuckets?.[safeVal]?.emails || []),
            ...(migrationMeta.quarantinedCollisionIds?.[trimmedVal] || []),
            ...(migrationMeta.quarantinedCollisionIds?.[safeVal] || []),
            ...(migrationMeta.migratedCollisionIds?.[trimmedVal] || []),
            ...(migrationMeta.migratedCollisionIds?.[safeVal] || []),
          ])
        );
        const allCandidateEmails = Array.from(new Set([...historicalEmails, singleEmail]));
        const hasCollisionHistory = historicalEmails.some((e) => e !== singleEmail);

        if (isQuarantinedAccountId(trimmedVal)) {
          // Both collision-history and no-collision-history branches must filter by verified owner:
          // do NOT copy wholesale into expectedInjectiveId, as shared legacy buckets may contain foreign records.
          const verifiedPhones: string[] = [];
          const singleEmailRoot = (resolveRootOwner(singleEmail, meta) || singleEmail).toLowerCase().trim();
          if (meta[singleEmail]?.phone) {
            const revPhone = normalizeExplicitPhoneToken(meta[singleEmail].phone);
            if (revPhone) {
              const revRecordedOwner = meta[revPhone]?.ownerEmail?.toLowerCase().trim();
              const revResolvedOwner = revRecordedOwner ? getVerifiedRootOwner(revRecordedOwner, meta) : undefined;
              const revResolvedRoot = revResolvedOwner ? (resolveRootOwner(revResolvedOwner, meta) || revResolvedOwner).toLowerCase().trim() : undefined;

              const hasUnresolvedExplicitOwner = Boolean(revRecordedOwner && !revResolvedOwner);
              const hasConflictingExplicitOwner = Boolean(revResolvedOwner && revResolvedRoot !== singleEmailRoot);
              const isExplicitlyUnresolved = Boolean(
                (meta[revPhone]?.status === "unresolved" || migrationMeta.unresolvedPhoneAliases?.[revPhone]) &&
                revResolvedRoot !== singleEmailRoot
              );
              const hasConflictingReverseEmail = Object.entries(meta).some(([em, emMeta]) => {
                if (!em.includes("@")) return false;
                const normEm = em.toLowerCase().trim();
                const emRoot = (resolveRootOwner(normEm, meta) || normEm).toLowerCase().trim();
                if (emRoot === singleEmailRoot) return false;
                return normalizeExplicitPhoneToken(emMeta?.phone) === revPhone;
              });

              const resolvesToSameOwner = Boolean(
                revResolvedRoot === singleEmailRoot ||
                (!revRecordedOwner && meta[revPhone]?.status !== "unresolved" && !migrationMeta.unresolvedPhoneAliases?.[revPhone])
              );

              if (
                !hasUnresolvedExplicitOwner &&
                !hasConflictingExplicitOwner &&
                !isExplicitlyUnresolved &&
                !hasConflictingReverseEmail &&
                resolvesToSameOwner
              ) {
                verifiedPhones.push(revPhone);
              }
            }
          }
          for (const p of nonEmailKeys) {
            const normP = normalizeExplicitPhoneToken(p);
            if (!normP) continue;
            const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
            const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
            const resolvedRoot = resolvedOwner ? (resolveRootOwner(resolvedOwner, meta) || resolvedOwner).toLowerCase().trim() : undefined;
            if (resolvedRoot && resolvedRoot === singleEmailRoot) {
              if (!verifiedPhones.includes(normP)) {
                verifiedPhones.push(normP);
              }
            }
          }

          // Collect all verified alias emails in this account owner chain
          const verifiedAliasEmails = new Set<string>();
          verifiedAliasEmails.add(singleEmail);
          const rootOfSingle = resolveRootOwner(singleEmail, meta);
          if (rootOfSingle) verifiedAliasEmails.add(rootOfSingle.toLowerCase().trim());
          for (const [em] of Object.entries(meta)) {
            if (em.includes("@")) {
              const norm = em.toLowerCase().trim();
              const emRoot = resolveRootOwner(norm, meta);
              if (emRoot && (emRoot === rootOfSingle || emRoot === singleEmail)) {
                verifiedAliasEmails.add(norm);
              }
            }
          }

          const copySuccess = copyCustomerData(trimmedVal, expectedInjectiveId, {
            filterByOwnerEmail: singleEmail,
            allowedEmails: Array.from(verifiedAliasEmails),
            verifiedPhones,
          });

          if (!copySuccess) {
            // Write verification failed for destination datasets (e.g. storage quota/security error).
            // Do NOT commit the rekey! Leave the mapping unchanged and mark the migration retryable.
            migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
            migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`] = true;
            setMigrationMetadata(migrationMeta);
            continue;
          }

          if (migrationMeta.failedQuarantineKeys?.[`retry_migration_${trimmedVal}`]) {
            delete migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`];
          }

          map[singleEmail] = expectedInjectiveId;
          meta[singleEmail] = {
            accountId: expectedInjectiveId,
            type: meta[singleEmail]?.type || "primary",
            phone: meta[singleEmail]?.phone,
            updatedAt: Date.now(),
          };

          if (!hasCollisionHistory) {
            // Single-owner legacy bucket without collision history: record rekey
            migrationMeta.rekeyedOwnerIds[trimmedVal] = expectedInjectiveId;
          }

          migrationMeta.migratedCollisionIds[trimmedVal] = Array.from(
            new Set([...(migrationMeta.migratedCollisionIds[trimmedVal] || []), singleEmail])
          );
          modified = true;

          if (activeUserId === trimmedVal && activeUserEmail === singleEmail) {
            try {
              const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
              if (authRaw) {
                const parsed = JSON.parse(authRaw);
                if (parsed?.user) {
                  parsed.user.id = expectedInjectiveId;
                  localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
                }
              }
            } catch {}
          }
        }

        const targetAccountIdForSingleEmail = isQuarantinedAccountId(trimmedVal)
          ? expectedInjectiveId
          : (map[singleEmail] || trimmedVal);

        // Validate phone alias ownership rather than unconditionally re-binding to singleEmail
        for (const p of nonEmailKeys) {
          if (trimmedVal.startsWith("usr_phone_")) {
            const digits = trimmedVal.slice("usr_phone_".length);
            if (digits.length < 10) {
              delete map[p];
              delete meta[p];
              modified = true;
              continue;
            }
          }

          // 1. Explicit owner metadata on phone alias
          const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);

          // If phone alias has an explicit recorded owner that cannot be resolved (unresolved changed_email),
          // it must NOT be claimed by reverse phone metadata or record scanning. It must stay quarantined/unresolved.
          if (recordedOwner && !resolvedOwner) {
            const isolatedId = `usr_phone_${p}`;
            map[p] = isolatedId;
            meta[p] = {
              ...meta[p],
              accountId: isolatedId,
              type: "phone",
              phone: p,
              ownerEmail: recordedOwner,
              status: "unresolved",
              legacyId: trimmedVal,
              candidateAccountIds: [],
              candidateEmails: [recordedOwner],
              updatedAt: Date.now(),
            };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[p] = {
              legacyId: trimmedVal,
              candidateAccountIds: [],
              candidateEmails: [recordedOwner],
              quarantinedAt: Date.now(),
            };
            modified = true;
            continue;
          }

          // 2. Reverse phone metadata on emails
          // Only trust reverse phone metadata when explicit owner is not unresolved and has no conflict.
          // Reject conflicting reverse claims across distinct accounts:
          // Collect all claiming emails and accept ONLY if all resolve to a single verified root owner.
          let reverseEmail: string | undefined;
          let hasContestedReverseClaims = false;
          const claimingEmails = new Set<string>();

          if (!resolvedOwner) {
            const normP = normalizeExplicitPhoneToken(p) || p;

            if (meta[singleEmail]?.phone) {
              const rawRev = meta[singleEmail].phone;
              if (rawRev === p || normalizeExplicitPhoneToken(rawRev) === normP) {
                claimingEmails.add(singleEmail.toLowerCase().trim());
              }
            }
            for (const cand of allCandidateEmails) {
              const rawRev = meta[cand]?.phone;
              if (rawRev && (rawRev === p || normalizeExplicitPhoneToken(rawRev) === normP)) {
                claimingEmails.add(cand.toLowerCase().trim());
              }
            }
            for (const [em, emMeta] of Object.entries(meta)) {
              if (em.includes("@")) {
                const rawRev = emMeta?.phone;
                if (rawRev && (rawRev === p || normalizeExplicitPhoneToken(rawRev) === normP)) {
                  claimingEmails.add(em.toLowerCase().trim());
                }
              }
            }

            if (claimingEmails.size > 0) {
              const resolvedOwners = new Set<string>();
              let hasUnresolvedClaims = false;

              for (const em of claimingEmails) {
                const root = getVerifiedRootOwner(em, meta);
                if (!root) {
                  hasUnresolvedClaims = true;
                } else {
                  resolvedOwners.add(root);
                }
              }

              // Reject unresolved claims before treating the set as a single owner!
              // Only accept when no claim failed resolution AND all resolve to a single verified root owner.
              if (!hasUnresolvedClaims && resolvedOwners.size === 1) {
                reverseEmail = Array.from(resolvedOwners)[0];
              } else {
                hasContestedReverseClaims = true;
              }
            }
          }

          // 3. Historical order/address records
          const recordEmail = (!resolvedOwner && !reverseEmail && !hasContestedReverseClaims)
            ? findOwnerEmailForPhoneInRecords(p, allCandidateEmails, trimmedVal)
            : undefined;

          // 4. Active authenticated session
          let activeSessionEmail: string | undefined;
          if (!resolvedOwner && !reverseEmail && !recordEmail && !hasContestedReverseClaims && activeAuthUser?.mobile) {
            const rawDigits = activeAuthUser.mobile.replace(/\D/g, "");
            const tenDigits = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
            if (tenDigits === p && activeUserEmail) {
              activeSessionEmail = activeUserEmail;
            }
          }

          const identifiedOwner = resolvedOwner || reverseEmail || recordEmail || activeSessionEmail;

          if (identifiedOwner) {
            const isOwnerSingleEmail =
              identifiedOwner === singleEmail || resolveRootOwner(identifiedOwner, meta) === singleEmail;

            if (isOwnerSingleEmail) {
              map[p] = targetAccountIdForSingleEmail;
              meta[p] = {
                ...meta[p],
                accountId: targetAccountIdForSingleEmail,
                type: "phone",
                ownerEmail: singleEmail,
                phone: p,
                status: "active",
                updatedAt: Date.now(),
              };
              if (meta[singleEmail]) {
                meta[singleEmail] = {
                  ...meta[singleEmail],
                  phone: p,
                  updatedAt: Date.now(),
                };
              }
              if (migrationMeta.unresolvedPhoneAliases?.[p]) {
                delete migrationMeta.unresolvedPhoneAliases[p];
              }
              modified = true;
            } else {
              // Explicit owner does NOT match singleEmail (e.g. phone caught in legacy collision while email moved).
              // Do NOT overwrite meta[p].ownerEmail or rebind to singleEmail!
              const otherOwnerTargetId = map[identifiedOwner] || meta[identifiedOwner]?.accountId;
              if (otherOwnerTargetId && !isQuarantinedAccountId(otherOwnerTargetId)) {
                map[p] = otherOwnerTargetId;
                meta[p] = {
                  ...meta[p],
                  accountId: otherOwnerTargetId,
                  type: "phone",
                  ownerEmail: identifiedOwner,
                  phone: p,
                  status: "active",
                  updatedAt: Date.now(),
                };
                if (meta[identifiedOwner]) {
                  meta[identifiedOwner] = {
                    ...meta[identifiedOwner],
                    phone: p,
                    updatedAt: Date.now(),
                  };
                }
                if (migrationMeta.unresolvedPhoneAliases?.[p]) {
                  delete migrationMeta.unresolvedPhoneAliases[p];
                }
                modified = true;
              } else {
                // Keep unresolved or isolated with recorded owner preserved
                const isolatedId = `usr_phone_${p}`;
                map[p] = isolatedId;
                meta[p] = {
                  ...meta[p],
                  accountId: isolatedId,
                  type: "phone",
                  phone: p,
                  ownerEmail: identifiedOwner,
                  status: "unresolved",
                  legacyId: trimmedVal,
                  candidateAccountIds: otherOwnerTargetId ? [otherOwnerTargetId] : [],
                  candidateEmails: [identifiedOwner],
                  updatedAt: Date.now(),
                };
                migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
                migrationMeta.unresolvedPhoneAliases[p] = {
                  legacyId: trimmedVal,
                  candidateAccountIds: otherOwnerTargetId ? [otherOwnerTargetId] : [],
                  candidateEmails: [identifiedOwner],
                  quarantinedAt: Date.now(),
                };
                modified = true;
              }
            }
          } else {
            // No affirmative ownership evidence from explicit metadata, verified reverse phone, historical records, or active session.
            // Do NOT infer ownership from single-phone cardinality! Keep unresolved and quarantined.
            const isolatedId = `usr_phone_${p}`;
            map[p] = isolatedId;

            const allCandEmails = Array.from(new Set([...allCandidateEmails, ...claimingEmails]));
            const candAccIds = new Set<string>([targetAccountIdForSingleEmail].filter(Boolean));
            for (const em of claimingEmails) {
              const root = getVerifiedRootOwner(em, meta) || em;
              const mappedId = map[root] || meta[root]?.accountId || map[em] || meta[em]?.accountId;
              if (mappedId && !isQuarantinedAccountId(mappedId)) {
                candAccIds.add(mappedId);
              } else if (root.includes("@")) {
                const defaultId = root === "radhika.sharma@example.com"
                  ? "usr_demo_radhika"
                  : `usr_email_${encodeIdentifierToId(root)}`;
                candAccIds.add(defaultId);
              }
            }
            if (meta[p]?.ownerEmail) {
              const oEmail = meta[p].ownerEmail!.toLowerCase().trim();
              const root = getVerifiedRootOwner(oEmail, meta) || oEmail;
              const mappedId = map[root] || meta[root]?.accountId || map[oEmail] || meta[oEmail]?.accountId;
              if (mappedId && !isQuarantinedAccountId(mappedId)) {
                candAccIds.add(mappedId);
              } else if (root.includes("@")) {
                const defaultId = root === "radhika.sharma@example.com"
                  ? "usr_demo_radhika"
                  : `usr_email_${encodeIdentifierToId(root)}`;
                candAccIds.add(defaultId);
              }
            }
            const candidateAccountIds = Array.from(candAccIds);

            meta[p] = {
              ...meta[p],
              accountId: isolatedId,
              type: "phone",
              phone: p,
              ownerEmail: meta[p]?.ownerEmail,
              status: "unresolved",
              legacyId: trimmedVal,
              candidateAccountIds,
              candidateEmails: allCandEmails,
              updatedAt: Date.now(),
            };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[p] = {
              legacyId: trimmedVal,
              candidateAccountIds,
              candidateEmails: allCandEmails,
              quarantinedAt: Date.now(),
            };
            modified = true;
          }
        }
        continue;
      }

      // emailKeys.length > 1: Analyze ownership partition
      const partition = partitionEmailsByAccountOwner(emailKeys, meta, activeUserEmail);

      if (partition.isSingleOwner) {
        // Single customer who changed their email!
        // Filter the legacy copy by the resolved owner, and quarantine records if other explicit owners exist.
        const ownerCluster = partition.clusters[0];
        const canonicalId = ownerCluster.canonicalId;

        const singleOwnerPhones: string[] = [];
        for (const em of ownerCluster.emails) {
          if (meta[em]?.phone) {
            const p = normalizeExplicitPhoneToken(meta[em].phone);
            if (p && !singleOwnerPhones.includes(p)) {
              const recOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
              const resOwner = recOwner ? getVerifiedRootOwner(recOwner, meta) : undefined;
              const hasConflictingReverse = Object.entries(meta).some(([otherEm, otherMeta]) => {
                if (!otherEm.includes("@")) return false;
                const normEm = otherEm.toLowerCase().trim();
                if (ownerCluster.emails.includes(normEm)) return false;
                return normalizeExplicitPhoneToken(otherMeta?.phone) === p;
              });
              if (!hasConflictingReverse && (!recOwner || (resOwner && ownerCluster.emails.includes(resOwner)))) {
                singleOwnerPhones.push(p);
              }
            }
          }
        }
        for (const p of nonEmailKeys) {
          const normP = normalizeExplicitPhoneToken(p);
          if (!normP) continue;
          const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
          const belongsToCluster = Boolean(
            !recordedOwner ||
            (resolvedOwner && ownerCluster.emails.includes(resolvedOwner)) ||
            (resolvedOwner && resolvedOwner === ownerCluster.canonicalEmail)
          );
          if (belongsToCluster && !singleOwnerPhones.includes(normP)) {
            singleOwnerPhones.push(normP);
          }
        }

        const singleOwnerAllowedEmails = new Set<string>(ownerCluster.emails);
        for (const em of ownerCluster.emails) {
          const root = resolveRootOwner(em, meta);
          if (root) singleOwnerAllowedEmails.add(root.toLowerCase().trim());
        }
        for (const [em] of Object.entries(meta)) {
          if (em.includes("@")) {
            const norm = em.toLowerCase().trim();
            const root = resolveRootOwner(norm, meta);
            if (root && (singleOwnerAllowedEmails.has(root) || ownerCluster.emails.includes(root))) {
              singleOwnerAllowedEmails.add(norm);
            }
          }
        }

        const copySuccess = copyCustomerData(trimmedVal, canonicalId, {
          filterByOwnerEmail: ownerCluster.canonicalEmail,
          allowedEmails: Array.from(singleOwnerAllowedEmails),
          verifiedPhones: singleOwnerPhones,
        });

        if (!copySuccess) {
          migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
          migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`] = true;
          setMigrationMetadata(migrationMeta);
          continue;
        }

        if (migrationMeta.failedQuarantineKeys?.[`retry_migration_${trimmedVal}`]) {
          delete migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`];
        }

        // Check if the legacy bucket still contains records belonging to a different explicit owner
        const hasRecordsFromDifferentOwner = (() => {
          try {
            const safeVal = trimmedVal.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
            const sources = [
              `palluvo_ecommerce_orders_${safeVal}`,
              `palluvo_ecommerce_orders_${trimmedVal}`,
              `palluvo_quarantine_palluvo_ecommerce_orders_${safeVal}`,
              `palluvo_quarantine_palluvo_ecommerce_orders_${trimmedVal}`,
              `palluvo_ecommerce_addresses_${safeVal}`,
              `palluvo_ecommerce_addresses_${trimmedVal}`,
              `palluvo_quarantine_palluvo_ecommerce_addresses_${safeVal}`,
              `palluvo_quarantine_palluvo_ecommerce_addresses_${trimmedVal}`,
            ];
            for (const src of sources) {
              const raw = localStorage.getItem(src);
              if (!raw) continue;
              const parsed = JSON.parse(raw);
              if (!Array.isArray(parsed)) continue;
              for (const item of parsed) {
                if (!item || typeof item !== "object") continue;
                const rec = item as Record<string, unknown>;
                const cust = rec.customer as Record<string, unknown> | undefined;
                const ems = [
                  typeof cust?.email === "string" ? cust.email.toLowerCase().trim() : "",
                  typeof rec.email === "string" ? rec.email.toLowerCase().trim() : "",
                  typeof rec.ownerEmail === "string" ? rec.ownerEmail.toLowerCase().trim() : "",
                  typeof rec.userEmail === "string" ? rec.userEmail.toLowerCase().trim() : "",
                ].filter(Boolean);
                for (const em of ems) {
                  const root = (resolveRootOwner(em, meta) || em).toLowerCase().trim();
                  if (!singleOwnerAllowedEmails.has(em) && !singleOwnerAllowedEmails.has(root)) {
                    return true;
                  }
                }
              }
            }
          } catch {}
          return false;
        })();

        if (hasRecordsFromDifferentOwner) {
          // Shared legacy bucket still contains records from another explicit owner:
          // Keep the legacy bucket quarantined so records with a different owner remain isolated!
          quarantineLegacyBucket(trimmedVal);
          migrationMeta.quarantinedLegacyBuckets = migrationMeta.quarantinedLegacyBuckets || {};
          migrationMeta.quarantinedLegacyBuckets[trimmedVal] = {
            quarantinedAt: Date.now(),
            emails: ownerCluster.emails,
          };
          migrationMeta.quarantinedCollisionIds = migrationMeta.quarantinedCollisionIds || {};
          migrationMeta.quarantinedCollisionIds[trimmedVal] = ownerCluster.emails;
        } else {
          clearFalseQuarantine(trimmedVal, canonicalId, migrationMeta);
        }

        for (const e of emailKeys) {
          map[e] = canonicalId;
          meta[e] = {
            ...meta[e],
            accountId: canonicalId,
            type: meta[e]?.type || "primary",
            updatedAt: Date.now(),
          };
          modified = true;
        }

        for (const p of nonEmailKeys) {
          const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
          const belongsToCluster = Boolean(
            !recordedOwner ||
            (resolvedOwner && ownerCluster.emails.includes(resolvedOwner)) ||
            (resolvedOwner && resolvedOwner === ownerCluster.canonicalEmail)
          );

          if (!belongsToCluster) {
            const isolatedId = `usr_phone_${p}`;
            map[p] = isolatedId;

            const candEmails = Array.from(new Set([
              ...ownerCluster.emails,
              ...(recordedOwner ? [recordedOwner] : []),
              ...(resolvedOwner ? [resolvedOwner] : []),
            ]));

            const candAccIds = new Set<string>([canonicalId]);
            if (resolvedOwner) {
              const otherTarget = map[resolvedOwner] || meta[resolvedOwner]?.accountId;
              if (otherTarget && !isQuarantinedAccountId(otherTarget)) {
                candAccIds.add(otherTarget);
              } else if (resolvedOwner.includes("@")) {
                candAccIds.add(resolvedOwner === "radhika.sharma@example.com" ? "usr_demo_radhika" : `usr_email_${encodeIdentifierToId(resolvedOwner)}`);
              }
            }
            if (recordedOwner) {
              const otherTarget = map[recordedOwner] || meta[recordedOwner]?.accountId;
              if (otherTarget && !isQuarantinedAccountId(otherTarget)) {
                candAccIds.add(otherTarget);
              } else if (recordedOwner.includes("@")) {
                candAccIds.add(recordedOwner === "radhika.sharma@example.com" ? "usr_demo_radhika" : `usr_email_${encodeIdentifierToId(recordedOwner)}`);
              }
            }
            const candidateAccountIds = Array.from(candAccIds);

            meta[p] = {
              ...meta[p],
              accountId: isolatedId,
              type: "phone",
              phone: p,
              ownerEmail: recordedOwner,
              status: "unresolved",
              legacyId: trimmedVal,
              candidateAccountIds,
              candidateEmails: candEmails,
              updatedAt: Date.now(),
            };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[p] = {
              legacyId: trimmedVal,
              candidateAccountIds,
              candidateEmails: candEmails,
              quarantinedAt: Date.now(),
            };
            modified = true;
            continue;
          }

          map[p] = canonicalId;
          meta[p] = {
            ...meta[p],
            accountId: canonicalId,
            type: "phone",
            ownerEmail: ownerCluster.canonicalEmail,
            phone: p,
            status: "active",
            updatedAt: Date.now(),
          };
          if (meta[ownerCluster.canonicalEmail]) {
            meta[ownerCluster.canonicalEmail] = {
              ...meta[ownerCluster.canonicalEmail],
              phone: p,
              updatedAt: Date.now(),
            };
          }
          if (migrationMeta.unresolvedPhoneAliases?.[p]) {
            delete migrationMeta.unresolvedPhoneAliases[p];
          }
          modified = true;
        }

        migrationMeta.rekeyedOwnerIds[trimmedVal] = canonicalId;

        if (activeUserId === trimmedVal || (activeUserEmail && emailKeys.includes(activeUserEmail))) {
          try {
            const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
            if (authRaw) {
              const parsed = JSON.parse(authRaw);
              if (parsed?.user) {
                parsed.user.id = canonicalId;
                localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
              }
            }
          } catch {}
        }
      } else {
        // Multi-owner collision: multiple distinct account owners mapped to same ID
        if (!migrationMeta.quarantinedLegacyBuckets?.[trimmedVal]) {
          quarantineLegacyBucket(trimmedVal, emailKeys);
          migrationMeta.quarantinedLegacyBuckets[trimmedVal] = {
            quarantinedAt: Date.now(),
            emails: emailKeys,
          };
          migrationMeta.quarantinedCollisionIds[trimmedVal] = emailKeys;
          modified = true;
        }

        for (const cluster of partition.clusters) {
          for (const e of cluster.emails) {
            map[e] = cluster.canonicalId;
            meta[e] = {
              ...meta[e],
              accountId: cluster.canonicalId,
              type: meta[e]?.type || "primary",
              updatedAt: Date.now(),
            };
            modified = true;
          }
        }

        // Migrate non-email aliases (phones) using affirmative owner evidence
        const matchedClusterByPhone = new Map<string, typeof partition.clusters[0]>();
        const claimingEmailsByPhone = new Map<string, string[]>();

        // Pass 1: Direct metadata on phone, reverse metadata on emails, record scanning, active session
        for (const p of nonEmailKeys) {
          // 1. Direct metadata on phone
          const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
          const hasUnresolvedExplicitOwner = Boolean(recordedOwner && !resolvedOwner);

          let matchedCluster = resolvedOwner
            ? partition.clusters.find((cl) => cl.emails.includes(resolvedOwner) || cl.canonicalEmail === resolvedOwner)
            : undefined;

          let hasContestedReverseClaims = false;
          const claimingEmails = new Set<string>();

          // 2. Reverse phone metadata on emails
          // Do NOT trust reverse phone metadata if explicit owner is unresolved or conflicting!
          // Reject conflicting reverse-phone claims before assigning an owner:
          // Collect all claiming emails across accounts and accept only a single verified root owner cluster;
          // otherwise keep the phone unassigned so it remains quarantined.
          if (!matchedCluster && !hasUnresolvedExplicitOwner && !resolvedOwner) {
            const normP = normalizeExplicitPhoneToken(p) || p;

            for (const e of emailKeys) {
              const rawPhone = meta[e]?.phone;
              if (rawPhone && (rawPhone === p || normalizeExplicitPhoneToken(rawPhone) === normP)) {
                claimingEmails.add(e.toLowerCase().trim());
              }
            }
            for (const [em, emMeta] of Object.entries(meta)) {
              if (em.includes("@")) {
                const rawPhone = emMeta?.phone;
                if (rawPhone && (rawPhone === p || normalizeExplicitPhoneToken(rawPhone) === normP)) {
                  claimingEmails.add(em.toLowerCase().trim());
                }
              }
            }

            if (claimingEmails.size > 0) {
              claimingEmailsByPhone.set(p, Array.from(claimingEmails));
              const resolvedOwners = new Set<string>();
              const matchedClusters = new Set<typeof partition.clusters[0]>();
              let hasUnresolvedClaims = false;
              let hasExternalConflict = false;

              for (const em of claimingEmails) {
                const root = getVerifiedRootOwner(em, meta);
                if (!root) {
                  hasUnresolvedClaims = true;
                  continue;
                }
                resolvedOwners.add(root);
                const cl = partition.clusters.find((c) => c.emails.includes(root) || c.canonicalEmail === root);
                if (cl) {
                  matchedClusters.add(cl);
                } else {
                  hasExternalConflict = true;
                }
              }

              // Reject unresolved claims before treating the set as a single owner/cluster!
              if (!hasUnresolvedClaims && !hasExternalConflict && resolvedOwners.size === 1 && matchedClusters.size === 1) {
                matchedCluster = Array.from(matchedClusters)[0];
              } else {
                // Hard ambiguity: reverse metadata resolves to multiple roots, unresolved claims, or external clusters.
                // Mark as contested so subsequent historical-record and session inference are bypassed!
                hasContestedReverseClaims = true;
              }
            }
          }

          // 3. Historical order/address records scanning
          if (!matchedCluster && !hasUnresolvedExplicitOwner && !resolvedOwner && !hasContestedReverseClaims) {
            const recordEmail = findOwnerEmailForPhoneInRecords(p, emailKeys, trimmedVal);
            if (recordEmail) {
              matchedCluster = partition.clusters.find((cl) => cl.emails.includes(recordEmail) || cl.canonicalEmail === recordEmail);
            }
          }

          // 4. Active authenticated session
          if (!matchedCluster && !hasUnresolvedExplicitOwner && !resolvedOwner && !hasContestedReverseClaims && activeAuthUser?.mobile) {
            const rawDigits = activeAuthUser.mobile.replace(/\D/g, "");
            const tenDigits = rawDigits.length >= 10 ? rawDigits.slice(-10) : rawDigits;
            if (tenDigits === p && activeUserEmail) {
              matchedCluster = partition.clusters.find((cl) => cl.emails.includes(activeUserEmail));
            }
          }

          if (matchedCluster) {
            matchedClusterByPhone.set(p, matchedCluster);
          }
        }

        // Pass 2: Apply migrations for verified phones, and quarantine aliases lacking affirmative ownership evidence
        for (const p of nonEmailKeys) {
          const matchedCluster = matchedClusterByPhone.get(p);
          if (matchedCluster) {
            map[p] = matchedCluster.canonicalId;
            meta[p] = {
              ...meta[p],
              accountId: matchedCluster.canonicalId,
              type: "phone",
              ownerEmail: matchedCluster.canonicalEmail,
              phone: p,
              status: "active",
              updatedAt: Date.now(),
            };
            if (meta[matchedCluster.canonicalEmail]) {
              meta[matchedCluster.canonicalEmail] = {
                ...meta[matchedCluster.canonicalEmail],
                phone: p,
                updatedAt: Date.now(),
              };
            }
            if (migrationMeta.unresolvedPhoneAliases?.[p]) {
              delete migrationMeta.unresolvedPhoneAliases[p];
            }
            modified = true;
          } else {
            // Cannot attribute phone cleanly in multi-owner collision.
            // DO NOT silently discard or delete! Keep recoverable and isolate from ambiguous legacy bucket.
            const isolatedId = `usr_phone_${p}`;
            map[p] = isolatedId;

            const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
            const claimantEmails = claimingEmailsByPhone.get(p) || [];
            const allCandidateEmails = Array.from(
              new Set([
                ...partition.clusters.flatMap((c) => c.emails),
                ...claimantEmails,
                ...(recordedOwner ? [recordedOwner] : []),
              ])
            );

            const candAccountIds = new Set<string>(partition.clusters.map((c) => c.canonicalId));
            for (const em of claimantEmails) {
              const root = getVerifiedRootOwner(em, meta) || em;
              const mappedId = map[root] || meta[root]?.accountId || map[em] || meta[em]?.accountId;
              if (mappedId && !isQuarantinedAccountId(mappedId)) {
                candAccountIds.add(mappedId);
              } else if (root.includes("@")) {
                const defaultId = root === "radhika.sharma@example.com"
                  ? "usr_demo_radhika"
                  : `usr_email_${encodeIdentifierToId(root)}`;
                candAccountIds.add(defaultId);
              }
            }
            if (recordedOwner) {
              const root = getVerifiedRootOwner(recordedOwner, meta) || recordedOwner;
              const mappedId = map[root] || meta[root]?.accountId || map[recordedOwner] || meta[recordedOwner]?.accountId;
              if (mappedId && !isQuarantinedAccountId(mappedId)) {
                candAccountIds.add(mappedId);
              } else if (root.includes("@")) {
                const defaultId = root === "radhika.sharma@example.com"
                  ? "usr_demo_radhika"
                  : `usr_email_${encodeIdentifierToId(root)}`;
                candAccountIds.add(defaultId);
              }
            }

            const candidateAccountIds = Array.from(candAccountIds);

            meta[p] = {
              ...meta[p],
              accountId: isolatedId,
              type: "phone",
              phone: p,
              ownerEmail: meta[p]?.ownerEmail,
              status: "unresolved",
              legacyId: trimmedVal,
              candidateAccountIds,
              candidateEmails: allCandidateEmails,
              updatedAt: Date.now(),
            };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[p] = {
              legacyId: trimmedVal,
              candidateAccountIds,
              candidateEmails: allCandidateEmails,
              quarantinedAt: Date.now(),
            };
            modified = true;
          }
        }

        // Record active owner redirect if identifiable
        if (activeUserEmail) {
          const activeCluster = partition.clusters.find((cl) => cl.emails.includes(activeUserEmail));
          if (activeCluster) {
            migrationMeta.rekeyedOwnerIds[trimmedVal] = activeCluster.canonicalId;
          }
        }

        migrationMeta.migratedCollisionIds[trimmedVal] = Array.from(
          new Set([...(migrationMeta.migratedCollisionIds[trimmedVal] || []), ...emailKeys])
        );

        if (activeUserId === trimmedVal && activeUserEmail) {
          const activeCluster = partition.clusters.find((cl) => cl.emails.includes(activeUserEmail));
          if (activeCluster) {
            try {
              const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
              if (authRaw) {
                const parsed = JSON.parse(authRaw);
                if (parsed?.user) {
                  parsed.user.id = activeCluster.canonicalId;
                  localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
                }
              }
            } catch {}
          }
        }
      }
    }

    if (modified) {
      localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
      setMigrationMetadata(migrationMeta);
    }
    setAccountMetadata(meta);
  } catch {}
}

/**
 * Returns a known immutable account ID mapped to an identifier (email or phone digits), if any.
 * Preserves aliases pointing to an existing immutable account ID and only remaps confirmed collision records.
 * Consistently redirects or rejects tombstoned IDs across all identifier types.
 */
export function lookupAccountId(identifier?: string | null): string | null {
  if (!identifier || typeof identifier !== "string") return null;
  const key = identifier.toLowerCase().trim();
  if (!key) return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    if (!map || typeof map !== "object" || typeof map[key] !== "string" || !map[key].trim()) {
      return null;
    }
    const val = map[key].trim();
    const meta = getAccountMetadata();
    const migrationMeta = getMigrationMetadata();

    // 1. Check whether val represents a quarantined/tombstoned ID for ANY identifier type
    if (isQuarantinedAccountId(val)) {
      const redirectedId = migrationMeta.rekeyedOwnerIds?.[val];
      const quarantinedEmails = migrationMeta.quarantinedLegacyBuckets?.[val]?.emails ||
        migrationMeta.quarantinedCollisionIds?.[val] || [];

      if (redirectedId && !isQuarantinedAccountId(redirectedId)) {
        if (!key.includes("@")) {
          const recordedOwner = meta[key]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
          const redirectOwnerEmail = lookupEmailByAccountId(redirectedId)?.toLowerCase().trim();

          if (resolvedOwner) {
            const isRedirectOwner = Boolean(
              map[resolvedOwner] === redirectedId ||
              meta[resolvedOwner]?.accountId === redirectedId ||
              (redirectOwnerEmail && resolvedOwner === redirectOwnerEmail)
            );

            if (isRedirectOwner) {
              map[key] = redirectedId;
              meta[key] = {
                ...meta[key],
                accountId: redirectedId,
                type: "phone",
                ownerEmail: resolvedOwner,
                status: "active",
                updatedAt: Date.now(),
              };
              try {
                localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
                setAccountMetadata(meta);
              } catch {}
              return redirectedId;
            }

            const otherOwnerTargetId = map[resolvedOwner] || meta[resolvedOwner]?.accountId;
            if (otherOwnerTargetId && !isQuarantinedAccountId(otherOwnerTargetId) && otherOwnerTargetId !== val) {
              map[key] = otherOwnerTargetId;
              meta[key] = {
                ...meta[key],
                accountId: otherOwnerTargetId,
                type: "phone",
                ownerEmail: resolvedOwner,
                status: "active",
                updatedAt: Date.now(),
              };
              try {
                localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
                setAccountMetadata(meta);
              } catch {}
              return otherOwnerTargetId;
            }

            // Explicit owner has no usable map entry: keep unresolved/isolated, do NOT bind to redirectedId!
            const safePhoneId = `usr_phone_${key}`;
            map[key] = safePhoneId;
            meta[key] = {
              ...meta[key],
              accountId: safePhoneId,
              type: "phone",
              phone: key,
              ownerEmail: resolvedOwner,
              status: "unresolved",
              legacyId: val,
              candidateAccountIds: otherOwnerTargetId && otherOwnerTargetId !== val && !isQuarantinedAccountId(otherOwnerTargetId) ? [otherOwnerTargetId] : [],
              candidateEmails: [resolvedOwner],
              updatedAt: Date.now(),
            };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[key] = {
              legacyId: val,
              candidateAccountIds: otherOwnerTargetId && otherOwnerTargetId !== val && !isQuarantinedAccountId(otherOwnerTargetId) ? [otherOwnerTargetId] : [],
              candidateEmails: [resolvedOwner],
              quarantinedAt: Date.now(),
            };
            try {
              localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
              setAccountMetadata(meta);
              setMigrationMetadata(migrationMeta);
            } catch {}
            return null;
          }

          if (recordedOwner && !resolvedOwner) {
            // Unresolved changed_email owner: keep phone unresolved/isolated!
            const safePhoneId = `usr_phone_${key}`;
            map[key] = safePhoneId;
            meta[key] = {
              ...meta[key],
              accountId: safePhoneId,
              type: "phone",
              phone: key,
              ownerEmail: recordedOwner,
              status: "unresolved",
              legacyId: val,
              candidateAccountIds: [],
              candidateEmails: [recordedOwner],
              updatedAt: Date.now(),
            };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[key] = {
              legacyId: val,
              candidateAccountIds: [],
              candidateEmails: [recordedOwner],
              quarantinedAt: Date.now(),
            };
            try {
              localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
              setAccountMetadata(meta);
              setMigrationMetadata(migrationMeta);
            } catch {}
            return null;
          }

          // No explicit recorded owner on phone: check historical records
          if (quarantinedEmails.length > 0) {
            const foundEmail = findOwnerEmailForPhoneInRecords(key, quarantinedEmails, val);
            if (foundEmail) {
              const isFoundRedirectOwner = map[foundEmail] === redirectedId || redirectOwnerEmail === foundEmail;
              if (isFoundRedirectOwner) {
                map[key] = redirectedId;
                meta[key] = { ...meta[key], accountId: redirectedId, type: "phone", ownerEmail: foundEmail, status: "active", updatedAt: Date.now() };
                try {
                  localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
                  setAccountMetadata(meta);
                } catch {}
                return redirectedId;
              }

              const targetId = map[foundEmail] || meta[foundEmail]?.accountId;
              if (targetId && !isQuarantinedAccountId(targetId) && targetId !== val) {
                map[key] = targetId;
                meta[key] = { ...meta[key], accountId: targetId, type: "phone", ownerEmail: foundEmail, status: "active", updatedAt: Date.now() };
                try {
                  localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
                  setAccountMetadata(meta);
                } catch {}
                return targetId;
              }

              const safePhoneId = `usr_phone_${key}`;
              map[key] = safePhoneId;
              meta[key] = { ...meta[key], accountId: safePhoneId, type: "phone", phone: key, ownerEmail: foundEmail, status: "unresolved", legacyId: val, candidateEmails: [foundEmail], updatedAt: Date.now() };
              migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
              migrationMeta.unresolvedPhoneAliases[key] = { legacyId: val, candidateAccountIds: [], candidateEmails: [foundEmail], quarantinedAt: Date.now() };
              try {
                localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
                setAccountMetadata(meta);
                setMigrationMetadata(migrationMeta);
              } catch {}
              return null;
            }

            const safePhoneId = `usr_phone_${key}`;
            map[key] = safePhoneId;
            meta[key] = { ...meta[key], accountId: safePhoneId, type: "phone", phone: key, status: "unresolved", legacyId: val, candidateAccountIds: [redirectedId], candidateEmails: quarantinedEmails, updatedAt: Date.now() };
            migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
            migrationMeta.unresolvedPhoneAliases[key] = { legacyId: val, candidateAccountIds: [redirectedId], candidateEmails: quarantinedEmails, quarantinedAt: Date.now() };
            try {
              localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
              setAccountMetadata(meta);
              setMigrationMetadata(migrationMeta);
            } catch {}
            return null;
          }
        }

        map[key] = redirectedId;
        meta[key] = {
          ...meta[key],
          accountId: redirectedId,
          type: meta[key]?.type || (key.includes("@") ? "primary" : "phone"),
          updatedAt: Date.now(),
        };
        try {
          localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          setAccountMetadata(meta);
        } catch {}
        return redirectedId;
      }

      // If key is an email, rekey to injective ID
      if (key.includes("@")) {
        const expectedInjectiveId = key === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(key)}`;
        map[key] = expectedInjectiveId;
        meta[key] = {
          accountId: expectedInjectiveId,
          type: meta[key]?.type || "primary",
          updatedAt: Date.now(),
        };
        try {
          localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          setAccountMetadata(meta);
        } catch {}
        return expectedInjectiveId;
      }

      // For non-email identifier (e.g. phone) without a valid owner redirect:
      // Check metadata and historical records before isolating. Do NOT delete!
      const ownerEmail = meta[key]?.ownerEmail?.toLowerCase().trim();
      const resolvedOwner = getVerifiedRootOwner(ownerEmail, meta);
      let targetId: string | undefined;

      const checkOwner = resolvedOwner;
      if (checkOwner && map[checkOwner] && !isQuarantinedAccountId(map[checkOwner]) && map[checkOwner] !== val) {
        targetId = map[checkOwner];
      }
      if (!targetId && quarantinedEmails.length > 0) {
        const foundEmail = findOwnerEmailForPhoneInRecords(key, quarantinedEmails, val);
        if (foundEmail && map[foundEmail] && !isQuarantinedAccountId(map[foundEmail]) && map[foundEmail] !== val) {
          targetId = map[foundEmail];
        }
      }

      if (targetId) {
        map[key] = targetId;
        meta[key] = { ...meta[key], accountId: targetId, type: "phone", ownerEmail: checkOwner || meta[key]?.ownerEmail, status: "active", updatedAt: Date.now() };
        try {
          localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          setAccountMetadata(meta);
        } catch {}
        return targetId;
      }

      // If owner is known or was part of a quarantined collision, isolate as unresolved instead of deleting
      if (ownerEmail || quarantinedEmails.length > 0) {
        const safePhoneId = `usr_phone_${key}`;
        map[key] = safePhoneId;
        meta[key] = {
          ...meta[key],
          accountId: safePhoneId,
          type: "phone",
          phone: key,
          ownerEmail: meta[key]?.ownerEmail,
          status: "unresolved",
          legacyId: val,
          candidateAccountIds: [],
          candidateEmails: ownerEmail ? [ownerEmail] : quarantinedEmails,
          updatedAt: Date.now(),
        };
        migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
        migrationMeta.unresolvedPhoneAliases[key] = {
          legacyId: val,
          candidateAccountIds: [],
          candidateEmails: ownerEmail ? [ownerEmail] : quarantinedEmails,
          quarantinedAt: Date.now(),
        };
        try {
          localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          setAccountMetadata(meta);
          setMigrationMetadata(migrationMeta);
        } catch {}
        return null;
      }

      // For unowned tombstoned ID without redirect, reject tombstone consistently
      delete map[key];
      delete meta[key];
      try {
        localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
        setAccountMetadata(meta);
      } catch {}
      return null;
    }

    // 2. If val is NOT quarantined:
    if (key.includes("@")) {
      const expectedInjectiveId = key === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(key)}`;

      let activeAuthUser: { id?: string; email?: string } | null = null;
      try {
        const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
        if (authRaw) {
          const parsed = JSON.parse(authRaw);
          if (parsed?.isLoggedIn && parsed?.user && typeof parsed.user === "object") {
            activeAuthUser = parsed.user;
          }
        }
      } catch {}

      const activeUserEmail = activeAuthUser?.email ? activeAuthUser.email.toLowerCase().trim() : null;

      // Find all emails in map pointing to this val
      const collisionEmails: string[] = [];
      for (const [k, v] of Object.entries(map)) {
        if (typeof v === "string" && v.trim() === val && k.toLowerCase().includes("@")) {
          collisionEmails.push(k.toLowerCase().trim());
        }
      }

      if (collisionEmails.length > 1) {
        const partition = partitionEmailsByAccountOwner(collisionEmails, meta, activeUserEmail);
        if (partition.isSingleOwner) {
          const ownerCluster = partition.clusters[0];
          const targetId = (val.startsWith("usr_email_") || val === "usr_demo_radhika")
            ? val
            : ownerCluster.canonicalId;
          const copySuccess = copyCustomerData(val, targetId, {
            filterByOwnerEmail: ownerCluster.canonicalEmail,
            allowedEmails: ownerCluster.emails,
            verifiedPhones: [key].map((p) => normalizeExplicitPhoneToken(p)).filter(Boolean) as string[],
          });
          if (!copySuccess) {
            return val;
          }
          map[key] = targetId;
          meta[key] = {
            ...meta[key],
            accountId: targetId,
            type: meta[key]?.type || "primary",
            updatedAt: Date.now(),
          };
          clearFalseQuarantine(val, targetId, migrationMeta);
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
            setAccountMetadata(meta);
          } catch {}
          return targetId;
        }

        // True collision between distinct owners
        if (!migrationMeta.quarantinedLegacyBuckets?.[val]) {
          quarantineLegacyBucket(val, collisionEmails);
          migrationMeta.quarantinedLegacyBuckets[val] = {
            quarantinedAt: Date.now(),
            emails: collisionEmails,
          };
          migrationMeta.quarantinedCollisionIds[val] = collisionEmails;
        }

        const myCluster = partition.clusters.find((c) => c.emails.includes(key));
        const targetId = myCluster?.canonicalId || expectedInjectiveId;
        map[key] = targetId;
        meta[key] = {
          ...meta[key],
          accountId: targetId,
          type: meta[key]?.type || "primary",
          updatedAt: Date.now(),
        };
        try {
          localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          setAccountMetadata(meta);
          migrationMeta.migratedCollisionIds[val] = Array.from(
            new Set([...(migrationMeta.migratedCollisionIds[val] || []), key])
          );
          setMigrationMetadata(migrationMeta);
        } catch {}
        return targetId;
      }

      return val;
    } else if (val.startsWith("usr_phone_")) {
      const phoneDigits = val.slice("usr_phone_".length);
      if (phoneDigits.length < 10) {
        delete map[key];
        delete meta[key];
        try {
          localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          setAccountMetadata(meta);
        } catch {}
        return null;
      }

      // Check if this phone alias was unresolved and can now be resolved with affirmative evidence tied to this phone
      if (meta[key]?.status === "unresolved" || migrationMeta.unresolvedPhoneAliases?.[key]) {
        const candidateAccountIds = meta[key]?.candidateAccountIds || migrationMeta.unresolvedPhoneAliases?.[key]?.candidateAccountIds || [];
        const recordedLegacyId = migrationMeta.unresolvedPhoneAliases?.[key]?.legacyId || meta[key]?.legacyId;
        const candidateEmails = Array.from(new Set([
          ...(meta[key]?.candidateEmails || []),
          ...(migrationMeta.unresolvedPhoneAliases?.[key]?.candidateEmails || []),
        ]));

        let resolvedOwnerEmail: string | undefined;
        let resolvedId: string | undefined;

        // Evidence 1: Explicit recorded owner on this phone alias
        const recordedOwner = meta[key]?.ownerEmail?.toLowerCase().trim();
        const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
        const checkOwner = resolvedOwner;

        if (checkOwner) {
          const ownerTarget = map[checkOwner] || meta[checkOwner]?.accountId || (
            checkOwner === "radhika.sharma@example.com"
              ? "usr_demo_radhika"
              : `usr_email_${encodeIdentifierToId(checkOwner)}`
          );
          if (ownerTarget && !isQuarantinedAccountId(ownerTarget) && ownerTarget !== val) {
            const isCandidate = candidateAccountIds.length === 0 ||
              candidateAccountIds.includes(ownerTarget) ||
              candidateEmails.includes(checkOwner) ||
              candidateEmails.some((ce) => {
                const ceRoot = getVerifiedRootOwner(ce, meta) || ce;
                return ceRoot.toLowerCase().trim() === checkOwner;
              });
            if (isCandidate) {
              resolvedId = ownerTarget;
              resolvedOwnerEmail = checkOwner;
            }
          }
        }

        // Evidence 2: Historical records tied to this phone alias in the legacy bucket
        if (!resolvedId && recordedLegacyId && candidateEmails.length > 0) {
          const foundEmail = findOwnerEmailForPhoneInRecords(key, candidateEmails, recordedLegacyId);
          if (foundEmail) {
            const normFound = foundEmail.toLowerCase().trim();
            const targetId = map[normFound] || meta[normFound]?.accountId || (
              normFound === "radhika.sharma@example.com"
                ? "usr_demo_radhika"
                : `usr_email_${encodeIdentifierToId(normFound)}`
            );
            if (targetId && !isQuarantinedAccountId(targetId) && targetId !== val) {
              const isCandidate = candidateAccountIds.length === 0 ||
                candidateAccountIds.includes(targetId) ||
                candidateEmails.includes(normFound) ||
                candidateEmails.some((ce) => {
                  const ceRoot = getVerifiedRootOwner(ce, meta) || ce;
                  return ceRoot.toLowerCase().trim() === normFound;
                });
              if (isCandidate) {
                resolvedId = targetId;
                resolvedOwnerEmail = normFound;
              }
            }
          }
        }

        // Do not eliminate candidates or guess just because one candidate already has a different phone.
        // Resolve only when affirmative evidence tied to this phone points to a candidate.
        if (resolvedId) {
          if (!resolvedOwnerEmail) {
            resolvedOwnerEmail = lookupEmailByAccountId(resolvedId) || undefined;
            if (!resolvedOwnerEmail) {
              for (const [k, v] of Object.entries(map)) {
                if (v === resolvedId && k.includes("@")) {
                  resolvedOwnerEmail = k.toLowerCase().trim();
                  break;
                }
              }
            }
          }

          const allowedEmailSet = new Set<string>();
          if (resolvedOwnerEmail) {
            const normOwner = resolvedOwnerEmail.toLowerCase().trim();
            allowedEmailSet.add(normOwner);
            const root = resolveRootOwner(normOwner, meta);
            if (root) allowedEmailSet.add(root.toLowerCase().trim());
            for (const [em] of Object.entries(meta)) {
              if (em.includes("@")) {
                const norm = em.toLowerCase().trim();
                const emRoot = resolveRootOwner(norm, meta);
                if (emRoot && (emRoot === root || emRoot === normOwner)) {
                  allowedEmailSet.add(norm);
                }
              }
            }
          }

          const copyOptions: CopyCustomerDataOptions = {
            filterByOwnerEmail: resolvedOwnerEmail,
            allowedEmails: Array.from(allowedEmailSet),
            verifiedPhones: Array.from(new Set([key, meta[key]?.phone].map((p) => normalizeExplicitPhoneToken(p)).filter(Boolean) as string[])),
          };

          let copySuccess = true;
          if (recordedLegacyId && recordedLegacyId !== resolvedId) {
            copySuccess = copyCustomerData(recordedLegacyId, resolvedId, copyOptions);
          }
          if (copySuccess && `usr_phone_${key}` !== resolvedId) {
            copySuccess = copyCustomerData(`usr_phone_${key}`, resolvedId, copyOptions);
          }

          if (!copySuccess) {
            return val;
          }

          map[key] = resolvedId;
          meta[key] = {
            ...meta[key],
            accountId: resolvedId,
            ownerEmail: resolvedOwnerEmail || meta[key]?.ownerEmail,
            status: "active",
            updatedAt: Date.now(),
          };
          if (resolvedOwnerEmail && meta[resolvedOwnerEmail]) {
            meta[resolvedOwnerEmail] = {
              ...meta[resolvedOwnerEmail],
              phone: key,
              updatedAt: Date.now(),
            };
          }
          if (migrationMeta.unresolvedPhoneAliases?.[key]) {
            delete migrationMeta.unresolvedPhoneAliases[key];
            setMigrationMetadata(migrationMeta);
          }
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
            setAccountMetadata(meta);
          } catch {}
          return resolvedId;
        }
      }
    }

    return val;
  } catch {
    return null;
  }
}

/**
 * Registers an identifier alias (e.g. new email or phone number) pointing to an immutable account ID.
 * Strictly rejects rebinding if the identifier is already registered to a different account ID.
 * Supports explicit metadata tracking for changed-email aliases and owner links.
 */
export function registerAccountAlias(
  identifier: string,
  accountId: string,
  options?: {
    type?: "primary" | "changed_email" | "phone";
    ownerEmail?: string;
    previousEmail?: string;
    phone?: string;
    status?: "active" | "unresolved";
  }
): boolean {
  if (!identifier || !accountId) return false;
  const key = identifier.toLowerCase().trim();
  let val = accountId.trim();
  if (!key || !val) return false;
  try {
    const migrationMeta = getMigrationMetadata();
    if (isQuarantinedAccountId(val)) {
      const redirectedId = migrationMeta.rekeyedOwnerIds?.[val];
      if (redirectedId && !isQuarantinedAccountId(redirectedId)) {
        val = redirectedId;
      } else {
        return false;
      }
    }
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    const meta = getAccountMetadata();

    // Reject if already mapped to a different account ID (unless the existing mapping was quarantined or redirects to same owner, or was an unresolved isolated alias)
    const isUnresolvedAlias = meta[key]?.status === "unresolved" ||
      Boolean(migrationMeta.unresolvedPhoneAliases?.[key]) ||
      (map[key] === `usr_phone_${key}` && !key.includes("@"));

    if (map[key] && map[key] !== val && !isQuarantinedAccountId(map[key]) && !isUnresolvedAlias) {
      const existingRedirect = migrationMeta.rekeyedOwnerIds?.[map[key]];
      if (existingRedirect !== val) {
        return false;
      }
    }

    const isEmail = key.includes("@");
    let effectiveOwnerEmail = options?.ownerEmail || meta[key]?.ownerEmail;
    let effectivePhone = options?.phone || meta[key]?.phone;
    let isChangedEmail = false;

    if (!isEmail) {
      if (!effectivePhone) effectivePhone = key;
      if (!effectiveOwnerEmail) {
        effectiveOwnerEmail = lookupEmailByAccountId(val) || undefined;
      }
    } else {
      isChangedEmail = options?.type !== undefined ? options.type === "changed_email" : meta[key]?.type === "changed_email";
      const priorEmail = options?.previousEmail || (isChangedEmail ? meta[key]?.previousEmail : undefined);
      if (isChangedEmail && priorEmail && priorEmail.toLowerCase().trim() !== key) {
        // For a changed email, prioritize the actual owning/base email
        const root = resolveRootOwner(priorEmail, meta);
        effectiveOwnerEmail = options?.ownerEmail && options.ownerEmail.toLowerCase().trim() !== key
          ? options.ownerEmail.toLowerCase().trim()
          : (root && root !== key ? root : priorEmail.toLowerCase().trim());
      } else if (!effectiveOwnerEmail || !isChangedEmail) {
        effectiveOwnerEmail = key;
      }
    }

    // Clean up unresolved tracking and copy customer data if this phone is now registered to an active account
    if (!isEmail && val !== `usr_phone_${key}` && (migrationMeta.unresolvedPhoneAliases?.[key] || isUnresolvedAlias)) {
      const recordedLegacyId = migrationMeta.unresolvedPhoneAliases?.[key]?.legacyId || meta[key]?.legacyId;

      let resolvedOwnerEmail = effectiveOwnerEmail;
      if (!resolvedOwnerEmail) {
        resolvedOwnerEmail = lookupEmailByAccountId(val) || undefined;
      }
      if (!resolvedOwnerEmail) {
        for (const [k, v] of Object.entries(map)) {
          if (v === val && k.includes("@")) {
            resolvedOwnerEmail = k.toLowerCase().trim();
            break;
          }
        }
      }
      if (!resolvedOwnerEmail && meta[key]?.ownerEmail) {
        resolvedOwnerEmail = meta[key]?.ownerEmail?.toLowerCase().trim();
      }
      if (!resolvedOwnerEmail && migrationMeta.unresolvedPhoneAliases?.[key]?.candidateEmails?.length === 1) {
        resolvedOwnerEmail = migrationMeta.unresolvedPhoneAliases[key].candidateEmails[0]?.toLowerCase().trim();
      }

      if (resolvedOwnerEmail) {
        effectiveOwnerEmail = resolvedOwnerEmail;
      }

      const allowedEmailSet = new Set<string>();
      if (resolvedOwnerEmail) {
        const normOwner = resolvedOwnerEmail.toLowerCase().trim();
        allowedEmailSet.add(normOwner);
        const root = resolveRootOwner(normOwner, meta);
        if (root) allowedEmailSet.add(root.toLowerCase().trim());
        for (const [em] of Object.entries(meta)) {
          if (em.includes("@")) {
            const norm = em.toLowerCase().trim();
            const emRoot = resolveRootOwner(norm, meta);
            if (emRoot && (emRoot === root || emRoot === normOwner)) {
              allowedEmailSet.add(norm);
            }
          }
        }
      }

      const copyOptions: CopyCustomerDataOptions = {
        filterByOwnerEmail: resolvedOwnerEmail,
        allowedEmails: Array.from(allowedEmailSet),
        verifiedPhones: Array.from(new Set([key, effectivePhone, meta[key]?.phone].map((p) => normalizeExplicitPhoneToken(p)).filter(Boolean) as string[])),
      };

      let copySuccess = true;
      if (recordedLegacyId && recordedLegacyId !== val) {
        copySuccess = copyCustomerData(recordedLegacyId, val, copyOptions);
      }
      if (copySuccess && `usr_phone_${key}` !== val) {
        copySuccess = copyCustomerData(`usr_phone_${key}`, val, copyOptions);
      }

      if (!copySuccess) {
        // Do not persist the phone alias when its data copy fails.
        // Retain the unresolved mapping/metadata and return false before persisting the map.
        return false;
      }
      if (migrationMeta.unresolvedPhoneAliases?.[key]) {
        delete migrationMeta.unresolvedPhoneAliases[key];
        setMigrationMetadata(migrationMeta);
      }
    }

    map[key] = val;
    meta[key] = {
      accountId: val,
      type: options?.type || meta[key]?.type || (isEmail ? "primary" : "phone"),
      ownerEmail: effectiveOwnerEmail,
      previousEmail: isChangedEmail ? (options?.previousEmail || meta[key]?.previousEmail) : undefined,
      phone: effectivePhone,
      status: options?.status || "active",
      updatedAt: Date.now(),
    };

    // Bidirectional sync:
    if (!isEmail && effectiveOwnerEmail && meta[effectiveOwnerEmail]) {
      meta[effectiveOwnerEmail] = {
        ...meta[effectiveOwnerEmail],
        phone: key,
        updatedAt: Date.now(),
      };
    } else if (isEmail && effectivePhone && meta[effectivePhone]) {
      meta[effectivePhone] = {
        ...meta[effectivePhone],
        ownerEmail: key,
        updatedAt: Date.now(),
      };
    }

    localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
    setAccountMetadata(meta);
    return true;
  } catch {
    return false;
  }
}

/**
 * Unregisters an identifier alias if it is currently registered to the specified accountId.
 */
export function unregisterAccountAlias(identifier?: string | null, accountId?: string | null): void {
  if (!identifier || !accountId) return;
  const key = identifier.toLowerCase().trim();
  const val = accountId.trim();
  if (!key || !val) return;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    if (!raw) return;
    const map: Record<string, string> = JSON.parse(raw);
    const meta = getAccountMetadata();
    if (map[key] === val) {
      const prevOwnerEmail = meta[key]?.ownerEmail;
      const prevPhone = meta[key]?.phone;
      delete map[key];
      delete meta[key];
      if (prevOwnerEmail && meta[prevOwnerEmail]?.phone === key) {
        delete meta[prevOwnerEmail].phone;
      }
      if (prevPhone && meta[prevPhone]?.ownerEmail === key) {
        delete meta[prevPhone].ownerEmail;
      }
      localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
      setAccountMetadata(meta);
    }
  } catch {}
}

/**
 * Deterministically derives an immutable account ID from an identity.
 * - Demo account: "usr_demo_radhika"
 * - Mobile identity: "usr_phone_<10_digits>" (uses the full 10-digit national number, never truncated to last 4)
 * - Email identity: "usr_email_<collision_resistant_encoded_email>"
 */
export function generateAccountId(user: { id?: string; email?: string; mobile?: string }): string {
  // If an immutable account ID is already provided on user, strictly preserve it!
  if (user.id && user.id.trim()) {
    return user.id.trim();
  }
  const email = (user.email || "").toLowerCase().trim();
  if (email === "radhika.sharma@example.com") {
    return "usr_demo_radhika";
  }
  if (email) {
    const existing = lookupAccountId(email);
    if (existing) return existing;
  }
  if (user.mobile) {
    const digits = user.mobile.replace(/\D/g, "");
    const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
    if (tenDigits) {
      const existing = lookupAccountId(tenDigits);
      if (existing) return existing;
      if (isValidIndianMobile(user.mobile)) {
        return `usr_phone_${tenDigits}`;
      }
    }
  }
  if (email && email.startsWith("connoisseur.")) {
    const digits = email.replace(/\D/g, "");
    if (digits.length >= 10) {
      return `usr_phone_${digits.slice(-10)}`;
    }
  }
  if (email && email.includes("@")) {
    return `usr_email_${encodeIdentifierToId(email)}`;
  }
  return `usr_acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validates and normalizes raw parsed auth data from storage.
 * Handles null, primitives, non-objects, and missing or malformed fields safely.
 * Only accepts literal booleans for isLoggedIn, defaulting malformed/non-boolean values to false.
 */
export function validateAndNormalizeAuth(raw: unknown): {
  isLoggedIn: boolean;
  user: UserProfile | null;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { isLoggedIn: false, user: null };
  }

  const rawAuth = raw as { isLoggedIn?: unknown; user?: unknown };
  const isLoggedIn = typeof rawAuth.isLoggedIn === "boolean" ? rawAuth.isLoggedIn : false;

  if (!isLoggedIn) {
    return { isLoggedIn: false, user: null };
  }

  const rawUser = rawAuth.user;
  if (!rawUser || typeof rawUser !== "object" || Array.isArray(rawUser)) {
    return {
      isLoggedIn: true,
      user: {
        id: "usr_demo_radhika",
        name: "Radhika Sharma",
        email: "radhika.sharma@example.com",
        mobile: "+91 98765 43210",
        isConnoisseur: true,
        preferredDrape: "Nivi Style / Bengali Festive",
      },
    };
  }

  const userObj = rawUser as Record<string, unknown>;
  const rawId =
    typeof userObj.id === "string" && userObj.id.trim().length > 0
      ? userObj.id.trim()
      : undefined;
  const name =
    typeof userObj.name === "string" && userObj.name.trim().length > 0
      ? userObj.name.trim()
      : "Radhika Sharma";
  const email =
    typeof userObj.email === "string" && userObj.email.trim().length > 0
      ? userObj.email.trim()
      : "radhika.sharma@example.com";
  const mobile =
    typeof userObj.mobile === "string" && userObj.mobile.trim().length > 0
      ? formatStoredPhone(userObj.mobile)
      : undefined;
  const isConnoisseur =
    typeof userObj.isConnoisseur === "boolean" ? userObj.isConnoisseur : undefined;
  const preferredDrape =
    typeof userObj.preferredDrape === "string" && userObj.preferredDrape.trim().length > 0
      ? userObj.preferredDrape.trim()
      : undefined;

  let id = rawId;
  if (!id) {
    id = (email && lookupAccountId(email)) || generateAccountId({ email, mobile });
  } else if (email && email.includes("@")) {
    const lowerEmail = email.toLowerCase().trim();
    const expectedInjectiveId = lowerEmail === "radhika.sharma@example.com"
      ? "usr_demo_radhika"
      : `usr_email_${encodeIdentifierToId(lowerEmail)}`;

    // Strictly preserve existing immutable account IDs!
    // Only upgrade if lookupAccountId determined this account was part of a confirmed collision
    // that was migrated to a distinct injective ID, or if ownership cannot be established from map/metadata for a legacy usr_email_* ID.
    const migrationMeta = getMigrationMetadata();
    const wasMigratedCollision = (migrationMeta.migratedCollisionIds[id] || []).includes(lowerEmail);
    const isQuarantined = isQuarantinedAccountId(id);

    if (wasMigratedCollision || isQuarantined) {
      id = expectedInjectiveId;
    } else if (id.startsWith("usr_email_") && id !== expectedInjectiveId) {
      let ownershipEstablished = false;
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const rawMap = localStorage.getItem(ACCOUNT_MAP_KEY);
          if (rawMap) {
            const parsedMap = JSON.parse(rawMap);
            if (parsedMap && typeof parsedMap === "object" && parsedMap[lowerEmail] === id) {
              const meta = getAccountMetadata();
              let collisionCount = 0;
              for (const [k, v] of Object.entries(parsedMap)) {
                if (typeof v === "string" && v.trim() === id && k.toLowerCase().includes("@")) {
                  collisionCount++;
                }
              }
              if (
                (collisionCount <= 1 || (meta[lowerEmail]?.type === "changed_email" && meta[lowerEmail]?.accountId === id)) &&
                !isQuarantinedAccountId(id)
              ) {
                ownershipEstablished = true;
              }
            }
          }
        }
      } catch {}

      if (!ownershipEstablished) {
        quarantineLegacyBucket(id, [lowerEmail]);
        migrationMeta.migratedCollisionIds[id] = Array.from(new Set([...(migrationMeta.migratedCollisionIds[id] || []), lowerEmail]));
        setMigrationMetadata(migrationMeta);
        id = expectedInjectiveId;
      }
    }
  }

  return {
    isLoggedIn: true,
    user: {
      id,
      name,
      email,
      ...(mobile !== undefined ? { mobile } : {}),
      ...(isConnoisseur !== undefined ? { isConnoisseur } : {}),
      ...(preferredDrape !== undefined ? { preferredDrape } : {}),
    },
  };
}

/**
 * Validates and normalizes raw parsed orders data from storage.
 * Ensures the value is an array of valid OrderRecord objects, validates nested items,
 * and discards malformed entries so downstream rendering cannot crash.
 */
export function validateAndNormalizeOrders(raw: unknown): OrderRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const validOrders: OrderRecord[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;

    const candidate = item as Record<string, unknown>;

    if (typeof candidate.id !== "string" || candidate.id.trim().length === 0) continue;
    if (typeof candidate.orderNumber !== "string" || candidate.orderNumber.trim().length === 0) continue;
    if (typeof candidate.date !== "string" || candidate.date.trim().length === 0) continue;

    if (!Array.isArray(candidate.items)) continue;

    const validItems: OrderProductItem[] = [];
    for (const rawProduct of candidate.items) {
      if (!rawProduct || typeof rawProduct !== "object" || Array.isArray(rawProduct)) continue;
      const p = rawProduct as Record<string, unknown>;

      if (typeof p.id !== "string" || p.id.trim().length === 0) continue;
      const id = p.id.trim();

      if (typeof p.name !== "string" || p.name.trim().length === 0) continue;
      const name = p.name.trim();

      const rawPrice = p.price;
      const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

      const rawQty = p.quantity;
      const quantity = typeof rawQty === "number" && Number.isFinite(rawQty) && rawQty >= 1 ? Math.floor(rawQty) : 1;

      const image =
        typeof p.image === "string" && p.image.trim().length > 0
          ? p.image.trim()
          : "/images/hero-saree.jpg";

      const color = typeof p.color === "string" ? p.color.trim() : "";

      const rawBlouse = p.blouseOption;
      let blouseOption: string | undefined = undefined;
      if (typeof rawBlouse === "string") {
        let trimmed = rawBlouse.trim();
        if (trimmed === "Unstitched (Included)") {
          trimmed = "With Blouse";
        }
        const canonicalProduct = PRODUCTS.find((prod) => prod.id === id);
        if (!canonicalProduct || canonicalProduct.hasBlousePiece) {
          const supportedOptions = canonicalProduct?.blouseOptions?.length
            ? canonicalProduct.blouseOptions
            : ["With Blouse", "Without Blouse"];
          if (supportedOptions.includes(trimmed)) {
            blouseOption = trimmed;
          }
        }
      }

      validItems.push({
        id,
        name,
        image,
        price,
        quantity,
        color,
        ...(blouseOption ? { blouseOption } : {}),
      });
    }

    if (validItems.length === 0) continue;

    const rawTotal = candidate.totalAmount;
    const totalAmount =
      typeof rawTotal === "number" && Number.isFinite(rawTotal) && rawTotal >= 0
        ? rawTotal
        : validItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const status: "Delivered" | "In Transit" | "Processing" =
      candidate.status === "Delivered" || candidate.status === "In Transit" || candidate.status === "Processing"
        ? candidate.status
        : "Processing";

    const trackingNumber = typeof candidate.trackingNumber === "string" ? candidate.trackingNumber.trim() : "";
    const deliveryDate = typeof candidate.deliveryDate === "string" ? candidate.deliveryDate.trim() : "";
    const shippingAddress =
      typeof candidate.shippingAddress === "string" && candidate.shippingAddress.trim().length > 0
        ? candidate.shippingAddress.trim()
        : "Address not provided";
    const paymentMethod =
      typeof candidate.paymentMethod === "string" && candidate.paymentMethod.trim().length > 0
        ? candidate.paymentMethod.trim()
        : "Prepaid";

    validOrders.push({
      id: candidate.id.trim(),
      orderNumber: candidate.orderNumber.trim(),
      date: candidate.date.trim(),
      status,
      trackingNumber,
      deliveryDate,
      totalAmount,
      items: validItems,
      shippingAddress,
      paymentMethod,
    });
  }

  return validOrders;
}

/**
 * Validates and normalizes raw parsed addresses data from storage.
 * Ensures the value is an array of complete SavedAddress objects, with all required string
 * properties present to prevent crashes (e.g. addr.phone.replace).
 */
export function validateAndNormalizeAddresses(raw: unknown): SavedAddress[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const validAddresses: SavedAddress[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;

    const candidate = item as Record<string, unknown>;

    if (typeof candidate.id !== "string" || candidate.id.trim().length === 0) continue;
    if (typeof candidate.name !== "string" || candidate.name.trim().length === 0) continue;

    const rawPhone = candidate.phone;
    const phone =
      typeof rawPhone === "string" && rawPhone.trim().length > 0
        ? formatStoredPhone(rawPhone)
        : typeof rawPhone === "number" && Number.isFinite(rawPhone)
        ? formatStoredPhone(String(rawPhone))
        : "";
    if (!phone) continue;

    if (typeof candidate.addressLine !== "string" || candidate.addressLine.trim().length === 0) continue;
    if (typeof candidate.city !== "string" || candidate.city.trim().length === 0) continue;
    if (typeof candidate.state !== "string" || candidate.state.trim().length === 0) continue;

    const rawPincode = candidate.pincode;
    const pincode =
      typeof rawPincode === "string" && rawPincode.trim().length > 0
        ? rawPincode.trim()
        : typeof rawPincode === "number" && Number.isFinite(rawPincode)
        ? String(rawPincode)
        : "";
    if (!pincode) continue;

    const type: "Home" | "Office" = candidate.type === "Office" ? "Office" : "Home";
    const isDefault = Boolean(candidate.isDefault);

    validAddresses.push({
      id: candidate.id.trim(),
      type,
      name: candidate.name.trim(),
      phone,
      addressLine: candidate.addressLine.trim(),
      city: candidate.city.trim(),
      state: candidate.state.trim(),
      pincode,
      isDefault,
    });
  }

  return validAddresses;
}

/**
 * Derives a safe, collision-resistant user-scoped localStorage key keyed by an immutable account ID.
 * This guarantees that phone numbers never collide and editing a profile email does not change the storage key.
 */
export function getUserStorageKey(user: UserProfile | null, prefix: string): string {
  if (!user) {
    return `palluvo_ecommerce_${prefix}_guest`;
  }
  let accountId = user.id && user.id.trim() ? user.id.trim() : generateAccountId(user);
  if (isQuarantinedAccountId(accountId)) {
    const migrationMeta = getMigrationMetadata();
    const redirectedId = migrationMeta.rekeyedOwnerIds?.[accountId];
    if (redirectedId && !isQuarantinedAccountId(redirectedId)) {
      accountId = redirectedId;
    } else if (user.email && !user.email.startsWith("connoisseur.")) {
      const lowerEmail = user.email.toLowerCase().trim();
      accountId = lowerEmail === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
    } else if (user.mobile) {
      const digits = user.mobile.replace(/\D/g, "");
      const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
      accountId = `usr_phone_${tenDigits}`;
    } else if (user.email) {
      const lowerEmail = user.email.toLowerCase().trim();
      accountId = lowerEmail === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
    }
  }
  const safeId = accountId.toLowerCase().trim().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
  return `palluvo_ecommerce_${prefix}_${safeId}`;
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(["pal-001", "pal-004"]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load from localStorage on client mount with per-key isolation
  useEffect(() => {
    // Run alias migrations and quarantine ambiguous legacy buckets first
    migrateLegacyAccountAliases();

    // 1. Auth: validate independently so failures never block cart/orders/addresses
    try {
      const savedAuth = localStorage.getItem("palluvo_ecommerce_auth");
      if (savedAuth !== null) {
        try {
          const parsedAuth = JSON.parse(savedAuth);
          const validated = validateAndNormalizeAuth(parsedAuth);
          setIsLoggedIn(validated.isLoggedIn);
          setUser(validated.user);
        } catch {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    } catch {
      // Storage access error fallback
    }

    // 2. Cart: load and normalize canonical products independently
    try {
      const savedCart = localStorage.getItem("palluvo_ecommerce_cart");
      if (savedCart !== null) {
        try {
          const parsed = JSON.parse(savedCart);
          const validated = validateAndNormalizeCart(parsed);
          setCart(validated);
        } catch {
          setCart([]);
        }
      } else {
        // Seed initial cart item for instant e-commerce demonstration
        setCart([{ product: PRODUCTS[0], quantity: 1, selectedColor: "Wine", blouseOption: "With Blouse" }]);
      }
    } catch {
      // Storage access error fallback
    }

    // 3. Wishlist: load independently
    try {
      const savedWishlist = localStorage.getItem("palluvo_ecommerce_wishlist");
      if (savedWishlist !== null) {
        try {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed)) {
            setWishlist(parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0));
          }
        } catch {}
      }
    } catch {
      // Storage access error fallback
    }

    // Discard legacy browser-wide keys to prevent unscoped customer data disclosure on upgraded shared browsers
    try {
      localStorage.removeItem("palluvo_ecommerce_orders");
      localStorage.removeItem("palluvo_ecommerce_addresses");
    } catch {}

    // Mark initial client storage hydration complete (cart, wishlist, auth)
    isHydratedRef.current = true;
    setIsHydrated(true);
  }, []);

  // Save changes - only enable persistence after hydration has completed
  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    try {
      let safeUser = user;
      if (user && user.id && isQuarantinedAccountId(user.id)) {
        const migrationMeta = getMigrationMetadata();
        const redirectedId = migrationMeta.rekeyedOwnerIds?.[user.id];
        if (redirectedId && !isQuarantinedAccountId(redirectedId)) {
          safeUser = { ...user, id: redirectedId };
        } else if (user.email && !user.email.startsWith("connoisseur.")) {
          const lowerEmail = user.email.toLowerCase().trim();
          const expectedInjectiveId = lowerEmail === "radhika.sharma@example.com"
            ? "usr_demo_radhika"
            : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
          safeUser = { ...user, id: expectedInjectiveId };
        } else if (user.mobile) {
          const digits = user.mobile.replace(/\D/g, "");
          const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
          safeUser = { ...user, id: `usr_phone_${tenDigits}` };
        }
      }
      localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify({ isLoggedIn, user: safeUser }));
    } catch {}
  }, [isLoggedIn, user, isHydrated]);

  // Keep html[data-auth] (initially set by an inline pre-paint script) in sync with auth state
  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.setAttribute("data-auth", isLoggedIn ? "in" : "out");
  }, [isLoggedIn, isHydrated]);

  const activeUserKeyRef = useRef<string | null>(null);

  // Synchronize user-scoped orders and addresses when user identity changes or after auth hydration
  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;

    const currentKey = user && isLoggedIn
      ? (user.id || generateAccountId(user)).toLowerCase().trim()
      : null;

    if (activeUserKeyRef.current === currentKey) {
      return;
    }
    activeUserKeyRef.current = currentKey;

    if (!isLoggedIn || !user) {
      setOrders([]);
      setAddresses([]);
      return;
    }

    const isDemoUser = (user.id === "usr_demo_radhika") || (user.email || "").toLowerCase() === "radhika.sharma@example.com";
    const ordersKey = getUserStorageKey(user, "orders");
    const addressesKey = getUserStorageKey(user, "addresses");

    // Check if user has an unverified legacy usr_email_* ID when map is missing, or if user's ID was quarantined
    if (user.id && user.email) {
      const lowerEmail = user.email.toLowerCase().trim();
      const expectedInjectiveId = lowerEmail === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(lowerEmail)}`;

      if (isQuarantinedAccountId(user.id)) {
        const migrationMeta = getMigrationMetadata();
        const redirectedId = migrationMeta.rekeyedOwnerIds?.[user.id];
        const targetId = redirectedId && !isQuarantinedAccountId(redirectedId)
          ? redirectedId
          : (user.email && !user.email.startsWith("connoisseur.") ? expectedInjectiveId : user.id);
        quarantineLegacyBucket(user.id, [lowerEmail]);
        setUser((prev) => (prev ? { ...prev, id: targetId } : prev));
        try {
          const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
          if (authRaw) {
            const parsed = JSON.parse(authRaw);
            if (parsed?.user) {
              parsed.user.id = targetId;
              localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
            }
          }
        } catch {}
      } else if (user.id.startsWith("usr_email_") && user.id !== expectedInjectiveId) {
        let mapMissing = false;
        try {
          if (!localStorage.getItem(ACCOUNT_MAP_KEY)) {
            mapMissing = true;
          }
        } catch {}

        if (mapMissing) {
          quarantineLegacyBucket(user.id, [lowerEmail]);
          setUser((prev) => (prev ? { ...prev, id: expectedInjectiveId } : prev));
          try {
            const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
            if (authRaw) {
              const parsed = JSON.parse(authRaw);
              if (parsed?.user) {
                parsed.user.id = expectedInjectiveId;
                localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
              }
            }
          } catch {}
          setOrders(isDemoUser ? MOCK_ORDERS : []);
          setAddresses(isDemoUser ? MOCK_ADDRESSES : []);
          return;
        }
      }
    }

    // Clean up any legacy ambiguous collision-prone keys without copying to avoid attributing shared data to new IDs
    // Preserve source keys when quarantine backup failed so customer data is not permanently deleted
    if (user.email) {
      const legacySanitized = user.email.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "_");
      const legacyEmailOrderKey = `palluvo_ecommerce_orders_${legacySanitized}`;
      if (legacyEmailOrderKey !== ordersKey && !isFailedQuarantineKey(legacyEmailOrderKey)) {
        try {
          localStorage.removeItem(legacyEmailOrderKey);
        } catch {}
      }
      const legacyPrefixedOrderKey = `palluvo_ecommerce_orders_usr_email_${legacySanitized}`;
      if (legacyPrefixedOrderKey !== ordersKey && !isFailedQuarantineKey(legacyPrefixedOrderKey)) {
        try {
          localStorage.removeItem(legacyPrefixedOrderKey);
        } catch {}
      }

      const legacyEmailAddrKey = `palluvo_ecommerce_addresses_${legacySanitized}`;
      if (legacyEmailAddrKey !== addressesKey && !isFailedQuarantineKey(legacyEmailAddrKey)) {
        try {
          localStorage.removeItem(legacyEmailAddrKey);
        } catch {}
      }
      const legacyPrefixedAddrKey = `palluvo_ecommerce_addresses_usr_email_${legacySanitized}`;
      if (legacyPrefixedAddrKey !== addressesKey && !isFailedQuarantineKey(legacyPrefixedAddrKey)) {
        try {
          localStorage.removeItem(legacyPrefixedAddrKey);
        } catch {}
      }
    }

    // Load user-scoped orders - retain only known mock seed data for demo account; never import unscoped legacy records
    try {
      if (isQuarantinedStorageKey(ordersKey) || isQuarantinedAccountId(user.id)) {
        // Enforce persistent tombstone on reads: do not hydrate quarantined namespace. Discard repopulation unless backup failed.
        if (!isFailedQuarantineKey(ordersKey)) {
          try {
            localStorage.removeItem(ordersKey);
          } catch {}
        }
        setOrders(isDemoUser ? MOCK_ORDERS : []);
      } else {
        const savedOrders = localStorage.getItem(ordersKey);
        if (savedOrders !== null) {
          setOrders(validateAndNormalizeOrders(JSON.parse(savedOrders)));
        } else if (isDemoUser) {
          setOrders(MOCK_ORDERS);
        } else {
          setOrders([]);
        }
      }
    } catch {
      setOrders(isDemoUser ? MOCK_ORDERS : []);
    }

    // Load user-scoped addresses - retain only known mock seed data for demo account; never import unscoped legacy records
    try {
      if (isQuarantinedStorageKey(addressesKey) || isQuarantinedAccountId(user.id)) {
        // Enforce persistent tombstone on reads: do not hydrate quarantined namespace. Discard repopulation unless backup failed.
        if (!isFailedQuarantineKey(addressesKey)) {
          try {
            localStorage.removeItem(addressesKey);
          } catch {}
        }
        setAddresses(isDemoUser ? MOCK_ADDRESSES : []);
      } else {
        const savedAddresses = localStorage.getItem(addressesKey);
        if (savedAddresses !== null) {
          setAddresses(validateAndNormalizeAddresses(JSON.parse(savedAddresses)));
        } else if (isDemoUser) {
          setAddresses(MOCK_ADDRESSES);
        } else {
          setAddresses([]);
        }
      }
    } catch {
      setAddresses(isDemoUser ? MOCK_ADDRESSES : []);
    }
  }, [isLoggedIn, user, isHydrated]);

  const login = useCallback((userData?: UserProfile) => {
    setIsLoggedIn(true);
    setUser((prevUser) => {
      if (userData) {
        let id = userData.id || prevUser?.id || generateAccountId(userData);
        if (isQuarantinedAccountId(id)) {
          const migrationMeta = getMigrationMetadata();
          const redirectedId = migrationMeta.rekeyedOwnerIds?.[id];
          if (redirectedId && !isQuarantinedAccountId(redirectedId)) {
            id = redirectedId;
          } else if (userData.email && !userData.email.startsWith("connoisseur.")) {
            const lowerEmail = userData.email.toLowerCase().trim();
            id = lowerEmail === "radhika.sharma@example.com"
              ? "usr_demo_radhika"
              : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
          } else if (userData.mobile) {
            const digits = userData.mobile.replace(/\D/g, "");
            const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
            id = `usr_phone_${tenDigits}`;
          }
        }
        const digits = userData.mobile ? userData.mobile.replace(/\D/g, "") : "";
        const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
        const userEmail = userData.email && !userData.email.startsWith("connoisseur.") && !userData.email.startsWith("member@")
          ? userData.email.toLowerCase().trim()
          : undefined;

        if (userEmail) {
          registerAccountAlias(userEmail, id, {
            type: "primary",
            ownerEmail: userEmail,
            phone: tenDigits || undefined,
          });
        }
        if (tenDigits) {
          registerAccountAlias(tenDigits, id, {
            type: "phone",
            ownerEmail: userEmail,
            phone: tenDigits,
          });
        }
        return {
          ...userData,
          id,
        };
      }
      return {
        id: "usr_demo_radhika",
        name: "Radhika Sharma",
        email: "radhika.sharma@example.com",
        mobile: "+91 98765 43210",
        isConnoisseur: true,
        preferredDrape: "Nivi Style / Bengali Festive",
      };
    });
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setOrders([]);
    setAddresses([]);
  }, []);

  // Save changes - only enable persistence after hydration has completed
  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    try {
      localStorage.setItem("palluvo_ecommerce_cart", JSON.stringify(cart));
    } catch {}
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    try {
      localStorage.setItem("palluvo_ecommerce_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    if (!isLoggedIn || !user) return;
    try {
      const key = getUserStorageKey(user, "orders");
      if (isQuarantinedStorageKey(key) || isQuarantinedAccountId(user.id)) {
        // Enforce persistent tombstone on writes: never write to quarantined legacy namespace
        if (!isFailedQuarantineKey(key)) {
          try {
            localStorage.removeItem(key);
          } catch {}
        }
        return;
      }
      localStorage.setItem(key, JSON.stringify(orders));
    } catch {}
  }, [orders, isLoggedIn, user, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    if (!isLoggedIn || !user) return;
    try {
      const key = getUserStorageKey(user, "addresses");
      if (isQuarantinedStorageKey(key) || isQuarantinedAccountId(user.id)) {
        // Enforce persistent tombstone on writes: never write to quarantined legacy namespace
        if (!isFailedQuarantineKey(key)) {
          try {
            localStorage.removeItem(key);
          } catch {}
        }
        return;
      }
      localStorage.setItem(key, JSON.stringify(addresses));
    } catch {}
  }, [addresses, isLoggedIn, user, isHydrated]);

  const showToast = useCallback((message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedColor?: string, blouseOption?: string) => {
      const color = selectedColor || product.color;
      const resolvedBlouse = blouseOption === "Unstitched (Included)" ? "With Blouse" : blouseOption;
      const finalBlouseOption = product.hasBlousePiece
        ? (resolvedBlouse ?? product.blouseOptions?.[0] ?? "With Blouse")
        : undefined;
      const safeQty = Math.max(1, Math.min(Math.floor(quantity), 99));

      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.selectedColor === color &&
            item.blouseOption === finalBlouseOption
        );
        if (existingIndex > -1) {
          const next = [...prev];
          next[existingIndex].quantity = Math.min(next[existingIndex].quantity + safeQty, 99);
          return next;
        }
        return [...prev, { product, quantity: safeQty, selectedColor: color, blouseOption: finalBlouseOption }];
      });
      setIsCartOpen(true);
      showToast(`Added ${product.name} to Bag!`);
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: string, selectedColor?: string, blouseOption?: string) => {
      setCart((prev) =>
        prev.filter((item) => {
          const colorMatch = selectedColor === undefined || item.selectedColor === selectedColor;
          const blouseMatch = blouseOption === undefined || item.blouseOption === blouseOption;
          return !(item.product.id === productId && colorMatch && blouseMatch);
        })
      );
      showToast("Item removed from Bag", "info");
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedColor?: string, blouseOption?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, selectedColor, blouseOption);
        return;
      }
      const safeQty = Math.max(1, Math.min(Math.floor(quantity), 99));
      setCart((prev) =>
        prev.map((item) => {
          const matches =
            item.product.id === productId &&
            (selectedColor === undefined || item.selectedColor === selectedColor) &&
            (blouseOption === undefined || item.blouseOption === blouseOption);
          return matches ? { ...item, quantity: safeQty } : item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          showToast("Removed from Wishlist", "info");
          return prev.filter((id) => id !== productId);
        } else {
          showToast("Saved to Wishlist!");
          return [...prev, productId];
        }
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  const subtotal = useMemo(
    () =>
      (Array.isArray(cart) ? cart : []).reduce(
        (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 1),
        0
      ),
    [cart]
  );
  // Standard free shipping boundary applies to orders of ₹1,999 or more (subtotal >= 1999)
  const freeShippingThreshold = 1999;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 149;

  // Auto-revoke MAGIC500 coupon if subtotal drops below ₹3,000 threshold
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (appliedCoupon === "MAGIC500" && subtotal < 3000) {
      setAppliedCoupon(null);
      showToast("Coupon MAGIC500 removed: Requires a minimum subtotal of ₹3,000.", "info");
    }
  }, [appliedCoupon, subtotal, isHydrated, showToast]);

  // Calculate coupon discount directly from subtotal and applied coupon
  const discountAmount = useMemo(() => {
    if (appliedCoupon === "PALLUVO10") {
      return Math.round(subtotal * 0.1);
    }
    if (appliedCoupon === "MAGIC500" && subtotal >= 3000) {
      return 500;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const applyCoupon = useCallback(
    (code: string) => {
      const formatted = code.trim().toUpperCase();
      if (formatted === "PALLUVO10") {
        setAppliedCoupon("PALLUVO10");
        showToast("Coupon PALLUVO10 applied: 10% discount!");
        return { success: true, message: "10% discount applied successfully!" };
      } else if (formatted === "MAGIC500") {
        if (subtotal >= 3000) {
          setAppliedCoupon("MAGIC500");
          showToast("Coupon MAGIC500 applied: ₹500 discount!");
          return { success: true, message: "₹500 discount applied successfully!" };
        }
        return { success: false, message: "Coupon MAGIC500 requires a minimum subtotal of ₹3,000." };
      }
      return { success: false, message: "Invalid or expired coupon code. Try 'PALLUVO10'" };
    },
    [subtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast("Coupon removed", "info");
  }, [showToast]);

  const finalTotal = useMemo(
    () => Math.max(0, subtotal - discountAmount + shippingFee),
    [subtotal, discountAmount, shippingFee]
  );
  const cartCount = useMemo(
    () =>
      (Array.isArray(cart) ? cart : []).reduce(
        (total, item) => total + (item?.quantity || 0),
        0
      ),
    [cart]
  );
  const wishlistCount = wishlist.length;

  const placeOrder = useCallback(
    (orderData: Omit<OrderRecord, "id" | "orderNumber" | "date" | "status" | "deliveryDate">): OrderRecord => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newOrder: OrderRecord = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber: `PAL-2026-${randomSuffix}`,
        date: "Today",
        status: "Processing",
        trackingNumber: `EXP${Math.floor(10000000 + Math.random() * 90000000)}`,
        deliveryDate: "Expected within 3-4 working days",
      };

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    },
    [clearCart]
  );

  const clearOrders = useCallback(() => {
    setOrders([]);
    try {
      if (user) {
        localStorage.removeItem(getUserStorageKey(user, "orders"));
      }
      localStorage.removeItem("palluvo_ecommerce_orders");
    } catch {}
    showToast("Simulated order history cleared", "info");
  }, [user, showToast]);

  const addAddress = useCallback(
    (newAddrData: Omit<SavedAddress, "id">): SavedAddress => {
      const newAddress: SavedAddress = {
        id: `addr-${Date.now()}`,
        ...newAddrData,
      };
      setAddresses((prev) => {
        if (newAddrData.isDefault) {
          return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
        }
        return [...prev, newAddress];
      });
      showToast("New address added successfully!");
      return newAddress;
    },
    [showToast]
  );

  const updateAddress = useCallback(
    (id: string, updatedData: Partial<SavedAddress>) => {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === id) {
            return { ...a, ...updatedData };
          }
          if (updatedData.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        })
      );
      showToast("Address updated successfully!");
    },
    [showToast]
  );

  const deleteAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast("Address deleted", "info");
    },
    [showToast]
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
      showToast("Default address updated");
    },
    [showToast]
  );

  const formatPrice = useCallback((amount: number): string => {
    return `₹${amount.toLocaleString("en-IN")}`;
  }, []);

  const contextValue = useMemo<StoreContextType>(
    () => ({
      isHydrated,
      cart,
      wishlist,
      orders,
      addresses,
      isCartOpen,
      isSearchOpen,
      quickViewProduct,
      discountAmount,
      appliedCoupon,
      toast,
      subtotal,
      shippingFee,
      freeShippingThreshold,
      finalTotal,
      cartCount,
      wishlistCount,
      isLoggedIn,
      user,
      login,
      logout,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      applyCoupon,
      removeCoupon,
      placeOrder,
      clearOrders,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      setIsCartOpen,
      setIsSearchOpen,
      setQuickViewProduct,
      showToast,
      formatPrice,
    }),
    [
      isHydrated,
      cart,
      wishlist,
      orders,
      addresses,
      isCartOpen,
      isSearchOpen,
      quickViewProduct,
      discountAmount,
      appliedCoupon,
      toast,
      subtotal,
      shippingFee,
      freeShippingThreshold,
      finalTotal,
      cartCount,
      wishlistCount,
      isLoggedIn,
      user,
      login,
      logout,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      applyCoupon,
      removeCoupon,
      placeOrder,
      clearOrders,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      setIsCartOpen,
      setIsSearchOpen,
      setQuickViewProduct,
      showToast,
      formatPrice,
    ]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
