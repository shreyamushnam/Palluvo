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
}

export function getMigrationMetadata(): MigrationMeta {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      migratedCollisionIds: {},
      quarantinedCollisionIds: {},
      quarantinedLegacyBuckets: {},
      tombstonedKeys: {},
      failedQuarantineKeys: {},
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
    };
  } catch {
    return {
      migratedCollisionIds: {},
      quarantinedCollisionIds: {},
      quarantinedLegacyBuckets: {},
      tombstonedKeys: {},
      failedQuarantineKeys: {},
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

    // Check currently active authenticated user session if available
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
    const activeUserId = activeAuthUser?.id ? activeAuthUser.id.trim() : null;

    // Detect confirmed collision groups: multiple distinct emails mapped to the exact same value in identity map
    const emailKeysByVal = new Map<string, Set<string>>();
    for (const [k, v] of Object.entries(map)) {
      if (typeof v === "string" && k.toLowerCase().includes("@")) {
        const trimmedVal = v.trim();
        const set = emailKeysByVal.get(trimmedVal) || new Set<string>();
        set.add(k.toLowerCase().trim());
        emailKeysByVal.set(trimmedVal, set);
      }
    }

    for (const key of Object.keys(map)) {
      const val = map[key];
      if (typeof val !== "string") {
        delete map[key];
        delete meta[key.toLowerCase().trim()];
        modified = true;
        continue;
      }
      const trimmedVal = val.trim();
      const lowerKey = key.toLowerCase().trim();

      if (lowerKey.includes("@")) {
        const expectedInjectiveId = lowerKey === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(lowerKey)}`;

        // A confirmed collision occurs when multiple distinct emails are mapped to the same ID in the identity map
        const collisionEmails = emailKeysByVal.get(trimmedVal);
        const isCollisionGroup = (collisionEmails?.size ?? 0) > 1;

        if (isCollisionGroup) {
          // Always quarantine the ambiguous legacy bucket for this collision group so neither alias loads it
          if (!migrationMeta.quarantinedLegacyBuckets?.[trimmedVal]) {
            quarantineLegacyBucket(trimmedVal, Array.from(collisionEmails!));
            migrationMeta.quarantinedLegacyBuckets[trimmedVal] = {
              quarantinedAt: Date.now(),
              emails: Array.from(collisionEmails!),
            };
            migrationMeta.quarantinedCollisionIds[trimmedVal] = Array.from(collisionEmails!);
            modified = true;
          }

          // A quarantined legacy ID must remain unavailable as an active storage namespace across all tabs.
          // Move ALL collision accounts, including any recognized owner, off that namespace to distinct injective IDs.
          map[key] = expectedInjectiveId;
          meta[lowerKey] = {
            accountId: expectedInjectiveId,
            type: meta[lowerKey]?.type || "primary",
            updatedAt: Date.now(),
          };
          modified = true;

          migrationMeta.migratedCollisionIds[trimmedVal] = Array.from(
            new Set([...(migrationMeta.migratedCollisionIds[trimmedVal] || []), ...Array.from(collisionEmails!)])
          );

          if (activeUserId === trimmedVal && activeUserEmail === lowerKey) {
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
          continue;
        }

        // If this ID was quarantined, it must remain unavailable as an active storage namespace.
        // Move the retained owner off that namespace too.
        if (isQuarantinedAccountId(trimmedVal)) {
          map[key] = expectedInjectiveId;
          meta[lowerKey] = {
            accountId: expectedInjectiveId,
            type: meta[lowerKey]?.type || "primary",
            updatedAt: Date.now(),
          };
          modified = true;

          migrationMeta.migratedCollisionIds[trimmedVal] = Array.from(
            new Set([...(migrationMeta.migratedCollisionIds[trimmedVal] || []), lowerKey])
          );

          if (activeUserId === trimmedVal && activeUserEmail === lowerKey) {
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
          continue;
        }

        // Check if this key is known as a changed-email alias or actively authenticated user
        const isKnownChangedEmail = meta[lowerKey]?.type === "changed_email" && meta[lowerKey]?.accountId === trimmedVal;
        const isActiveAuthOwnership = activeUserEmail === lowerKey && activeUserId === trimmedVal;

        if (isKnownChangedEmail || isActiveAuthOwnership) {
          if (!meta[lowerKey]) {
            meta[lowerKey] = { accountId: trimmedVal, type: "changed_email", updatedAt: Date.now() };
          }
          continue;
        }
        // If there is NO collision (only 1 email mapped to trimmedVal), NEVER remap!
        // Preserve aliases to an existing immutable account ID!
      } else if (trimmedVal.startsWith("usr_phone_")) {
        const phoneDigits = trimmedVal.slice("usr_phone_".length);
        if (phoneDigits.length < 10) {
          delete map[key];
          delete meta[lowerKey];
          modified = true;
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
 */
export function lookupAccountId(identifier?: string | null): string | null {
  if (!identifier || typeof identifier !== "string") return null;
  const key = identifier.toLowerCase().trim();
  if (!key) return null;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    if (map && typeof map === "object" && typeof map[key] === "string" && map[key].trim().length > 0) {
      const val = map[key].trim();

      if (key.includes("@")) {
        const expectedInjectiveId = key === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(key)}`;

        const meta = getAccountMetadata();
        const migrationMeta = getMigrationMetadata();

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
        const activeUserId = activeAuthUser?.id ? activeAuthUser.id.trim() : null;

        // Count distinct emails in map pointing to this val
        let collisionCount = 0;
        let otherEmailHasOwner = false;
        const collisionEmails: string[] = [];
        for (const [k, v] of Object.entries(map)) {
          if (typeof v === "string" && v.trim() === val && k.toLowerCase().includes("@")) {
            collisionCount++;
            const otherKey = k.toLowerCase().trim();
            collisionEmails.push(otherKey);
            if (otherKey !== key && ((activeUserEmail === otherKey && activeUserId === val) || meta[otherKey]?.type === "changed_email")) {
              otherEmailHasOwner = true;
            }
          }
        }

        if (isQuarantinedAccountId(val)) {
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

        if (collisionCount > 1) {
          if (!migrationMeta.quarantinedLegacyBuckets?.[val]) {
            quarantineLegacyBucket(val, collisionEmails);
            migrationMeta.quarantinedLegacyBuckets[val] = {
              quarantinedAt: Date.now(),
              emails: collisionEmails,
            };
            migrationMeta.quarantinedCollisionIds[val] = collisionEmails;
          }
          map[key] = expectedInjectiveId;
          meta[key] = {
            accountId: expectedInjectiveId,
            type: meta[key]?.type || "primary",
            updatedAt: Date.now(),
          };
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
            setAccountMetadata(meta);
            migrationMeta.migratedCollisionIds[val] = migrationMeta.migratedCollisionIds[val] || [];
            if (!migrationMeta.migratedCollisionIds[val].includes(key)) {
              migrationMeta.migratedCollisionIds[val].push(key);
            }
            setMigrationMetadata(migrationMeta);
          } catch {}
          return expectedInjectiveId;
        }

        const isKnownChangedEmail = meta[key]?.type === "changed_email" && meta[key]?.accountId === val;
        const isActiveAuthOwnership = activeUserEmail === key && activeUserId === val;

        if (isKnownChangedEmail || isActiveAuthOwnership) {
          return val;
        }

        if (otherEmailHasOwner) {
          map[key] = expectedInjectiveId;
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          } catch {}
          return expectedInjectiveId;
        }

        return val;
      } else if (val.startsWith("usr_phone_")) {
        const phoneDigits = val.slice("usr_phone_".length);
        if (phoneDigits.length < 10) {
          delete map[key];
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          } catch {}
          return null;
        }
      }

      return val;
    }
  } catch {}
  return null;
}

/**
 * Registers an identifier alias (e.g. new email or phone number) pointing to an immutable account ID.
 * Strictly rejects rebinding if the identifier is already registered to a different account ID.
 * Supports explicit metadata tracking for changed-email aliases.
 */
export function registerAccountAlias(
  identifier: string,
  accountId: string,
  options?: { type?: "primary" | "changed_email" | "phone" }
): boolean {
  if (!identifier || !accountId) return false;
  const key = identifier.toLowerCase().trim();
  const val = accountId.trim();
  if (!key || !val) return false;
  try {
    if (isQuarantinedAccountId(val)) {
      return false;
    }
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    const meta = getAccountMetadata();

    // Reject if already mapped to a different account ID (unless the existing mapping was quarantined)
    if (map[key] && map[key] !== val && !isQuarantinedAccountId(map[key])) {
      return false;
    }

    map[key] = val;
    meta[key] = {
      accountId: val,
      type: options?.type || meta[key]?.type || "primary",
      updatedAt: Date.now(),
    };

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
      delete map[key];
      delete meta[key];
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
  if (user.email && isQuarantinedAccountId(accountId)) {
    const lowerEmail = user.email.toLowerCase().trim();
    accountId = lowerEmail === "radhika.sharma@example.com"
      ? "usr_demo_radhika"
      : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
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
      if (user && user.email && isQuarantinedAccountId(user.id)) {
        const lowerEmail = user.email.toLowerCase().trim();
        const expectedInjectiveId = lowerEmail === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
        safeUser = { ...user, id: expectedInjectiveId };
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
        if (userData.email && isQuarantinedAccountId(id)) {
          const lowerEmail = userData.email.toLowerCase().trim();
          id = lowerEmail === "radhika.sharma@example.com"
            ? "usr_demo_radhika"
            : `usr_email_${encodeIdentifierToId(lowerEmail)}`;
        }
        if (userData.email) registerAccountAlias(userData.email, id);
        if (userData.mobile) {
          const digits = userData.mobile.replace(/\D/g, "");
          const tenDigits = digits.length >= 10 ? digits.slice(-10) : digits;
          if (tenDigits) registerAccountAlias(tenDigits, id);
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
