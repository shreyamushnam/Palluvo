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

export const ACCOUNT_MAP_KEY = "palluvo_account_identity_map";
export const ACCOUNT_META_KEY = "palluvo_account_identity_metadata";
export const MIGRATION_META_KEY = "palluvo_account_migration_meta";

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
  clearedQuarantineKeys?: Record<string, number | boolean>;
  unresolvedPhoneAliases?: Record<string, {
    legacyId: string;
    candidateAccountIds: string[];
    candidateEmails: string[];
    quarantinedAt: number;
  }>;
  operationSeq?: number;
}

export function getClearedAtTimestamp(val: number | boolean | undefined, referenceQuarantineTime = 0): number {
  if (typeof val === "number") return val;
  if (val === true) {
    // Preserve legacy boolean clears with explicit ordering semantics:
    // A legacy boolean clear represents an explicit clear operation that occurred
    // after the quarantine was established, not a timestamp at epoch (1ms).
    const base = referenceQuarantineTime > 0 ? referenceQuarantineTime + 1 : 0;
    const now = typeof Date !== "undefined" && Date.now ? Date.now() : 1;
    return Math.max(base, now);
  }
  return 0;
}

export const MIGRATION_LOCK_KEY = "palluvo_migration_meta_lock";
export const MIGRATION_SEQ_KEY = "palluvo_migration_reserved_op_seq";
export const MIGRATION_FENCE_KEY = "palluvo_migration_meta_lock_fence";

let lastMigrationOpSeq = 0;
let currentBrowsingContextId = "";
let lockClaimCounter = 0;
let lastLockStorageWriteError = false;
const activeLockTickets = new Map<string, { owner: string; ticket: number; ttlMs?: number }>();
const activeClaimKeysForUnload = new Set<string>();
let unloadCleanupRegistered = false;

function ensureUnloadCleanupRegistered(): void {
  if (unloadCleanupRegistered || typeof window === "undefined" || typeof window.addEventListener !== "function") {
    return;
  }
  unloadCleanupRegistered = true;
  const cleanup = () => {
    try {
      for (const claimKey of Array.from(activeClaimKeysForUnload)) {
        try {
          localStorage.removeItem(claimKey);
        } catch {}
      }
      activeClaimKeysForUnload.clear();
      activeLockTickets.clear();
    } catch {}
  };
  try {
    window.addEventListener("pagehide", cleanup);
    window.addEventListener("beforeunload", cleanup);
  } catch {}
}

/**
 * Returns a globally unique, high-entropy identifier for this browsing context.
 * Strictly stored in private module memory (never sessionStorage), ensuring that
 * auxiliary browsing contexts created with an opener (which clone sessionStorage)
 * always receive an independent, non-conflicting identity.
 */
export function getBrowsingContextId(): string {
  if (currentBrowsingContextId) return currentBrowsingContextId;

  let entropy = "";
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      try {
        entropy = crypto.randomUUID();
      } catch {}
    }
    if (!entropy && typeof crypto.getRandomValues === "function") {
      try {
        const buf = new Uint8Array(16);
        crypto.getRandomValues(buf);
        entropy = Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
      } catch {}
    }
  }
  if (!entropy) {
    entropy = `${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  }

  const now = typeof Date !== "undefined" && Date.now ? Date.now() : 1;
  const perf = typeof performance !== "undefined" && typeof performance.now === "function"
    ? Math.round(performance.now() * 1000)
    : 0;

  currentBrowsingContextId = `ctx_${now}_${perf}_${entropy}`;

  // Purge any legacy sessionStorage keys so they cannot pollute anything
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("palluvo_tab_str_id");
      sessionStorage.removeItem("palluvo_tab_id");
    } catch {}
  }

  return currentBrowsingContextId;
}

/**
 * Generates a distinct lock owner identifier for each lock acquisition attempt,
 * scoped to this browsing context and monotonically incremented per claim.
 */
export function generateLockOwnerId(): string {
  const contextId = getBrowsingContextId();
  lockClaimCounter += 1;
  return `${contextId}_claim_${lockClaimCounter}`;
}

export function resetBrowsingContextIdForTest(id?: string): void {
  currentBrowsingContextId = id || "";
  lockClaimCounter = 0;
}

function getAllLocalStorageKeys(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const keys: string[] = [];
    if (typeof localStorage.length === "number" && typeof localStorage.key === "function") {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) keys.push(k);
      }
      return keys;
    }
    const storageWithStore = localStorage as unknown as { store?: Record<string, unknown> };
    if (storageWithStore.store && typeof storageWithStore.store === "object") {
      return Object.keys(storageWithStore.store);
    }
    return Object.keys(localStorage);
  } catch {
    try {
      return Object.keys(localStorage);
    } catch {
      return [];
    }
  }
}

/**
 * Lamport Bakery cross-tab mutual exclusion lock acquisition with crash-recoverable leases
 * and monotonic fencing in localStorage.
 *
 * Each contender writes its claim exclusively to its own dedicated per-claim key
 * (`${lockKey}_claim_${lockOwnerId}`) and NEVER writes to a shared claim key or
 * another contender's claim key during acquisition.
 *
 * Crash recovery & stale-owner protection:
 * - Every claim carries a finite numeric `expiresAt` lease (default `ttlMs = 400`).
 *   Any claim lacking a valid future `expiresAt` (or exceeding `acquiredAt + ttlMs`) is
 *   treated as expired and evicted on the next acquisition attempt, ensuring orphaned
 *   claims left behind by a browser or renderer crash never permanently block `MIGRATION_LOCK_KEY`.
 * - Ticket assignment inspects both active and expired claims as well as `${lockKey}_fence`
 *   so every new owner receives a strictly greater monotonic `ticket` than any prior owner.
 * - While a critical section is actively executing within its lease window, calls to
 *   `verifyCrossTabLockOwnership` extend `expiresAt` and record the owner's fencing token.
 *   If a tab is suspended or `fn()` runs past `expiresAt`, `verifyCrossTabLockOwnership`
 *   detects the expired/evicted claim (or higher fencing token) before commit and aborts.
 */
export function tryAcquireCrossTabLock(lockKey: string, lockOwnerId: string, ttlMs = 400): boolean {
  if (typeof window === "undefined" || !window.localStorage) return true;
  ensureUnloadCleanupRegistered();

  const startNow = Date.now();
  const effectiveTtlMs = typeof ttlMs === "number" && Number.isFinite(ttlMs) && ttlMs > 0 ? ttlMs : 400;
  const leaseExpiresAt = startNow + effectiveTtlMs;
  const claimPrefix = `${lockKey}_claim_`;
  const claimKey = `${claimPrefix}${lockOwnerId}`;
  const fenceKey = `${lockKey}_fence`;

  const isClaimActive = (
    claim: { expiresAt?: unknown; acquiredAt?: unknown; phase?: unknown } | null | undefined,
    checkNow: number
  ): boolean => {
    if (!claim || typeof claim !== "object") return false;
    if (typeof claim.expiresAt === "number" && Number.isFinite(claim.expiresAt)) {
      return claim.expiresAt > checkNow;
    }
    if (typeof claim.acquiredAt === "number" && Number.isFinite(claim.acquiredAt)) {
      return claim.acquiredAt + effectiveTtlMs > checkNow;
    }
    return false;
  };

  const hasRemainingSelfLease = (checkNow: number, minRemainingMs: number): boolean => {
    return checkNow + minRemainingMs < leaseExpiresAt;
  };

  const hasUnexpiredDirectLock = (checkNow: number): boolean => {
    try {
      const rawExisting = localStorage.getItem(lockKey);
      if (!rawExisting) return false;
      const existing = JSON.parse(rawExisting);
      if (existing && typeof existing === "object") {
        if (typeof existing.expiresAt === "number" && Number.isFinite(existing.expiresAt)) {
          if (existing.expiresAt > checkNow) {
            return existing.owner !== lockOwnerId;
          }
          return false;
        }
        if (typeof existing.acquiredAt === "number" && Number.isFinite(existing.acquiredAt)) {
          if (existing.acquiredAt + effectiveTtlMs > checkNow) {
            return existing.owner !== lockOwnerId;
          }
          return false;
        }
      }
      return false;
    } catch {
      return true;
    }
  };

  const cleanupOwnClaim = () => {
    activeClaimKeysForUnload.delete(claimKey);
    const active = activeLockTickets.get(lockKey);
    if (active && active.owner === lockOwnerId) {
      activeLockTickets.delete(lockKey);
    }
    try {
      localStorage.removeItem(claimKey);
    } catch {}
  };

  // Phase 0: Read-only check for an existing active lock before writing anything
  if (hasUnexpiredDirectLock(startNow)) {
    return false;
  }
  try {
    const initialKeys = getAllLocalStorageKeys();
    for (const k of initialKeys) {
      if (k.startsWith(claimPrefix) && k !== claimKey) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") continue;
          if (!isClaimActive(parsed, startNow)) {
            continue;
          }
          if (parsed.phase === "claimed" && parsed.owner !== lockOwnerId) {
            return false;
          }
        } catch {}
      }
    }
  } catch {
    return false;
  }

  // Phase 1: Doorway entry — announce "choosing" in our own dedicated key with finite crash-recoverable lease
  const choosingData = JSON.stringify({
    owner: lockOwnerId,
    phase: "choosing",
    ticket: 0,
    acquiredAt: startNow,
    expiresAt: leaseExpiresAt,
  });
  try {
    activeClaimKeysForUnload.add(claimKey);
    localStorage.setItem(claimKey, choosingData);
    if (localStorage.getItem(claimKey) !== choosingData) {
      lastLockStorageWriteError = true;
      cleanupOwnClaim();
      return false;
    }
  } catch {
    lastLockStorageWriteError = true;
    activeClaimKeysForUnload.delete(claimKey);
    return false;
  }

  // Phase 2: Observe all claims (active and expired), per-owner fences, and fenced commit records
  // after doorway registration to assign a strictly increasing monotonic ticket.
  // Expired claims are evicted in Phase 4 (after our higher ticket is published in Phase 3)
  // so the highest ticket watermark in localStorage never regresses.
  let maxObservedTicket = startNow;
  const fencePrefix = `${lockKey}_fence_`;
  const metaCommitPrefix = `${MIGRATION_META_KEY}_commit_`;
  const seqCommitPrefix = `${MIGRATION_SEQ_KEY}_commit_`;
  try {
    const now2 = Date.now();
    if (!hasRemainingSelfLease(now2, 40) || hasUnexpiredDirectLock(now2)) {
      cleanupOwnClaim();
      return false;
    }
    try {
      const rawFence = localStorage.getItem(fenceKey);
      if (rawFence) {
        const parsedFence = JSON.parse(rawFence);
        if (parsedFence && typeof parsedFence.ticket === "number" && parsedFence.ticket > maxObservedTicket) {
          maxObservedTicket = parsedFence.ticket;
        }
      }
    } catch {}
    const keys = getAllLocalStorageKeys();
    for (const k of keys) {
      if (k.startsWith(claimPrefix) && k !== claimKey) {
        const otherRaw = localStorage.getItem(k);
        if (!otherRaw) continue;
        try {
          const otherClaim = JSON.parse(otherRaw);
          if (otherClaim && typeof otherClaim === "object") {
            const otherTicket =
              typeof otherClaim.ticket === "number"
                ? otherClaim.ticket
                : typeof otherClaim.claimTime === "number"
                ? otherClaim.claimTime
                : 0;
            if (otherTicket > maxObservedTicket) {
              maxObservedTicket = otherTicket;
            }
          }
        } catch {}
      } else if (
        k.startsWith(fencePrefix) ||
        (lockKey === MIGRATION_LOCK_KEY && (k.startsWith(metaCommitPrefix) || k.startsWith(seqCommitPrefix)))
      ) {
        const rawRecord = localStorage.getItem(k);
        if (!rawRecord) continue;
        try {
          const parsedRecord = JSON.parse(rawRecord);
          if (parsedRecord && typeof parsedRecord.ticket === "number" && parsedRecord.ticket > maxObservedTicket) {
            maxObservedTicket = parsedRecord.ticket;
          }
        } catch {}
      }
    }
  } catch {
    cleanupOwnClaim();
    return false;
  }

  const myTicket = Math.max(Date.now(), maxObservedTicket + 1);

  // Phase 3: Doorway exit — publish numbered claim to our own dedicated key (FINAL WRITE)
  const claimedData = JSON.stringify({
    owner: lockOwnerId,
    phase: "claimed",
    ticket: myTicket,
    acquiredAt: Date.now(),
    expiresAt: leaseExpiresAt,
  });
  try {
    if (!hasRemainingSelfLease(Date.now(), 40)) {
      cleanupOwnClaim();
      return false;
    }
    localStorage.setItem(claimKey, claimedData);
    if (localStorage.getItem(claimKey) !== claimedData) {
      lastLockStorageWriteError = true;
      cleanupOwnClaim();
      return false;
    }
  } catch {
    lastLockStorageWriteError = true;
    cleanupOwnClaim();
    return false;
  }

  const evictExpiredClaimRecord = (expiredClaimKey: string, expiredOwner?: string) => {
    const ownerId = expiredOwner || expiredClaimKey.slice(claimPrefix.length);
    if (ownerId) {
      // A "final" fence is a durable, verified commit: keep its records and only drop the stale claim.
      let finalCommit = false;
      try {
        const rawFence = localStorage.getItem(`${lockKey}_fence_${ownerId}`);
        const parsedFence = rawFence ? JSON.parse(rawFence) : null;
        finalCommit = isFinalCompletionFence(parsedFence, ownerId, parsedFence?.ticket);
      } catch {}
      if (!finalCommit) {
        // Expired owner without a "final" fence never completed: abort its staged records and fence.
        if (lockKey === MIGRATION_LOCK_KEY) {
          try {
            localStorage.removeItem(`${MIGRATION_META_KEY}_commit_${ownerId}`);
          } catch {}
          try {
            localStorage.removeItem(`${MIGRATION_SEQ_KEY}_commit_${ownerId}`);
          } catch {}
        }
        try {
          localStorage.removeItem(`${lockKey}_fence_${ownerId}`);
        } catch {}
      }
    }
    try {
      localStorage.removeItem(expiredClaimKey);
    } catch {}
  };

  // Phase 4: Two-pass Bakery verification over all contender keys (pure read/verify after final write)
  for (let pass = 0; pass < 2; pass++) {
    try {
      const checkNow = Date.now();
      if (!hasRemainingSelfLease(checkNow, 35) || hasUnexpiredDirectLock(checkNow)) {
        cleanupOwnClaim();
        return false;
      }

      const allKeys = getAllLocalStorageKeys();
      for (const k of allKeys) {
        if (k.startsWith(claimPrefix) && k !== claimKey) {
          let otherRaw = localStorage.getItem(k);
          if (!otherRaw) continue;
          let otherClaim: {
            owner?: string;
            phase?: string;
            ticket?: number;
            claimTime?: number;
            acquiredAt?: number;
            expiresAt?: number;
          } | null = null;
          try {
            otherClaim = JSON.parse(otherRaw);
          } catch {
            otherClaim = null;
          }
          if (!otherClaim || typeof otherClaim !== "object") {
            evictExpiredClaimRecord(k);
            continue;
          }

          if (!isClaimActive(otherClaim, Date.now())) {
            evictExpiredClaimRecord(k, otherClaim.owner);
            continue;
          }

          // If another contender is currently in the "choosing" doorway, wait briefly (bounded)
          // for it to publish its ticket; if it stays in "choosing", abort rather than racing past it.
          if (otherClaim.phase === "choosing") {
            const waitStart = Date.now();
            let spins = 0;
            while (Date.now() - waitStart < 3 && ++spins < 40) {
              otherRaw = localStorage.getItem(k);
              if (!otherRaw) {
                otherClaim = null;
                break;
              }
              try {
                otherClaim = JSON.parse(otherRaw);
              } catch {
                otherClaim = null;
                break;
              }
              if (
                !otherClaim ||
                !isClaimActive(otherClaim, Date.now()) ||
                otherClaim.phase !== "choosing"
              ) {
                break;
              }
            }
            if (
              otherClaim &&
              isClaimActive(otherClaim, Date.now()) &&
              otherClaim.phase === "choosing"
            ) {
              cleanupOwnClaim();
              return false;
            }
          }

          if (!otherClaim || !isClaimActive(otherClaim, Date.now())) {
            if (otherClaim) {
              evictExpiredClaimRecord(k, otherClaim.owner);
            }
            continue;
          }

          const otherTicket =
            typeof otherClaim.ticket === "number" && otherClaim.ticket > 0
              ? otherClaim.ticket
              : typeof otherClaim.claimTime === "number" && otherClaim.claimTime > 0
              ? otherClaim.claimTime
              : 0;
          const otherOwner = otherClaim.owner || k.slice(claimPrefix.length);

          if (
            otherTicket <= 0 ||
            otherTicket < myTicket ||
            (otherTicket === myTicket && otherOwner < lockOwnerId)
          ) {
            cleanupOwnClaim();
            return false;
          }
        }
      }
    } catch {
      cleanupOwnClaim();
      return false;
    }
  }

  // Phase 5: Final self-claim integrity & remaining lease check before entering critical section
  try {
    if (!hasRemainingSelfLease(Date.now(), 30) || hasUnexpiredDirectLock(Date.now())) {
      cleanupOwnClaim();
      return false;
    }
    const selfVerifyRaw = localStorage.getItem(claimKey);
    const postReadNow = Date.now();
    if (!selfVerifyRaw || !hasRemainingSelfLease(postReadNow, 30)) {
      cleanupOwnClaim();
      return false;
    }
    const selfVerify = JSON.parse(selfVerifyRaw);
    if (
      !selfVerify ||
      selfVerify.owner !== lockOwnerId ||
      selfVerify.phase !== "claimed" ||
      selfVerify.ticket !== myTicket ||
      typeof selfVerify.expiresAt !== "number" ||
      postReadNow + 30 >= selfVerify.expiresAt
    ) {
      cleanupOwnClaim();
      return false;
    }
  } catch {
    cleanupOwnClaim();
    return false;
  }

  activeLockTickets.set(lockKey, { owner: lockOwnerId, ticket: myTicket, ttlMs: effectiveTtlMs });
  return true;
}

/**
 * Revalidates that the current lock holder still exclusively owns `lockKey`, that its finite
 * crash-recovery lease has not expired, and that it has not been superseded by a newer fencing
 * token or competing claim. When valid, extends the lease on the owner's dedicated claim key
 * and verifies that the previous lease remained unexpired through the extension write.
 */
export function verifyCrossTabLockOwnership(lockKey: string, lockOwnerId?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return true;
  const active = activeLockTickets.get(lockKey);
  const ownerToCheck = lockOwnerId || active?.owner;
  if (!ownerToCheck) return false;
  if (active && lockOwnerId && active.owner !== lockOwnerId) return false;

  const claimPrefix = `${lockKey}_claim_`;
  const claimKey = `${claimPrefix}${ownerToCheck}`;
  const fenceKey = `${lockKey}_fence`;
  const fencePrefix = `${lockKey}_fence_`;
  const metaCommitPrefix = `${MIGRATION_META_KEY}_commit_`;
  const seqCommitPrefix = `${MIGRATION_SEQ_KEY}_commit_`;
  const extensionMs = active?.ttlMs && active.ttlMs > 0 ? active.ttlMs : 400;
  const now = Date.now();

  const isClaimRecordUnexpired = (
    claim: { expiresAt?: unknown; acquiredAt?: unknown } | null | undefined,
    checkNow: number
  ): boolean => {
    if (!claim || typeof claim !== "object") return false;
    if (typeof claim.expiresAt === "number" && Number.isFinite(claim.expiresAt)) {
      return claim.expiresAt > checkNow;
    }
    if (typeof claim.acquiredAt === "number" && Number.isFinite(claim.acquiredAt)) {
      return claim.acquiredAt + extensionMs > checkNow;
    }
    return false;
  };

  try {
    // 1. Verify no conflicting unexpired direct lock exists on lockKey
    const rawDirect = localStorage.getItem(lockKey);
    if (rawDirect) {
      try {
        const directParsed = JSON.parse(rawDirect);
        if (directParsed && typeof directParsed === "object") {
          if (isClaimRecordUnexpired(directParsed, now) && directParsed.owner !== ownerToCheck) {
            return false;
          }
        }
      } catch {
        return false;
      }
    }

    // 2. Verify own claim record is intact, claimed, and currently unexpired
    const rawSelf = localStorage.getItem(claimKey);
    const afterSelfReadNow = Date.now();
    if (!rawSelf) return false;
    const selfClaim = JSON.parse(rawSelf);
    if (
      !selfClaim ||
      selfClaim.owner !== ownerToCheck ||
      selfClaim.phase !== "claimed" ||
      typeof selfClaim.ticket !== "number"
    ) {
      return false;
    }
    if (active && selfClaim.ticket !== active.ticket) {
      return false;
    }
    if (!isClaimRecordUnexpired(selfClaim, afterSelfReadNow)) {
      return false;
    }

    const previousExpiresAt =
      typeof selfClaim.expiresAt === "number" && Number.isFinite(selfClaim.expiresAt)
        ? selfClaim.expiresAt
        : (typeof selfClaim.acquiredAt === "number" ? selfClaim.acquiredAt : afterSelfReadNow) + extensionMs;
    const myTicket: number = selfClaim.ticket;

    // 3. Verify fencing token has not advanced to another owner
    const rawFence = localStorage.getItem(fenceKey);
    if (rawFence) {
      try {
        const fence = JSON.parse(rawFence);
        if (fence && typeof fence.ticket === "number") {
          if (fence.ticket > myTicket || (fence.ticket === myTicket && fence.owner && fence.owner !== ownerToCheck)) {
            return false;
          }
        }
      } catch {
        return false;
      }
    }

    // 4. Verify no other claim, per-owner fence, or fenced commit record has superseded our ticket
    const allKeys = getAllLocalStorageKeys();
    for (const k of allKeys) {
      if (k.startsWith(claimPrefix) && k !== claimKey) {
        const otherRaw = localStorage.getItem(k);
        if (!otherRaw) continue;
        try {
          const otherClaim = JSON.parse(otherRaw);
          if (!otherClaim || typeof otherClaim !== "object") continue;
          const otherTicket = typeof otherClaim.ticket === "number" ? otherClaim.ticket : 0;
          const otherOwner = typeof otherClaim.owner === "string" ? otherClaim.owner : k.slice(claimPrefix.length);
          if (otherTicket > myTicket && otherOwner !== ownerToCheck) {
            return false;
          }
          if (!isClaimRecordUnexpired(otherClaim, Date.now())) {
            continue;
          }
          if (otherClaim.phase === "claimed" && otherClaim.owner !== ownerToCheck) {
            if (
              otherTicket <= 0 ||
              otherTicket < myTicket ||
              (otherTicket === myTicket && otherOwner < ownerToCheck)
            ) {
              return false;
            }
          }
        } catch {}
      } else if (
        k.startsWith(fencePrefix) ||
        (lockKey === MIGRATION_LOCK_KEY && (k.startsWith(metaCommitPrefix) || k.startsWith(seqCommitPrefix)))
      ) {
        const otherRaw = localStorage.getItem(k);
        if (!otherRaw) continue;
        try {
          const parsedRecord = JSON.parse(otherRaw);
          if (parsedRecord && typeof parsedRecord.ticket === "number") {
            if (
              parsedRecord.ticket > myTicket ||
              (parsedRecord.ticket === myTicket && parsedRecord.owner && parsedRecord.owner !== ownerToCheck)
            ) {
              return false;
            }
          }
        } catch {}
      }
    }

    // 5. Extend the active lease on our own dedicated claimKey while still unexpired,
    // and verify after the write completes that previousExpiresAt had still not elapsed
    // so there was zero gap in lease validity.
    const preExtendNow = Date.now();
    if (preExtendNow >= previousExpiresAt) {
      return false;
    }
    const newExpiresAt = preExtendNow + extensionMs;
    const updatedClaim = JSON.stringify({
      ...selfClaim,
      expiresAt: newExpiresAt,
    });
    localStorage.setItem(claimKey, updatedClaim);
    if (localStorage.getItem(claimKey) !== updatedClaim) {
      return false;
    }
    const postExtendNow = Date.now();
    if (postExtendNow >= previousExpiresAt || postExtendNow >= newExpiresAt) {
      try {
        localStorage.removeItem(claimKey);
      } catch {}
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function abortFencedCommitsForOwner(lockOwnerId: string): void {
  if (typeof window === "undefined" || !window.localStorage || !lockOwnerId) return;
  try {
    localStorage.removeItem(`${MIGRATION_META_KEY}_commit_${lockOwnerId}`);
  } catch {}
  try {
    localStorage.removeItem(`${MIGRATION_SEQ_KEY}_commit_${lockOwnerId}`);
  } catch {}
}

/**
 * Prunes lower-ticket per-owner commit and completion-fence keys ONLY AFTER the current owner's
 * completion fence (`${lockKey}_fence_${lockOwnerId}`) has been durably persisted and verified.
 */
function pruneSupersededFencedRecords(lockKey: string, lockOwnerId: string, sealedTicket: number): void {
  if (typeof window === "undefined" || !window.localStorage || !lockOwnerId || sealedTicket <= 0) return;

  const ownerFenceKey = `${lockKey}_fence_${lockOwnerId}`;
  const fencePrefix = `${lockKey}_fence_`;
  const metaCommitPrefix = `${MIGRATION_META_KEY}_commit_`;
  const seqCommitPrefix = `${MIGRATION_SEQ_KEY}_commit_`;
  const ownMetaCommitKey = `${metaCommitPrefix}${lockOwnerId}`;
  const ownSeqCommitKey = `${seqCommitPrefix}${lockOwnerId}`;

  const hasOwnMetaCommit = lockKey === MIGRATION_LOCK_KEY && localStorage.getItem(ownMetaCommitKey) !== null;
  const hasOwnSeqCommit = lockKey === MIGRATION_LOCK_KEY && localStorage.getItem(ownSeqCommitKey) !== null;

  try {
    const allKeys = getAllLocalStorageKeys();
    for (const k of allKeys) {
      if (hasOwnMetaCommit && k.startsWith(metaCommitPrefix) && k !== ownMetaCommitKey) {
        const rawOther = localStorage.getItem(k);
        if (!rawOther) continue;
        try {
          const parsedOther = JSON.parse(rawOther);
          if (parsedOther && typeof parsedOther.ticket === "number" && parsedOther.ticket < sealedTicket) {
            localStorage.removeItem(k);
          }
        } catch {
          try {
            localStorage.removeItem(k);
          } catch {}
        }
      } else if (hasOwnSeqCommit && k.startsWith(seqCommitPrefix) && k !== ownSeqCommitKey) {
        const rawOther = localStorage.getItem(k);
        if (!rawOther) continue;
        try {
          const parsedOther = JSON.parse(rawOther);
          if (parsedOther && typeof parsedOther.ticket === "number" && parsedOther.ticket < sealedTicket) {
            localStorage.removeItem(k);
          }
        } catch {
          try {
            localStorage.removeItem(k);
          } catch {}
        }
      }
    }

    const remainingKeys = getAllLocalStorageKeys();
    for (const k of remainingKeys) {
      if (k.startsWith(fencePrefix) && k !== ownerFenceKey) {
        const otherOwner = k.slice(fencePrefix.length);
        if (
          lockKey === MIGRATION_LOCK_KEY &&
          (localStorage.getItem(`${metaCommitPrefix}${otherOwner}`) !== null ||
            localStorage.getItem(`${seqCommitPrefix}${otherOwner}`) !== null)
        ) {
          continue;
        }
        const rawOther = localStorage.getItem(k);
        if (!rawOther) continue;
        try {
          const parsedOther = JSON.parse(rawOther);
          if (parsedOther && typeof parsedOther.ticket === "number" && parsedOther.ticket < sealedTicket) {
            localStorage.removeItem(k);
          }
        } catch {
          try {
            localStorage.removeItem(k);
          } catch {}
        }
      }
    }
  } catch {}
}

/**
 * Durably seals the current owner's completion fence (`${lockKey}_fence_${lockOwnerId}`):
 * `"sealing"` -> post-write timestamp capture -> `"sealed"` -> post-write lease check -> `"final"`.
 * `"final"` records a fact already verified in-lease and is the only state other contexts accept.
 * The claim is never part of authorization, so removing it (in-lease or not) cannot validate a commit.
 * Superseded lower-ticket records are pruned only after `"final"` is durable and verified.
 */
function sealCrossTabLockCompletionFence(lockKey: string, explicitOwnerId?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return true;
  const active = activeLockTickets.get(lockKey);
  const lockOwnerId = explicitOwnerId || active?.owner;
  if (!lockOwnerId) return false;

  if (!verifyCrossTabLockOwnership(lockKey, lockOwnerId)) {
    return false;
  }

  const claimKey = `${lockKey}_claim_${lockOwnerId}`;
  const ownerFenceKey = `${lockKey}_fence_${lockOwnerId}`;

  let myTicket = active?.ticket || 0;
  let sealLeaseExpiresAt = 0;
  try {
    const rawClaim = localStorage.getItem(claimKey);
    if (!rawClaim) return false;
    const parsedClaim = JSON.parse(rawClaim);
    if (
      !parsedClaim ||
      parsedClaim.owner !== lockOwnerId ||
      parsedClaim.phase !== "claimed" ||
      typeof parsedClaim.ticket !== "number" ||
      typeof parsedClaim.expiresAt !== "number" ||
      Date.now() >= parsedClaim.expiresAt
    ) {
      return false;
    }
    myTicket = parsedClaim.ticket;
    sealLeaseExpiresAt = parsedClaim.expiresAt;
  } catch {
    return false;
  }

  // Phase 1: Write unsealed "sealing" fence record (no pre-write timestamp)
  const ownMetaCommitKey = `${MIGRATION_META_KEY}_commit_${lockOwnerId}`;
  const ownSeqCommitKey = `${MIGRATION_SEQ_KEY}_commit_${lockOwnerId}`;
  const hadMetaCommit = lockKey === MIGRATION_LOCK_KEY && localStorage.getItem(ownMetaCommitKey) !== null;
  const hadSeqCommit = lockKey === MIGRATION_LOCK_KEY && localStorage.getItem(ownSeqCommitKey) !== null;
  const sealingPayload = JSON.stringify({
    owner: lockOwnerId,
    ticket: myTicket,
    phase: "sealing",
    leaseExpiresAt: sealLeaseExpiresAt,
  });

  try {
    localStorage.setItem(ownerFenceKey, sealingPayload);
    if (localStorage.getItem(ownerFenceKey) !== sealingPayload) {
      try {
        localStorage.removeItem(ownerFenceKey);
      } catch {}
      return false;
    }
  } catch {
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    return false;
  }

  // Capture timestamp STRICTLY AFTER both the staged commit and the "sealing" fence write completed
  const verifiedAfterWriteAt = Date.now();
  if (verifiedAfterWriteAt >= sealLeaseExpiresAt || !verifyCrossTabLockOwnership(lockKey, lockOwnerId)) {
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    return false;
  }

  // Phase 2: Record post-write verified proof while claimKey is still held in localStorage
  const sealedPayload = JSON.stringify({
    owner: lockOwnerId,
    ticket: myTicket,
    phase: "sealed",
    leaseExpiresAt: sealLeaseExpiresAt,
    verifiedAfterWriteAt,
  });

  try {
    localStorage.setItem(ownerFenceKey, sealedPayload);
    if (localStorage.getItem(ownerFenceKey) !== sealedPayload) {
      try {
        localStorage.removeItem(ownerFenceKey);
      } catch {}
      return false;
    }
  } catch {
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    return false;
  }

  if (Date.now() >= sealLeaseExpiresAt || !verifyCrossTabLockOwnership(lockKey, lockOwnerId)) {
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    return false;
  }

  // Phase 3: The check above ran AFTER the "sealed" fence write completed, so it proves that every
  // covered write (staged records, "sealing" fence, "sealed" fence) landed inside the lease. Record
  // that verified fact as a "final" fence. "final" is the ONLY state readers accept from another
  // context; claim presence/absence never authorizes a commit.
  //
  // If this tab is suspended here and the lease expires, any other context that observes the expired
  // claim before "final" lands aborts the staged records (see isFencedCommitRecordValid /
  // evictExpiredClaimRecord), so a late "final" then has nothing to authorize. If nobody observed the
  // expiry, nobody could have acted on the opposite outcome, and the commit linearizes at the verified
  // point above.
  const finalPayload = JSON.stringify({
    owner: lockOwnerId,
    ticket: myTicket,
    phase: "final",
    leaseExpiresAt: sealLeaseExpiresAt,
    verifiedAfterWriteAt,
  });
  try {
    localStorage.setItem(ownerFenceKey, finalPayload);
    if (localStorage.getItem(ownerFenceKey) !== finalPayload) {
      try {
        localStorage.removeItem(ownerFenceKey);
      } catch {}
      return false;
    }
  } catch {
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    return false;
  }

  // Report success only if this owner still held an unexpired claim AFTER "final" landed and the
  // staged records still exist. Any evictor must observe the claim as expired, which happens strictly
  // after this check, so it will then see "final" and keep the records.
  try {
    const rawClaimAfter = localStorage.getItem(claimKey);
    const claimAfter = rawClaimAfter ? JSON.parse(rawClaimAfter) : null;
    const stagedPresent =
      (!hadMetaCommit || localStorage.getItem(ownMetaCommitKey) !== null) &&
      (!hadSeqCommit || localStorage.getItem(ownSeqCommitKey) !== null);
    if (
      !claimAfter ||
      claimAfter.owner !== lockOwnerId ||
      claimAfter.ticket !== myTicket ||
      typeof claimAfter.expiresAt !== "number" ||
      Date.now() >= claimAfter.expiresAt ||
      !stagedPresent ||
      localStorage.getItem(ownerFenceKey) !== finalPayload
    ) {
      try {
        localStorage.removeItem(ownerFenceKey);
      } catch {}
      return false;
    }
  } catch {
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    return false;
  }

  // The new commit is durably final: superseded lower-ticket records can be pruned now.
  pruneSupersededFencedRecords(lockKey, lockOwnerId, myTicket);
  return true;
}

/** True when `fence` is a complete, in-lease `"final"` completion fence for owner/ticket. */
function isFinalCompletionFence(fence: unknown, owner: string, ticket: unknown): boolean {
  if (!fence || typeof fence !== "object") return false;
  const f = fence as {
    owner?: unknown;
    ticket?: unknown;
    phase?: unknown;
    leaseExpiresAt?: unknown;
    verifiedAfterWriteAt?: unknown;
  };
  return (
    f.owner === owner &&
    f.ticket === ticket &&
    f.phase === "final" &&
    typeof f.leaseExpiresAt === "number" &&
    Number.isFinite(f.leaseExpiresAt) &&
    typeof f.verifiedAfterWriteAt === "number" &&
    Number.isFinite(f.verifiedAfterWriteAt) &&
    f.verifiedAfterWriteAt > 0 &&
    f.verifiedAfterWriteAt < f.leaseExpiresAt
  );
}

export function releaseCrossTabLock(lockKey: string, lockOwnerId: string): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const claimKey = `${lockKey}_claim_${lockOwnerId}`;
  activeClaimKeysForUnload.delete(claimKey);
  const active = activeLockTickets.get(lockKey);
  const releasedTicket = active && active.owner === lockOwnerId ? active.ticket : 0;
  const ownerFenceKey = `${lockKey}_fence_${lockOwnerId}`;
  if (releasedTicket > 0 && localStorage.getItem(ownerFenceKey) === null) {
    // For direct tryAcquireCrossTabLock / releaseCrossTabLock callers outside withCrossTabLock
    sealCrossTabLockCompletionFence(lockKey, lockOwnerId);
  }
  if (active && active.owner === lockOwnerId) {
    activeLockTickets.delete(lockKey);
  }
  try {
    const raw = localStorage.getItem(lockKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.owner === lockOwnerId) {
        localStorage.removeItem(lockKey);
      }
    }
  } catch {}
  // Claim removal never authorizes anything (readers require a "final" fence). It is still skipped
  // while a non-final fence of ours remains (e.g. failure cleanup could not delete it), so the
  // claim stays as expired-owner evidence and the leftover fence/records are aborted on expiry.
  let removeClaim = true;
  try {
    const rawOwnFence = localStorage.getItem(ownerFenceKey);
    if (rawOwnFence !== null) {
      const parsedOwnFence = JSON.parse(rawOwnFence);
      removeClaim = isFinalCompletionFence(parsedOwnFence, lockOwnerId, parsedOwnFence?.ticket);
    }
  } catch {
    removeClaim = false;
  }
  if (removeClaim) {
    try {
      localStorage.removeItem(claimKey);
    } catch {}
  }
  try {
    localStorage.removeItem(`${lockKey}_intent_${lockOwnerId}`);
  } catch {}
}

/**
 * Executes a callback with exclusive cross-tab mutual exclusion in localStorage.
 * Uses a finite crash-recoverable lease (default 400 ms) that is revalidated and extended
 * across critical-section steps, and durably seals the owner completion fence before returning
 * so an expired, superseded, or unsealed owner never commits or reports success.
 */
export function withCrossTabLock<T>(lockKey: string, fn: () => T, maxWaitMs = 80, ttlMs = 400): T | null {
  if (typeof window === "undefined" || !window.localStorage) {
    return fn();
  }
  const lockOwnerId = generateLockOwnerId();
  const startTime = Date.now();
  const maxAttempts = Math.max(1, Math.min(5, Math.ceil(maxWaitMs / 15)));
  let acquired = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0 && Date.now() - startTime >= maxWaitMs) {
      break;
    }
    lastLockStorageWriteError = false;
    if (tryAcquireCrossTabLock(lockKey, lockOwnerId, ttlMs)) {
      acquired = true;
      break;
    }
    // If storage rejected the claim write (e.g. near quota), do not busy-wait or retry
    if (lastLockStorageWriteError) {
      break;
    }
    if (attempt < maxAttempts - 1 && Date.now() - startTime < maxWaitMs) {
      const jitter = Math.floor(Math.random() * 3) + 1;
      const pauseStart = Date.now();
      let spins = 0;
      while (Date.now() - pauseStart < jitter && ++spins < 40) {}
    }
  }

  if (!acquired) {
    // Critical section must NOT be run without exclusive ownership!
    return null;
  }

  let verifiedSuccess = false;
  try {
    const result = fn();
    if (result === null || result === false) {
      if (lockKey === MIGRATION_LOCK_KEY) {
        abortFencedCommitsForOwner(lockOwnerId);
      }
      return result;
    }
    if (!sealCrossTabLockCompletionFence(lockKey, lockOwnerId)) {
      if (lockKey === MIGRATION_LOCK_KEY) {
        abortFencedCommitsForOwner(lockOwnerId);
      }
      try {
        localStorage.removeItem(`${lockKey}_fence_${lockOwnerId}`);
      } catch {}
      return null;
    }
    verifiedSuccess = true;
    return result;
  } finally {
    if (!verifiedSuccess) {
      const active = activeLockTickets.get(lockKey);
      if (active && active.owner === lockOwnerId) {
        activeLockTickets.delete(lockKey);
      }
      if (lockKey === MIGRATION_LOCK_KEY) {
        abortFencedCommitsForOwner(lockOwnerId);
      }
      try {
        localStorage.removeItem(`${lockKey}_fence_${lockOwnerId}`);
      } catch {}
    }
    releaseCrossTabLock(lockKey, lockOwnerId);
  }
}

function extractQuarantinedAt(b: unknown): number {
  if (typeof b === "object" && b !== null && "quarantinedAt" in b) {
    const qAt = (b as { quarantinedAt: unknown }).quarantinedAt;
    if (typeof qAt === "number") return qAt;
  }
  return 0;
}

function isLocalStorageReadable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    localStorage.getItem(MIGRATION_SEQ_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether a per-owner fenced commit record is valid:
 * 1. A complete `"final"` completion fence (finite `leaseExpiresAt` and `verifiedAfterWriteAt`,
 *    `verifiedAfterWriteAt < leaseExpiresAt`) for the same owner/ticket is required for any reader
 *    other than the in-memory owner. Legacy, `"sealing"` or `"sealed"` fences are not accepted.
 * 2. Otherwise only the in-memory owner holding an unexpired claim may read its own staged record.
 * 3. An expired or absent claim without a `"final"` fence aborts the staged records and fence.
 */
function isFencedCommitRecordValid(
  record: {
    owner?: unknown;
    ticket?: unknown;
    leaseExpiresAt?: unknown;
  } | null | undefined,
  now: number
): boolean {
  if (!record || typeof record !== "object") return false;
  if (typeof record.owner !== "string" || !record.owner) return false;
  if (typeof record.ticket !== "number" || !Number.isFinite(record.ticket) || record.ticket <= 0) return false;
  if (typeof record.leaseExpiresAt !== "number" || !Number.isFinite(record.leaseExpiresAt)) return false;

  const claimKey = `${MIGRATION_LOCK_KEY}_claim_${record.owner}`;
  const ownerFenceKey = `${MIGRATION_LOCK_KEY}_fence_${record.owner}`;
  try {
    const rawOwnerFence = localStorage.getItem(ownerFenceKey);
    const parsedFence = rawOwnerFence ? JSON.parse(rawOwnerFence) : null;

    // 1. A complete "final" fence is the only cross-context proof of a commit. It is written only
    //    after a post-write check proved every covered write landed inside the owner's lease.
    if (isFinalCompletionFence(parsedFence, record.owner, record.ticket)) {
      return true;
    }

    // 2. Not final. The in-memory owner may still read its own staged records while it holds an
    //    unexpired claim; another tab's unexpired claim means that commit is still in progress.
    const rawClaim = localStorage.getItem(claimKey);
    if (rawClaim) {
      const parsedClaim = JSON.parse(rawClaim);
      const expiresAt =
        parsedClaim && typeof parsedClaim.expiresAt === "number"
          ? parsedClaim.expiresAt
          : parsedClaim && typeof parsedClaim.acquiredAt === "number"
          ? parsedClaim.acquiredAt + 400
          : 0;
      if (expiresAt > now) {
        const active = activeLockTickets.get(MIGRATION_LOCK_KEY);
        return !!active && active.owner === record.owner;
      }
    }

    // 3. Claim expired or absent without a "final" fence: the owner never finalized. Claim removal
    //    alone never authorizes a commit, so abort the staged records, the fence and any stale claim.
    abortFencedCommitsForOwner(record.owner);
    try {
      localStorage.removeItem(ownerFenceKey);
    } catch {}
    if (rawClaim) {
      try {
        localStorage.removeItem(claimKey);
      } catch {}
    }
    return false;
  } catch {
    return false;
  }
}

function readCommittedMigrationMetaRaw(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const legacyRaw = localStorage.getItem(MIGRATION_META_KEY);
  const commitPrefix = `${MIGRATION_META_KEY}_commit_`;
  const now = Date.now();

  let bestTicket = -1;
  let bestOwner = "";
  let bestSerialized: string | null = null;

  try {
    const allKeys = getAllLocalStorageKeys();
    for (const k of allKeys) {
      if (k.startsWith(commitPrefix)) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (!isFencedCommitRecordValid(parsed, now)) {
            continue;
          }
          const ticket: number = parsed.ticket;
          const owner: string = parsed.owner;
          const serialized =
            typeof parsed.serialized === "string"
              ? parsed.serialized
              : parsed.meta && typeof parsed.meta === "object"
              ? JSON.stringify(parsed.meta)
              : null;
          if (!serialized) continue;
          if (ticket > bestTicket || (ticket === bestTicket && owner > bestOwner)) {
            bestTicket = ticket;
            bestOwner = owner;
            bestSerialized = serialized;
          }
        } catch {}
      }
    }
  } catch {}

  return bestSerialized !== null ? bestSerialized : legacyRaw;
}

function readCommittedMigrationSeq(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  let maxSeq = 0;
  try {
    const reservedRaw = localStorage.getItem(MIGRATION_SEQ_KEY);
    if (reservedRaw) {
      const storedSeq = Number(reservedRaw);
      if (!isNaN(storedSeq) && storedSeq > 0) {
        maxSeq = Math.max(maxSeq, storedSeq);
      }
    }
  } catch {}

  const seqCommitPrefix = `${MIGRATION_SEQ_KEY}_commit_`;
  const now = Date.now();
  try {
    const allKeys = getAllLocalStorageKeys();
    for (const k of allKeys) {
      if (k.startsWith(seqCommitPrefix)) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        try {
          const parsed = JSON.parse(raw);
          if (!isFencedCommitRecordValid(parsed, now)) {
            continue;
          }
          if (typeof parsed.seq === "number" && Number.isFinite(parsed.seq) && parsed.seq > maxSeq) {
            maxSeq = parsed.seq;
          }
        } catch {}
      }
    }
  } catch {}

  return maxSeq;
}

/**
 * Stages a sequence reservation to a per-owner fenced key (`${MIGRATION_SEQ_KEY}_commit_${lockOwnerId}`)
 * BEFORE performing the post-stage ownership and lease-continuity check. Does not prune prior
 * committed records until the owner's completion fence is durably sealed.
 */
function stageFencedMigrationSeq(seq: number, explicitOwnerId?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const active = activeLockTickets.get(MIGRATION_LOCK_KEY);
  const lockOwnerId = explicitOwnerId || active?.owner;
  if (!lockOwnerId) return false;

  if (!verifyCrossTabLockOwnership(MIGRATION_LOCK_KEY, lockOwnerId)) {
    return false;
  }

  const claimKey = `${MIGRATION_LOCK_KEY}_claim_${lockOwnerId}`;
  const seqCommitKey = `${MIGRATION_SEQ_KEY}_commit_${lockOwnerId}`;

  let myTicket = active?.ticket || 0;
  let stageLeaseExpiresAt = 0;
  try {
    const rawClaim = localStorage.getItem(claimKey);
    if (!rawClaim) return false;
    const parsedClaim = JSON.parse(rawClaim);
    if (
      !parsedClaim ||
      parsedClaim.owner !== lockOwnerId ||
      parsedClaim.phase !== "claimed" ||
      typeof parsedClaim.ticket !== "number" ||
      typeof parsedClaim.expiresAt !== "number" ||
      Date.now() >= parsedClaim.expiresAt
    ) {
      return false;
    }
    myTicket = parsedClaim.ticket;
    stageLeaseExpiresAt = parsedClaim.expiresAt;
  } catch {
    return false;
  }

  const seqPayload = JSON.stringify({
    owner: lockOwnerId,
    ticket: myTicket,
    leaseExpiresAt: stageLeaseExpiresAt,
    seq,
  });
  try {
    localStorage.setItem(seqCommitKey, seqPayload);
    if (localStorage.getItem(seqCommitKey) !== seqPayload) {
      try {
        localStorage.removeItem(seqCommitKey);
      } catch {}
      return false;
    }
  } catch {
    try {
      localStorage.removeItem(seqCommitKey);
    } catch {}
    return false;
  }

  if (Date.now() >= stageLeaseExpiresAt || !verifyCrossTabLockOwnership(MIGRATION_LOCK_KEY, lockOwnerId)) {
    try {
      localStorage.removeItem(seqCommitKey);
    } catch {}
    return false;
  }

  return true;
}

function commitFencedMigrationSeq(seq: number, explicitOwnerId?: string): boolean {
  const active = activeLockTickets.get(MIGRATION_LOCK_KEY);
  const lockOwnerId = explicitOwnerId || active?.owner;
  if (!lockOwnerId) return false;

  return stageFencedMigrationSeq(seq, lockOwnerId);
}

/**
 * Stages merged migration metadata to a per-owner fenced key (`${MIGRATION_META_KEY}_commit_${lockOwnerId}`)
 * and verifies post-stage lease continuity without pruning any prior lower-ticket commit records.
 * Final commit sealing (`${MIGRATION_LOCK_KEY}_fence_${lockOwnerId}`) and pruning of superseded
 * records occur in `sealCrossTabLockCompletionFence` inside `withCrossTabLock` before lock release.
 */
function commitFencedMigrationMetadata(merged: MigrationMeta, explicitOwnerId?: string): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const active = activeLockTickets.get(MIGRATION_LOCK_KEY);
  const lockOwnerId = explicitOwnerId || active?.owner;
  if (!lockOwnerId) return false;

  if (!verifyCrossTabLockOwnership(MIGRATION_LOCK_KEY, lockOwnerId)) {
    return false;
  }

  const claimKey = `${MIGRATION_LOCK_KEY}_claim_${lockOwnerId}`;
  const metaCommitKey = `${MIGRATION_META_KEY}_commit_${lockOwnerId}`;

  let myTicket = active?.ticket || 0;
  let stageLeaseExpiresAt = 0;
  try {
    const rawClaim = localStorage.getItem(claimKey);
    if (!rawClaim) return false;
    const parsedClaim = JSON.parse(rawClaim);
    if (
      !parsedClaim ||
      parsedClaim.owner !== lockOwnerId ||
      parsedClaim.phase !== "claimed" ||
      typeof parsedClaim.ticket !== "number" ||
      typeof parsedClaim.expiresAt !== "number" ||
      Date.now() >= parsedClaim.expiresAt
    ) {
      return false;
    }
    myTicket = parsedClaim.ticket;
    stageLeaseExpiresAt = parsedClaim.expiresAt;
  } catch {
    return false;
  }

  // Stage to per-owner fenced commit key BEFORE the post-stage ownership & lease check
  const serialized = JSON.stringify(merged);
  const commitPayload = JSON.stringify({
    owner: lockOwnerId,
    ticket: myTicket,
    leaseExpiresAt: stageLeaseExpiresAt,
    meta: merged,
    serialized,
  });

  try {
    localStorage.setItem(metaCommitKey, commitPayload);
    if (localStorage.getItem(metaCommitKey) !== commitPayload) {
      try {
        localStorage.removeItem(metaCommitKey);
      } catch {}
      return false;
    }
  } catch {
    try {
      localStorage.removeItem(metaCommitKey);
    } catch {}
    return false;
  }

  if (Date.now() >= stageLeaseExpiresAt || !verifyCrossTabLockOwnership(MIGRATION_LOCK_KEY, lockOwnerId)) {
    try {
      localStorage.removeItem(metaCommitKey);
    } catch {}
    return false;
  }

  if (typeof merged.operationSeq === "number" && merged.operationSeq > 0) {
    const currentReserved = readCommittedMigrationSeq();
    if (merged.operationSeq > currentReserved) {
      if (!stageFencedMigrationSeq(merged.operationSeq, lockOwnerId)) {
        abortFencedCommitsForOwner(lockOwnerId);
        return false;
      }
    }
  }

  return true;
}

/**
 * Reserves a monotonic operation sequence timestamp strictly greater than any previously
 * observed sequence or quarantine/clear timestamp across all browsing contexts, serialized via
 * cross-tab locking and per-owner fenced sequence reservation in localStorage.
 *
 * Uses a single bounded lock acquisition path and commits to a per-owner fenced key verified
 * and sealed against the active lease so an expired owner can never overwrite newer reservations.
 */
export function getNextMigrationOpSeq(meta?: MigrationMeta): number | null {
  if (!isLocalStorageReadable()) {
    const now = typeof Date !== "undefined" && Date.now ? Date.now() : 1;
    const seq = Math.max(now, lastMigrationOpSeq + 1);
    lastMigrationOpSeq = seq;
    if (meta) meta.operationSeq = seq;
    return seq;
  }

  const reservedSeq = withCrossTabLock(MIGRATION_LOCK_KEY, () => {
    const now = typeof Date !== "undefined" && Date.now ? Date.now() : 1;
    let maxSeq = Math.max(now, lastMigrationOpSeq + 1);

    try {
      const storedSeq = readCommittedMigrationSeq();
      if (storedSeq > 0) {
        maxSeq = Math.max(maxSeq, storedSeq + 1);
      }

      const raw = readCommittedMigrationMetaRaw();
      if (raw) {
        const disk = JSON.parse(raw);
        if (typeof disk.operationSeq === "number") {
          maxSeq = Math.max(maxSeq, disk.operationSeq + 1);
        }
        if (disk.clearedQuarantineKeys) {
          for (const v of Object.values(disk.clearedQuarantineKeys)) {
            if (typeof v === "number") maxSeq = Math.max(maxSeq, v + 1);
          }
        }
        if (disk.quarantinedLegacyBuckets) {
          for (const b of Object.values(disk.quarantinedLegacyBuckets)) {
            const qAt = extractQuarantinedAt(b);
            if (qAt > 0) maxSeq = Math.max(maxSeq, qAt + 1);
          }
        }
      }
    } catch {}

    if (meta) {
      if (typeof meta.operationSeq === "number") {
        maxSeq = Math.max(maxSeq, meta.operationSeq + 1);
      }
      if (meta.clearedQuarantineKeys) {
        for (const v of Object.values(meta.clearedQuarantineKeys)) {
          if (typeof v === "number") maxSeq = Math.max(maxSeq, v + 1);
        }
      }
      if (meta.quarantinedLegacyBuckets) {
        for (const b of Object.values(meta.quarantinedLegacyBuckets)) {
          const qAt = extractQuarantinedAt(b);
          if (qAt > 0) maxSeq = Math.max(maxSeq, qAt + 1);
        }
      }
    }

    if (!commitFencedMigrationSeq(maxSeq)) {
      return null;
    }

    return maxSeq;
  }, 80);

  if (typeof reservedSeq === "number") {
    lastMigrationOpSeq = reservedSeq;
    if (meta) {
      meta.operationSeq = reservedSeq;
    }
    return reservedSeq;
  }

  return null;
}

const BASE_META_SYMBOL = Symbol("palluvo_migration_meta_base");

type MigrationMetaWithBase = MigrationMeta & {
  [BASE_META_SYMBOL]?: MigrationMeta;
};

function cloneMigrationMetaSnapshot(meta: MigrationMeta): MigrationMeta {
  return {
    migratedCollisionIds: { ...(meta.migratedCollisionIds || {}) },
    quarantinedCollisionIds: { ...(meta.quarantinedCollisionIds || {}) },
    quarantinedLegacyBuckets: { ...(meta.quarantinedLegacyBuckets || {}) },
    tombstonedKeys: { ...(meta.tombstonedKeys || {}) },
    failedQuarantineKeys: { ...(meta.failedQuarantineKeys || {}) },
    rekeyedOwnerIds: { ...(meta.rekeyedOwnerIds || {}) },
    clearedQuarantineKeys: { ...(meta.clearedQuarantineKeys || {}) },
    unresolvedPhoneAliases: { ...(meta.unresolvedPhoneAliases || {}) },
    operationSeq: typeof meta.operationSeq === "number" ? meta.operationSeq : 0,
  };
}

function attachBaseMigrationMetadata(target: MigrationMeta, baseSource?: MigrationMeta): MigrationMeta {
  (target as MigrationMetaWithBase)[BASE_META_SYMBOL] = cloneMigrationMetaSnapshot(baseSource || target);
  return target;
}

function parseMigrationMetaRaw(raw: string | null): {
  meta: MigrationMeta;
  hasLegacyBooleanClears: boolean;
} {
  const parsed = raw ? JSON.parse(raw) : {};
  let maxHistoricalQ = 0;
  if (parsed.quarantinedLegacyBuckets) {
    for (const b of Object.values(parsed.quarantinedLegacyBuckets)) {
      maxHistoricalQ = Math.max(maxHistoricalQ, extractQuarantinedAt(b));
    }
  }
  if (parsed.unresolvedPhoneAliases) {
    for (const b of Object.values(parsed.unresolvedPhoneAliases)) {
      maxHistoricalQ = Math.max(maxHistoricalQ, extractQuarantinedAt(b));
    }
  }

  let hasLegacyBooleanClears = false;
  const rawCleared: Record<string, number | boolean> = parsed.clearedQuarantineKeys || {};
  const upgradedCleared: Record<string, number | boolean> = {};
  const upgradeBaseTime = Math.max(Date.now(), maxHistoricalQ + 1);

  for (const [k, v] of Object.entries(rawCleared)) {
    if (typeof v === "number") {
      upgradedCleared[k] = v;
    } else if (v === true) {
      hasLegacyBooleanClears = true;
      upgradedCleared[k] = upgradeBaseTime;
    }
  }

  const meta: MigrationMeta = {
    migratedCollisionIds: parsed.migratedCollisionIds || {},
    quarantinedCollisionIds: parsed.quarantinedCollisionIds || {},
    quarantinedLegacyBuckets: parsed.quarantinedLegacyBuckets || {},
    tombstonedKeys: parsed.tombstonedKeys || {},
    failedQuarantineKeys: parsed.failedQuarantineKeys || {},
    rekeyedOwnerIds: parsed.rekeyedOwnerIds || {},
    clearedQuarantineKeys: upgradedCleared,
    unresolvedPhoneAliases: parsed.unresolvedPhoneAliases || {},
    operationSeq: Math.max(parsed.operationSeq || 0, hasLegacyBooleanClears ? upgradeBaseTime : 0),
  };

  return { meta, hasLegacyBooleanClears };
}

export function getMigrationMetadata(): MigrationMeta {
  if (typeof window === "undefined" || !window.localStorage) {
    return attachBaseMigrationMetadata({
      migratedCollisionIds: {},
      quarantinedCollisionIds: {},
      quarantinedLegacyBuckets: {},
      tombstonedKeys: {},
      failedQuarantineKeys: {},
      rekeyedOwnerIds: {},
      clearedQuarantineKeys: {},
      unresolvedPhoneAliases: {},
      operationSeq: 0,
    });
  }

  try {
    const raw = readCommittedMigrationMetaRaw();
    const { meta: result, hasLegacyBooleanClears } = parseMigrationMetaRaw(raw);
    attachBaseMigrationMetadata(result);

    if (hasLegacyBooleanClears) {
      try {
        const mergedUpgrade = withCrossTabLock(MIGRATION_LOCK_KEY, () => {
          const latestRaw = readCommittedMigrationMetaRaw();
          const { meta: latestDisk } = parseMigrationMetaRaw(latestRaw);
          // Merge legacy upgrade with latest disk metadata to prevent dropping concurrent writes
          const merged = mergeMigrationMetadata(latestDisk, result);
          if (!commitFencedMigrationMetadata(merged)) {
            return null;
          }
          return attachBaseMigrationMetadata(merged);
        });
        if (mergedUpgrade) {
          return mergedUpgrade;
        }
      } catch {}
      // If cross-tab lock could not be acquired, DO NOT write to disk without exclusive ownership!
      // Defer persistence to the normal merged write path while returning result with in-memory upgraded clears.
    }

    return result;
  } catch {
    return attachBaseMigrationMetadata({
      migratedCollisionIds: {},
      quarantinedCollisionIds: {},
      quarantinedLegacyBuckets: {},
      tombstonedKeys: {},
      failedQuarantineKeys: {},
      rekeyedOwnerIds: {},
      clearedQuarantineKeys: {},
      unresolvedPhoneAliases: {},
      operationSeq: 0,
    });
  }
}

export function setMigrationMetadata(meta: MigrationMeta): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  try {
    let committedMerged: MigrationMeta | null = null;
    const persisted = withCrossTabLock(MIGRATION_LOCK_KEY, () => {
      if (!verifyCrossTabLockOwnership(MIGRATION_LOCK_KEY)) {
        return false;
      }

      // Re-read and merge the latest on-disk metadata inside the critical section before serializing
      // so concurrent markers added by another tab are never overwritten by a stale snapshot.
      let latestDisk: MigrationMeta;
      try {
        const latestRaw = readCommittedMigrationMetaRaw();
        latestDisk = parseMigrationMetaRaw(latestRaw).meta;
      } catch {
        latestDisk = {
          migratedCollisionIds: {},
          quarantinedCollisionIds: {},
          quarantinedLegacyBuckets: {},
          tombstonedKeys: {},
          failedQuarantineKeys: {},
          rekeyedOwnerIds: {},
          clearedQuarantineKeys: {},
          unresolvedPhoneAliases: {},
          operationSeq: 0,
        };
      }

      const merged = mergeMigrationMetadata(latestDisk, meta);
      if (!commitFencedMigrationMetadata(merged)) {
        return false;
      }

      committedMerged = merged;
      return true;
    });
    if (persisted === true && committedMerged) {
      Object.assign(meta, committedMerged);
      attachBaseMigrationMetadata(meta, committedMerged);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Merges a local migration metadata snapshot with current on-disk migration metadata,
 * ensuring that newly discovered or persisted failure markers (failedQuarantineKeys)
 * are retained until verified/succeeded, preserving quarantine buckets and tombstone markers,
 * while honoring explicitly cleared quarantine state and intentional caller removals.
 */
export function mergeMigrationMetadata(
  currentDiskMeta: MigrationMeta,
  snapshotMeta: MigrationMeta
): MigrationMeta {
  const baseMeta = (snapshotMeta as MigrationMetaWithBase)?.[BASE_META_SYMBOL];

  // Find max historical quarantine timestamp to ensure legacy boolean clears are upgraded with proper ordering semantics
  let maxHistoricalQ = 0;
  for (const meta of [currentDiskMeta, snapshotMeta]) {
    if (meta?.quarantinedLegacyBuckets) {
      for (const b of Object.values(meta.quarantinedLegacyBuckets)) {
        maxHistoricalQ = Math.max(maxHistoricalQ, extractQuarantinedAt(b));
      }
    }
  }
  const upgradeBaseTime = Math.max(Date.now(), maxHistoricalQ + 1);

  // 1. Union cleared keys, taking the latest timestamp for each key (unless explicitly deleted from baseMeta)
  const mergedClearedKeys: Record<string, number | boolean> = {};
  for (const [k, v] of Object.entries(currentDiskMeta.clearedQuarantineKeys || {})) {
    const wasExplicitlyDeletedByCaller =
      baseMeta?.clearedQuarantineKeys !== undefined &&
      Object.prototype.hasOwnProperty.call(baseMeta.clearedQuarantineKeys, k) &&
      !Object.prototype.hasOwnProperty.call(snapshotMeta.clearedQuarantineKeys || {}, k);
    if (!wasExplicitlyDeletedByCaller) {
      mergedClearedKeys[k] = v === true ? upgradeBaseTime : v;
    }
  }
  for (const [k, v] of Object.entries(snapshotMeta.clearedQuarantineKeys || {})) {
    const existingTime = getClearedAtTimestamp(mergedClearedKeys[k], maxHistoricalQ);
    const incomingVal = v === true ? upgradeBaseTime : v;
    const incomingTime = getClearedAtTimestamp(incomingVal, maxHistoricalQ);
    if (incomingTime >= existingTime) {
      mergedClearedKeys[k] = incomingVal;
    }
  }

  // 2. Fresh failed retries & backup failures in snapshotMeta take precedence over earlier clears
  const mergedFailedKeys: Record<string, boolean> = {};
  if (snapshotMeta.failedQuarantineKeys) {
    for (const [key, isFailed] of Object.entries(snapshotMeta.failedQuarantineKeys)) {
      if (isFailed) {
        if (key.startsWith("retry_migration_")) {
          // Fresh retry failure: current attempt failed and overrides earlier clear
          delete mergedClearedKeys[key];
          mergedFailedKeys[key] = true;
        } else if (key.startsWith("deferred_quarantine_")) {
          // Deferred quarantine sequence reservation: retain guard and supersede earlier clears for this bucket
          const sourceId = key.slice("deferred_quarantine_".length);
          const safeId = sourceId.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
          delete mergedClearedKeys[key];
          delete mergedClearedKeys[sourceId];
          delete mergedClearedKeys[safeId];
          delete mergedClearedKeys[`palluvo_ecommerce_orders_${sourceId}`];
          delete mergedClearedKeys[`palluvo_ecommerce_orders_${safeId}`];
          delete mergedClearedKeys[`palluvo_ecommerce_addresses_${sourceId}`];
          delete mergedClearedKeys[`palluvo_ecommerce_addresses_${safeId}`];
          delete mergedClearedKeys[`retry_migration_${sourceId}`];
          delete mergedClearedKeys[`retry_migration_${safeId}`];
          mergedFailedKeys[key] = true;
        } else {
          try {
            if (typeof window !== "undefined" && window.localStorage) {
              const val = localStorage.getItem(key);
              const qVal = localStorage.getItem(`palluvo_quarantine_${key}`);
              const isBackupVerified = (val === null && qVal !== null) || (val !== null && qVal === val);
              if (!isBackupVerified) {
                delete mergedClearedKeys[key];
                mergedFailedKeys[key] = true;
              }
            } else {
              delete mergedClearedKeys[key];
              mergedFailedKeys[key] = true;
            }
          } catch {
            delete mergedClearedKeys[key];
            mergedFailedKeys[key] = true;
          }
        }
      }
    }
  }

  // Also include failed keys from currentDiskMeta if not explicitly cleared or resolved by snapshotMeta
  for (const [key, isFailed] of Object.entries(currentDiskMeta.failedQuarantineKeys || {})) {
    if (isFailed && !mergedClearedKeys[key]) {
      const wasExplicitlyResolvedByCaller =
        baseMeta?.failedQuarantineKeys !== undefined &&
        Boolean(baseMeta.failedQuarantineKeys[key]) &&
        !snapshotMeta.failedQuarantineKeys?.[key];
      if (!wasExplicitlyResolvedByCaller) {
        mergedFailedKeys[key] = true;
      }
    }
  }

  // 3. Resolve clear-vs-quarantine by operation generation:
  // If quarantine is newer than or equal to clear marker, newer quarantine supersedes old clear!
  const allQuarantinedBuckets = new Map<string, { quarantinedAt: number; emails: string[] }>();
  for (const [k, v] of Object.entries(currentDiskMeta.quarantinedLegacyBuckets || {})) {
    allQuarantinedBuckets.set(k, v);
  }
  for (const [k, v] of Object.entries(snapshotMeta.quarantinedLegacyBuckets || {})) {
    const existing = allQuarantinedBuckets.get(k);
    if (!existing || ((v.quarantinedAt || 0) >= (existing.quarantinedAt || 0))) {
      allQuarantinedBuckets.set(k, {
        quarantinedAt: Math.max(existing?.quarantinedAt || 0, v.quarantinedAt || 0),
        emails: Array.from(new Set([...(existing?.emails || []), ...(v.emails || [])])),
      });
    }
  }

  for (const [bucketId, bucketInfo] of allQuarantinedBuckets.entries()) {
    const qAt = bucketInfo.quarantinedAt || 0;
    const clAt = getClearedAtTimestamp(mergedClearedKeys[bucketId], qAt);
    const safeId = bucketId.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
    const clSafeAt = getClearedAtTimestamp(mergedClearedKeys[safeId], qAt);
    const maxClAt = Math.max(clAt, clSafeAt);

    // If quarantine is newer than or equal to both clear markers, quarantine wins to preserve safety guard!
    // (A real quarantine retains the guard on a shared legacy bucket unless an explicit clear is strictly newer)
    if (qAt > 0 && (maxClAt === 0 || qAt >= maxClAt)) {
      // Newer or concurrent quarantine supersedes stale clear markers!
      delete mergedClearedKeys[bucketId];
      delete mergedClearedKeys[safeId];
      delete mergedClearedKeys[`palluvo_ecommerce_orders_${bucketId}`];
      delete mergedClearedKeys[`palluvo_ecommerce_orders_${safeId}`];
      delete mergedClearedKeys[`palluvo_ecommerce_addresses_${bucketId}`];
      delete mergedClearedKeys[`palluvo_ecommerce_addresses_${safeId}`];
      delete mergedClearedKeys[`retry_migration_${bucketId}`];
      delete mergedClearedKeys[`retry_migration_${safeId}`];
      for (const em of bucketInfo.emails || []) {
        const lowerEm = em.toLowerCase().trim();
        const sanitized = lowerEm.replace(/[^a-z0-9_.-]/g, "_");
        delete mergedClearedKeys[`palluvo_ecommerce_orders_${lowerEm}`];
        delete mergedClearedKeys[`palluvo_ecommerce_addresses_${lowerEm}`];
        delete mergedClearedKeys[`palluvo_ecommerce_orders_${sanitized}`];
        delete mergedClearedKeys[`palluvo_ecommerce_addresses_${sanitized}`];
        delete mergedClearedKeys[`palluvo_ecommerce_orders_usr_email_${sanitized}`];
        delete mergedClearedKeys[`palluvo_ecommerce_addresses_usr_email_${sanitized}`];
        delete mergedClearedKeys[`retry_migration_${lowerEm}`];
        delete mergedClearedKeys[`retry_migration_${sanitized}`];
        delete mergedClearedKeys[`retry_migration_usr_email_${sanitized}`];
      }
    }
  }

  const mergedLegacyBuckets: Record<string, { quarantinedAt: number; emails: string[] }> = {};
  for (const [k, v] of allQuarantinedBuckets.entries()) {
    const safeK = k.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
    const qAt = v.quarantinedAt || 0;
    const maxClAt = Math.max(
      getClearedAtTimestamp(mergedClearedKeys[k], qAt),
      getClearedAtTimestamp(mergedClearedKeys[safeK], qAt)
    );
    // Quarantine remains in mergedLegacyBuckets if newer than or equal to clear (preserving safety guard)
    if (maxClAt === 0 || qAt >= maxClAt) {
      mergedLegacyBuckets[k] = v;
    }
  }

  const mergedCollisionIds: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(currentDiskMeta.quarantinedCollisionIds || {})) {
    const safeK = k.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
    const maxClAt = Math.max(
      getClearedAtTimestamp(mergedClearedKeys[k]),
      getClearedAtTimestamp(mergedClearedKeys[safeK])
    );
    if (maxClAt === 0) {
      mergedCollisionIds[k] = [...(v || [])];
    }
  }
  if (snapshotMeta.quarantinedCollisionIds) {
    for (const [k, v] of Object.entries(snapshotMeta.quarantinedCollisionIds)) {
      const safeK = k.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
      const maxClAt = Math.max(
        getClearedAtTimestamp(mergedClearedKeys[k]),
        getClearedAtTimestamp(mergedClearedKeys[safeK])
      );
      if (maxClAt === 0) {
        mergedCollisionIds[k] = Array.from(new Set([...(mergedCollisionIds[k] || []), ...(v || [])]));
      }
    }
  }

  const mergedMigratedCollisionIds: Record<string, string[]> = {
    ...(currentDiskMeta.migratedCollisionIds || {}),
  };
  if (snapshotMeta.migratedCollisionIds) {
    for (const [k, v] of Object.entries(snapshotMeta.migratedCollisionIds)) {
      mergedMigratedCollisionIds[k] = Array.from(new Set([...(mergedMigratedCollisionIds[k] || []), ...(v || [])]));
    }
  }

  const mergedTombstonedKeys: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(currentDiskMeta.tombstonedKeys || {})) {
    if (v && !mergedClearedKeys[k]) {
      mergedTombstonedKeys[k] = true;
    }
  }
  if (snapshotMeta.tombstonedKeys) {
    for (const [k, v] of Object.entries(snapshotMeta.tombstonedKeys)) {
      if (v && !mergedClearedKeys[k]) {
        mergedTombstonedKeys[k] = true;
      }
    }
  }

  const mergedRekeyed: Record<string, string> = {};
  for (const [k, v] of Object.entries(currentDiskMeta.rekeyedOwnerIds || {})) {
    const wasExplicitlyDeletedByCaller =
      baseMeta?.rekeyedOwnerIds !== undefined &&
      Object.prototype.hasOwnProperty.call(baseMeta.rekeyedOwnerIds, k) &&
      !Object.prototype.hasOwnProperty.call(snapshotMeta.rekeyedOwnerIds || {}, k);
    if (!wasExplicitlyDeletedByCaller) {
      mergedRekeyed[k] = v;
    }
  }
  for (const [k, v] of Object.entries(snapshotMeta.rekeyedOwnerIds || {})) {
    mergedRekeyed[k] = v;
  }
  for (const failedKey of Object.keys(mergedFailedKeys)) {
    if (failedKey.startsWith("retry_migration_")) {
      const sourceId = failedKey.slice("retry_migration_".length);
      delete mergedRekeyed[sourceId];
      const safeId = sourceId.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
      delete mergedRekeyed[safeId];
    }
  }

  const mergedUnresolvedPhones: Record<
    string,
    {
      legacyId: string;
      candidateAccountIds: string[];
      candidateEmails: string[];
      quarantinedAt: number;
    }
  > = {};
  for (const [k, v] of Object.entries(currentDiskMeta.unresolvedPhoneAliases || {})) {
    const wasExplicitlyResolvedByCaller =
      baseMeta?.unresolvedPhoneAliases !== undefined &&
      Object.prototype.hasOwnProperty.call(baseMeta.unresolvedPhoneAliases, k) &&
      !Object.prototype.hasOwnProperty.call(snapshotMeta.unresolvedPhoneAliases || {}, k);
    if (!wasExplicitlyResolvedByCaller) {
      mergedUnresolvedPhones[k] = v;
    }
  }
  for (const [k, v] of Object.entries(snapshotMeta.unresolvedPhoneAliases || {})) {
    mergedUnresolvedPhones[k] = v;
  }

  const mergedResult: MigrationMeta = {
    migratedCollisionIds: mergedMigratedCollisionIds,
    quarantinedCollisionIds: mergedCollisionIds,
    quarantinedLegacyBuckets: mergedLegacyBuckets,
    tombstonedKeys: mergedTombstonedKeys,
    failedQuarantineKeys: mergedFailedKeys,
    clearedQuarantineKeys: mergedClearedKeys,
    rekeyedOwnerIds: mergedRekeyed,
    unresolvedPhoneAliases: mergedUnresolvedPhones,
    operationSeq: Math.max(
      currentDiskMeta.operationSeq || 0,
      snapshotMeta.operationSeq || 0,
      Date.now()
    ),
  };

  return attachBaseMigrationMetadata(mergedResult, baseMeta || currentDiskMeta);
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
    const meta = getMigrationMetadata();

    // 1. Never mask failed or deferred quarantine guards
    if (
      meta.failedQuarantineKeys?.[`deferred_quarantine_${trimmed}`] ||
      meta.failedQuarantineKeys?.[`deferred_quarantine_${safeId}`] ||
      meta.failedQuarantineKeys?.[`palluvo_ecommerce_orders_${safeId}`] ||
      meta.failedQuarantineKeys?.[`palluvo_ecommerce_orders_${trimmed}`] ||
      meta.failedQuarantineKeys?.[`palluvo_ecommerce_addresses_${safeId}`] ||
      meta.failedQuarantineKeys?.[`palluvo_ecommerce_addresses_${trimmed}`]
    ) {
      return true;
    }

    const bucketInfo = meta.quarantinedLegacyBuckets?.[trimmed] || meta.quarantinedLegacyBuckets?.[safeId];
    const qAt = bucketInfo?.quarantinedAt || 0;

    const clAt = Math.max(
      getClearedAtTimestamp(meta.clearedQuarantineKeys?.[trimmed], qAt),
      getClearedAtTimestamp(meta.clearedQuarantineKeys?.[safeId], qAt)
    );

    // A newer or equal quarantine retains the safety guard on a shared legacy bucket
    if (bucketInfo && (clAt === 0 || qAt >= clAt)) {
      return true;
    }

    // Only mask quarantine/tombstone if explicitly cleared strictly after quarantine
    if (clAt > 0 && clAt > qAt) {
      return false;
    }

    if (
      localStorage.getItem(`palluvo_tombstone_${safeId}`) === "1" ||
      localStorage.getItem(`palluvo_tombstone_${trimmed}`) === "1"
    ) {
      return true;
    }
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
    const meta = getMigrationMetadata();

    // 1. Never mask failed quarantine backups: unverified/failed backup source keys must remain quarantined!
    if (meta.failedQuarantineKeys?.[key]) {
      return true;
    }

    const match = key.match(/^palluvo_ecommerce_(?:orders|addresses)_(.+)$/);
    const suffix = match ? match[1] : undefined;
    const safeSuffix = suffix ? suffix.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`) : undefined;

    // Check failed or deferred quarantine keys on suffix variants
    if (
      suffix &&
      (meta.failedQuarantineKeys?.[`deferred_quarantine_${suffix}`] ||
        meta.failedQuarantineKeys?.[`palluvo_ecommerce_orders_${suffix}`] ||
        meta.failedQuarantineKeys?.[`palluvo_ecommerce_addresses_${suffix}`])
    ) {
      if (key.includes(suffix)) return true;
    }
    if (
      safeSuffix &&
      (meta.failedQuarantineKeys?.[`deferred_quarantine_${safeSuffix}`] ||
        meta.failedQuarantineKeys?.[`palluvo_ecommerce_orders_${safeSuffix}`] ||
        meta.failedQuarantineKeys?.[`palluvo_ecommerce_addresses_${safeSuffix}`])
    ) {
      if (key.includes(safeSuffix)) return true;
    }

    // 2. Check operation generation: compare quarantine timestamp against clear timestamp
    const bucketInfo = suffix
      ? (meta.quarantinedLegacyBuckets?.[suffix] ||
         meta.quarantinedLegacyBuckets?.[suffix.toLowerCase()] ||
         (safeSuffix ? meta.quarantinedLegacyBuckets?.[safeSuffix] : undefined))
      : undefined;
    const qAt = bucketInfo?.quarantinedAt || 0;

    const clKeyAt = getClearedAtTimestamp(meta.clearedQuarantineKeys?.[key], qAt);
    const clSuffixAt = suffix
      ? Math.max(
          getClearedAtTimestamp(meta.clearedQuarantineKeys?.[suffix], qAt),
          getClearedAtTimestamp(meta.clearedQuarantineKeys?.[suffix.toLowerCase()], qAt),
          safeSuffix ? getClearedAtTimestamp(meta.clearedQuarantineKeys?.[safeSuffix], qAt) : 0
        )
      : 0;
    const clAt = Math.max(clKeyAt, clSuffixAt);

    // If quarantine is newer than or equal to clear: QUARANTINE WINS to preserve safety guard!
    if (bucketInfo && (clAt === 0 || qAt >= clAt)) {
      return true;
    }

    // Only mask if explicitly cleared strictly after quarantine
    if (clAt > 0 && clAt > qAt) {
      return false;
    }

    if (localStorage.getItem(`palluvo_tombstone_${key}`) === "1") {
      return true;
    }
    if (localStorage.getItem(`palluvo_quarantine_${key}`) !== null) {
      return true;
    }
    if (meta.tombstonedKeys?.[key]) {
      return true;
    }
    if (suffix) {
      if (
        meta.quarantinedLegacyBuckets?.[suffix] ||
        meta.quarantinedLegacyBuckets?.[suffix.toLowerCase()] ||
        (safeSuffix && meta.quarantinedLegacyBuckets?.[safeSuffix]) ||
        meta.quarantinedCollisionIds?.[suffix] ||
        meta.quarantinedCollisionIds?.[suffix.toLowerCase()] ||
        (safeSuffix && meta.quarantinedCollisionIds?.[safeSuffix]) ||
        localStorage.getItem(`palluvo_tombstone_${suffix}`) === "1" ||
        localStorage.getItem(`palluvo_tombstone_${suffix.toLowerCase()}`) === "1" ||
        (safeSuffix && localStorage.getItem(`palluvo_tombstone_${safeSuffix}`) === "1")
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
export function quarantineLegacyBucket(accountId: string, relatedEmails?: string[], callerMeta?: MigrationMeta): void {
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

    const retryKeysToClear = new Set<string>([
      `retry_migration_${trimmedId}`,
      `retry_migration_${safeId}`,
    ]);

    if (relatedEmails) {
      for (const email of relatedEmails) {
        if (!email) continue;
        const lowerEmail = email.toLowerCase().trim();
        const legacySanitized = lowerEmail.replace(/[^a-z0-9_.-]/g, "_");
        const legacyBucketId = getDirectLegacyEmailId(lowerEmail);
        keysToQuarantine.add(`palluvo_ecommerce_orders_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_orders_usr_email_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_addresses_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_addresses_usr_email_${legacySanitized}`);
        keysToQuarantine.add(`palluvo_ecommerce_orders_${lowerEmail}`);
        keysToQuarantine.add(`palluvo_ecommerce_addresses_${lowerEmail}`);

        retryKeysToClear.add(`retry_migration_${lowerEmail}`);
        retryKeysToClear.add(`retry_migration_${legacySanitized}`);
        retryKeysToClear.add(`retry_migration_${legacyBucketId}`);
      }
    }

    const migrationMeta = getMigrationMetadata();
    migrationMeta.quarantinedLegacyBuckets = migrationMeta.quarantinedLegacyBuckets || {};
    migrationMeta.quarantinedCollisionIds = migrationMeta.quarantinedCollisionIds || {};
    migrationMeta.tombstonedKeys = migrationMeta.tombstonedKeys || {};
    migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
    if (migrationMeta.clearedQuarantineKeys) {
      delete migrationMeta.clearedQuarantineKeys[trimmedId];
      delete migrationMeta.clearedQuarantineKeys[safeId];
      for (const key of keysToQuarantine) {
        delete migrationMeta.clearedQuarantineKeys[key];
      }
      for (const rKey of retryKeysToClear) {
        delete migrationMeta.clearedQuarantineKeys[rKey];
      }
    }

    for (const rKey of retryKeysToClear) {
      try {
        localStorage.removeItem(`palluvo_tombstone_${rKey}`);
      } catch {}
    }

    // If caller snapshot was passed, also prune clear markers from the caller snapshot
    if (callerMeta) {
      callerMeta.quarantinedLegacyBuckets = callerMeta.quarantinedLegacyBuckets || {};
      callerMeta.quarantinedCollisionIds = callerMeta.quarantinedCollisionIds || {};
      callerMeta.tombstonedKeys = callerMeta.tombstonedKeys || {};
      callerMeta.failedQuarantineKeys = callerMeta.failedQuarantineKeys || {};
      if (callerMeta.clearedQuarantineKeys) {
        delete callerMeta.clearedQuarantineKeys[trimmedId];
        delete callerMeta.clearedQuarantineKeys[safeId];
        for (const key of keysToQuarantine) {
          delete callerMeta.clearedQuarantineKeys[key];
        }
        for (const rKey of retryKeysToClear) {
          delete callerMeta.clearedQuarantineKeys[rKey];
        }
      }
      for (const key of keysToQuarantine) {
        callerMeta.tombstonedKeys[key] = true;
      }
    }

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
            if (callerMeta?.failedQuarantineKeys?.[key]) {
              delete callerMeta.failedQuarantineKeys[key];
            }
          } else {
            // Backup failed (e.g. QuotaExceededError).
            // Preserve the source bucket and keep it from hydration until safely handled.
            migrationMeta.failedQuarantineKeys[key] = true;
            if (callerMeta) {
              callerMeta.failedQuarantineKeys = callerMeta.failedQuarantineKeys || {};
              callerMeta.failedQuarantineKeys[key] = true;
            }
          }
        }
      } catch {}
    }

    // Retry any previously failed quarantine keys
    if (migrationMeta.failedQuarantineKeys) {
      for (const failedKey of Object.keys(migrationMeta.failedQuarantineKeys)) {
        if (!keysToQuarantine.has(failedKey)) {
          // Skip retry_migration_* and deferred_quarantine_* sentinels: these are metadata sentinels,
          // not localStorage storage keys. They must only be cleared when their corresponding operation succeeds.
          if (failedKey.startsWith("retry_migration_") || failedKey.startsWith("deferred_quarantine_")) {
            continue;
          }
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
                if (callerMeta?.failedQuarantineKeys?.[failedKey]) {
                  delete callerMeta.failedQuarantineKeys[failedKey];
                }
              }
            } else {
              delete migrationMeta.failedQuarantineKeys[failedKey];
              if (callerMeta?.failedQuarantineKeys?.[failedKey]) {
                delete callerMeta.failedQuarantineKeys[failedKey];
              }
            }
          } catch {}
        }
      }
    }

    const existingEmails = migrationMeta.quarantinedLegacyBuckets[trimmedId]?.emails || [];
    const normalizedRelated = relatedEmails ? relatedEmails.map((e) => e.toLowerCase().trim()) : [];
    const allEmails = Array.from(new Set([...existingEmails, ...normalizedRelated]));

    const quarantineTimestamp = getNextMigrationOpSeq(migrationMeta);
    if (quarantineTimestamp === null) {
      // Lock/sequence reservation failed (e.g. storage quota exceeded or contention timeout).
      // Surface and defer: record deferred quarantine sentinels in failedQuarantineKeys to preserve
      // the bucket guard and defer sequence assignment without freezing the page.
      migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
      migrationMeta.failedQuarantineKeys[`deferred_quarantine_${trimmedId}`] = true;
      migrationMeta.failedQuarantineKeys[`deferred_quarantine_${safeId}`] = true;
      if (allEmails.length > 0) {
        const existing = migrationMeta.quarantinedCollisionIds[trimmedId] || [];
        migrationMeta.quarantinedCollisionIds[trimmedId] = Array.from(
          new Set([...existing, ...allEmails])
        );
      }
      if (callerMeta) {
        callerMeta.failedQuarantineKeys = callerMeta.failedQuarantineKeys || {};
        callerMeta.failedQuarantineKeys[`deferred_quarantine_${trimmedId}`] = true;
        callerMeta.failedQuarantineKeys[`deferred_quarantine_${safeId}`] = true;
        if (allEmails.length > 0) {
          const existingCaller = callerMeta.quarantinedCollisionIds[trimmedId] || [];
          callerMeta.quarantinedCollisionIds[trimmedId] = Array.from(
            new Set([...existingCaller, ...allEmails])
          );
        }
      }
      setMigrationMetadata(migrationMeta);
      return;
    }

    if (migrationMeta.failedQuarantineKeys) {
      delete migrationMeta.failedQuarantineKeys[`deferred_quarantine_${trimmedId}`];
      delete migrationMeta.failedQuarantineKeys[`deferred_quarantine_${safeId}`];
    }
    if (callerMeta?.failedQuarantineKeys) {
      delete callerMeta.failedQuarantineKeys[`deferred_quarantine_${trimmedId}`];
      delete callerMeta.failedQuarantineKeys[`deferred_quarantine_${safeId}`];
    }

    migrationMeta.quarantinedLegacyBuckets[trimmedId] = {
      quarantinedAt: quarantineTimestamp,
      emails: allEmails,
    };
    migrationMeta.operationSeq = Math.max(migrationMeta.operationSeq || 0, quarantineTimestamp);
    if (allEmails.length > 0) {
      const existing = migrationMeta.quarantinedCollisionIds[trimmedId] || [];
      migrationMeta.quarantinedCollisionIds[trimmedId] = Array.from(
        new Set([...existing, ...allEmails])
      );
    }

    if (callerMeta) {
      callerMeta.quarantinedLegacyBuckets[trimmedId] = {
        quarantinedAt: quarantineTimestamp,
        emails: allEmails,
      };
      callerMeta.operationSeq = Math.max(callerMeta.operationSeq || 0, quarantineTimestamp);
      if (allEmails.length > 0) {
        const existingCaller = callerMeta.quarantinedCollisionIds[trimmedId] || [];
        callerMeta.quarantinedCollisionIds[trimmedId] = Array.from(
          new Set([...existingCaller, ...allEmails])
        );
      }
    }

    if (!setMigrationMetadata(migrationMeta)) {
      // Metadata write could not be persisted (e.g. cross-tab lock contention or quota error).
      // Keep deferred quarantine sentinels active so the bucket stays guarded and retries persistence.
      migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
      migrationMeta.failedQuarantineKeys[`deferred_quarantine_${trimmedId}`] = true;
      migrationMeta.failedQuarantineKeys[`deferred_quarantine_${safeId}`] = true;
      if (callerMeta) {
        callerMeta.failedQuarantineKeys = callerMeta.failedQuarantineKeys || {};
        callerMeta.failedQuarantineKeys[`deferred_quarantine_${trimmedId}`] = true;
        callerMeta.failedQuarantineKeys[`deferred_quarantine_${safeId}`] = true;
      }
    }
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
 * Checks whether an account ID is a strictly injective canonical email account ID.
 * Canonical injective IDs are either the special demo ID 'usr_demo_radhika'
 * or follow the scheme 'usr_email_' + encodeIdentifierToId(email), where non-alphanumerics
 * (including '@' as '_40_', '.' as '_2e_', '+' as '_2b_', '_' as '_5f_') are strictly hex-escaped.
 * Legacy sanitized IDs contain literal dots, hyphens, or unescaped characters, and do NOT contain '_40_'.
 */
export function isInjectiveEmailAccountId(id?: string | null): boolean {
  if (!id || typeof id !== "string") return false;
  const trimmed = id.trim();
  if (trimmed === "usr_demo_radhika") return true;
  if (!trimmed.startsWith("usr_email_")) return false;
  const token = trimmed.slice("usr_email_".length);
  return token.includes("_40_") && !token.includes(".") && !token.includes("@") && !token.includes("-");
}

/**
 * Returns the strictly injective canonical email account ID for a given email address.
 */
export function getInjectiveEmailAccountId(email: string): string {
  const norm = email.toLowerCase().trim();
  if (norm === "radhika.sharma@example.com") return "usr_demo_radhika";
  return `usr_email_${encodeIdentifierToId(norm)}`;
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
    `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${safeLegacyId}`,
    `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${legacyAccountId}`,
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
        const ownerEmail = typeof ordObj.ownerEmail === "string" ? ordObj.ownerEmail.toLowerCase().trim() : "";
        const userEmail = typeof ordObj.userEmail === "string" ? ordObj.userEmail.toLowerCase().trim() : "";

        for (const em of [custEmail, ordEmail, ownerEmail, userEmail]) {
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
          } else if (em) {
            hasAmbiguousOwner = true;
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
    `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${safeLegacyId}`,
    `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${legacyAccountId}`,
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
          } else if (em) {
            hasAmbiguousOwner = true;
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
  const isSameAccount = fromAccountId === toAccountId;
  if (isSameAccount && !options) return true;
  try {
    const filterEmail = (
      typeof options === "string" ? options : options?.filterByOwnerEmail
    )?.toLowerCase().trim();

    const allowedEmailsInput = (
      typeof options === "object" && options && Array.isArray(options.allowedEmails)
        ? options.allowedEmails
        : []
    );

    const meta = getAccountMetadata();
    const migrationMeta = getMigrationMetadata();

    const rawPhones = (
      typeof options === "object" && options && Array.isArray(options.verifiedPhones)
        ? options.verifiedPhones
        : []
    );
    const verifiedPhoneList = rawPhones
      .map((p) => normalizeExplicitPhoneToken(p))
      .filter((p): p is string => {
        if (!p) return false;
        if (
          meta[p]?.status === "unresolved" ||
          meta[`usr_phone_${p}`]?.status === "unresolved" ||
          migrationMeta.unresolvedPhoneAliases?.[p] ||
          migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${p}`]
        ) {
          return false;
        }
        return true;
      });

    const hasFilter = Boolean(filterEmail || allowedEmailsInput.length > 0 || verifiedPhoneList.length > 0);
    if (isSameAccount && !hasFilter) return true;

    const fromSafe = fromAccountId.toLowerCase().trim().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
    const toSafe = toAccountId.toLowerCase().trim().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
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

    const isPhoneVerified = (phoneCandidate?: string | null): boolean => {
      if (!phoneCandidate) return false;
      const norm = normalizeExplicitPhoneToken(phoneCandidate);
      if (!norm) return false;
      // Reject any unresolved marker unconditionally
      if (
        meta[norm]?.status === "unresolved" ||
        meta[phoneCandidate]?.status === "unresolved" ||
        meta[`usr_phone_${norm}`]?.status === "unresolved" ||
        meta[`usr_phone_${phoneCandidate}`]?.status === "unresolved" ||
        migrationMeta.unresolvedPhoneAliases?.[norm] ||
        migrationMeta.unresolvedPhoneAliases?.[phoneCandidate] ||
        migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${norm}`] ||
        migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${phoneCandidate}`]
      ) {
        return false;
      }
      if (verifiedPhoneList.includes(norm)) {
        const recordedOwner = meta[norm]?.ownerEmail?.toLowerCase().trim();
        if (recordedOwner) {
          const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
          if (resolvedOwner && !isEmailVerified(resolvedOwner)) {
            return false;
          }
        }
        return true;
      }
      const recordedOwner = meta[norm]?.ownerEmail?.toLowerCase().trim();
      if (recordedOwner) {
        const resolvedOwner = getVerifiedRootOwner(recordedOwner, meta);
        if (resolvedOwner && isEmailVerified(resolvedOwner)) {
          return true;
        }
      }
      return false;
    };

    const phoneOrderSourceKeys: string[] = [];
    for (const p of verifiedPhoneList) {
      phoneOrderSourceKeys.push(
        `palluvo_ecommerce_orders_usr_phone_${p}`,
        `palluvo_quarantine_palluvo_ecommerce_orders_usr_phone_${p}`,
        `palluvo_quarantine_foreign_palluvo_ecommerce_orders_usr_phone_${p}`
      );
    }
    const orderSources = Array.from(new Set([
      `palluvo_ecommerce_orders_${fromSafe}`,
      `palluvo_ecommerce_orders_${fromAccountId}`,
      `palluvo_quarantine_palluvo_ecommerce_orders_${fromSafe}`,
      `palluvo_quarantine_palluvo_ecommerce_orders_${fromAccountId}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${fromSafe}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${fromAccountId}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toSafe}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toAccountId}`,
      ...phoneOrderSourceKeys,
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

    const getOrderEmailClaims = (ord: Record<string, unknown>) => {
      const cust = ord.customer as Record<string, unknown> | undefined;
      const raw = [
        typeof cust?.email === "string" ? cust.email : "",
        typeof ord.email === "string" ? ord.email : "",
        typeof ord.ownerEmail === "string" ? ord.ownerEmail : "",
        typeof ord.userEmail === "string" ? ord.userEmail : "",
      ]
        .map((e) => e.toLowerCase().trim())
        .filter(Boolean);
      const uniqueRaw = Array.from(new Set(raw)).sort();
      const validEmails = uniqueRaw.filter((e) => e.includes("@"));
      const malformedClaims = uniqueRaw.filter((e) => !e.includes("@"));
      return { validEmails, malformedClaims, allRaw: uniqueRaw };
    };

    const getOrderClaimedPhones = (ord: Record<string, unknown>): string[] => {
      const tokens = extractExplicitPhoneTokens(ord);
      return Array.from(new Set(tokens)).sort();
    };

    const getOrderOwnerDiscriminator = (ord: Record<string, unknown>): string => {
      const { validEmails, malformedClaims } = getOrderEmailClaims(ord);
      const phones = getOrderClaimedPhones(ord);
      const parts: string[] = [];
      if (validEmails.length > 0) {
        parts.push(`em:${validEmails.join(",")}`);
      }
      if (malformedClaims.length > 0) {
        parts.push(`raw_em:${malformedClaims.join(",")}`);
      }
      if (phones.length > 0) {
        parts.push(`ph:${phones.join(",")}`);
      }
      return parts.length > 0 ? parts.join(";") : "unknown";
    };

    const getForeignOrderDedupKey = (ord: Record<string, unknown>): string => {
      const baseKey = getOrderDedupKey(ord);
      const ownerDisc = getOrderOwnerDiscriminator(ord);
      return `foreign:${ownerDisc}|${baseKey}`;
    };

    const getForeignOrderQuarantineBucketKey = (ord: Record<string, unknown>): string => {
      const { validEmails, malformedClaims } = getOrderEmailClaims(ord);
      if (malformedClaims.length > 0) {
        return "unknown";
      }
      if (validEmails.length > 0) {
        const rootOwners = Array.from(
          new Set(validEmails.map((e) => (resolveRootOwner(e, meta) || e).toLowerCase().trim()))
        );
        if (rootOwners.length === 1) {
          return rootOwners[0];
        }
        return "unknown";
      }
      const phones = getOrderClaimedPhones(ord);
      if (phones.length === 1) {
        return `usr_phone_${phones[0]}`;
      }
      return "unknown";
    };

    const getExactOrderRowKey = (ord: Record<string, unknown>): string => {
      const sortedKeys = Object.keys(ord).sort();
      const parts: string[] = [];
      for (const k of sortedKeys) {
        const val = ord[k];
        if (val !== undefined && typeof val !== "function") {
          parts.push(`${k}:${typeof val === "object" && val !== null ? JSON.stringify(val) : String(val)}`);
        }
      }
      return `exact_ord:${parts.join("|")}`;
    };

    const isOrderVerifiedForOwner = (ord: Record<string, unknown>, isSameBucket = false): boolean => {
      const { validEmails, malformedClaims } = getOrderEmailClaims(ord);
      const claimedPhones = getOrderClaimedPhones(ord);

      if (!filterEmail && allowedEmailSet.size === 0 && verifiedPhoneList.length === 0) {
        if (malformedClaims.length > 0) return false;
        if (validEmails.length > 1) {
          const root1 = (resolveRootOwner(validEmails[0], meta) || validEmails[0]).toLowerCase().trim();
          for (let i = 1; i < validEmails.length; i++) {
            const root2 = (resolveRootOwner(validEmails[i], meta) || validEmails[i]).toLowerCase().trim();
            if (root1 !== root2) {
              return false;
            }
          }
        }
        return true;
      }

      if (malformedClaims.length > 0) {
        return false;
      }

      if (validEmails.length > 0) {
        // Require every non-empty owner email to resolve to this account,
        // and fail closed on a conflict.
        return validEmails.every((e) => isEmailVerified(e));
      }

      // If no email was attached to the order:
      // When phone claims exist, require all phone claims to resolve unambiguously to this same owner.
      if (claimedPhones.length > 0) {
        return claimedPhones.every((p) => isPhoneVerified(p));
      }

      // If no email and no phone was attached to the order:
      // Records that already sit in the canonical / same-key bucket have no positive evidence
      // of another owner, so they must stay.
      if (isSameBucket) {
        return true;
      }

      return false;
    };

    const reviewAndRepairUnknownOrder = (ord: Record<string, unknown>): Record<string, unknown> | null => {
      const { validEmails, malformedClaims } = getOrderEmailClaims(ord);
      const claimedPhones = getOrderClaimedPhones(ord);

      if (malformedClaims.length === 0) {
        return null;
      }

      if (validEmails.length > 0 && !validEmails.every((e) => isEmailVerified(e))) {
        return null;
      }

      if (claimedPhones.length > 0 && !claimedPhones.every((p) => isPhoneVerified(p))) {
        return null;
      }

      for (const c of malformedClaims) {
        const recOwner = meta[c]?.ownerEmail?.toLowerCase().trim();
        if (recOwner) {
          const resOwner = getVerifiedRootOwner(recOwner, meta);
          if (resOwner && !isEmailVerified(resOwner)) {
            return null;
          }
        }
        const recAcc = meta[c]?.accountId;
        if (recAcc && recAcc !== toAccountId && recAcc !== fromAccountId && recAcc !== toSafe && recAcc !== fromSafe) {
          return null;
        }
      }

      const hasVerifiedEmail = validEmails.length > 0 && validEmails.every((e) => isEmailVerified(e));
      const hasVerifiedPhone = claimedPhones.length > 0 && claimedPhones.every((p) => isPhoneVerified(p));
      const hasDirectAccountClaim = malformedClaims.some((c) => {
        const lowerC = c.toLowerCase().trim();
        if (lowerC === toAccountId.toLowerCase() || lowerC === fromAccountId.toLowerCase() || lowerC === toSafe || lowerC === fromSafe) {
          return true;
        }
        const recOwner = meta[c]?.ownerEmail?.toLowerCase().trim();
        if (recOwner && isEmailVerified(recOwner)) {
          return true;
        }
        const recAcc = meta[c]?.accountId;
        return recAcc === toAccountId || recAcc === fromAccountId;
      });

      if (!hasVerifiedEmail && !hasVerifiedPhone && !hasDirectAccountClaim) {
        return null;
      }

      const repaired: Record<string, unknown> = { ...ord };
      const canonicalEmail = filterEmail || (validEmails.length > 0 ? validEmails[0] : "");
      if (canonicalEmail) {
        if (typeof repaired.ownerEmail === "string" && !repaired.ownerEmail.includes("@")) {
          repaired.ownerEmail = canonicalEmail;
        }
        if (typeof repaired.userEmail === "string" && !repaired.userEmail.includes("@")) {
          repaired.userEmail = canonicalEmail;
        }
        if (typeof repaired.email === "string" && !repaired.email.includes("@")) {
          repaired.email = canonicalEmail;
        }
      } else if (toAccountId) {
        if (typeof repaired.ownerEmail === "string" && !repaired.ownerEmail.includes("@")) {
          repaired.ownerEmail = toAccountId;
        }
        if (typeof repaired.userEmail === "string" && !repaired.userEmail.includes("@")) {
          repaired.userEmail = toAccountId;
        }
      }
      return repaired;
    };

    let sourceReadSuccess = true;

    // Load existing target orders
    const mergedOrders: Record<string, unknown>[] = [];
    const foreignOrders: Record<string, unknown>[] = [];
    const seenOrderKeys = new Set<string>();
    const seenForeignOrderKeys = new Set<string>();
    let targetOrdersFilteredCount = 0;
    let totalTargetOrdersRead = 0;

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
                totalTargetOrdersRead++;
                const ord = item as Record<string, unknown>;
                const isForeign = hasFilter && !isOrderVerifiedForOwner(ord, true);
                if (isForeign) {
                  targetOrdersFilteredCount++;
                  const foreignDedupKey = getForeignOrderDedupKey(ord);
                  if (!seenForeignOrderKeys.has(foreignDedupKey)) {
                    seenForeignOrderKeys.add(foreignDedupKey);
                    foreignOrders.push(ord);
                  }
                } else {
                  const dedupKey = getOrderDedupKey(ord);
                  if (!seenOrderKeys.has(dedupKey)) {
                    seenOrderKeys.add(dedupKey);
                    mergedOrders.push(ord);
                  }
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
          const isVerifiedOwner = isOrderVerifiedForOwner(ord, false);
          if (isVerifiedOwner) {
            const dedupKey = getOrderDedupKey(ord);
            if (!seenOrderKeys.has(dedupKey)) {
              seenOrderKeys.add(dedupKey);
              mergedOrders.push(ord);
            }
          } else if (hasFilter) {
            const foreignDedupKey = getForeignOrderDedupKey(ord);
            if (!seenForeignOrderKeys.has(foreignDedupKey)) {
              seenForeignOrderKeys.add(foreignDedupKey);
              foreignOrders.push(ord);
            }
          }
        }
      } catch {
        sourceReadSuccess = false;
      }
    }

    // Recover any legacy entries from shared unknown quarantine that positively belong to this account
    const claimedUnknownOrderCounts = new Map<string, number>();
    const unknownOrdersKey = "palluvo_quarantine_palluvo_ecommerce_orders_unknown";
    try {
      const rawUnknown = localStorage.getItem(unknownOrdersKey);
      if (rawUnknown && rawUnknown.trim()) {
        const parsed = JSON.parse(rawUnknown);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (!item || typeof item !== "object") continue;
            const ord = item as Record<string, unknown>;
            // Require affirmative ownership evidence to claim from unknown
            if (isOrderVerifiedForOwner(ord, false)) {
              const exactKey = getExactOrderRowKey(ord);
              claimedUnknownOrderCounts.set(exactKey, (claimedUnknownOrderCounts.get(exactKey) || 0) + 1);
              const dedupKey = getOrderDedupKey(ord);
              if (!seenOrderKeys.has(dedupKey)) {
                seenOrderKeys.add(dedupKey);
                mergedOrders.push(ord);
              }
            } else if (hasFilter) {
              const repaired = reviewAndRepairUnknownOrder(ord);
              if (repaired) {
                const exactKey = getExactOrderRowKey(ord);
                claimedUnknownOrderCounts.set(exactKey, (claimedUnknownOrderCounts.get(exactKey) || 0) + 1);
                const dedupKey = getOrderDedupKey(repaired);
                if (!seenOrderKeys.has(dedupKey)) {
                  seenOrderKeys.add(dedupKey);
                  mergedOrders.push(repaired);
                }
              }
            }
          }
        }
      }
    } catch {}

    let foreignOrdersQuarantineSuccess = true;

    if (foreignOrders.length > 0) {
      try {
        const ordersByForeignBucket = new Map<string, Record<string, unknown>[]>();
        for (const ord of foreignOrders) {
          const key = getForeignOrderQuarantineBucketKey(ord);
          if (!ordersByForeignBucket.has(key)) {
            ordersByForeignBucket.set(key, []);
          }
          ordersByForeignBucket.get(key)!.push(ord);
        }

        for (const [fKey, fOrds] of ordersByForeignBucket.entries()) {
          const fSafe = fKey.replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
          const qKey = `palluvo_quarantine_palluvo_ecommerce_orders_${fSafe}`;
          const existingRaw = localStorage.getItem(qKey);
          let existingList: Record<string, unknown>[] = [];
          if (existingRaw) {
            try {
              const p = JSON.parse(existingRaw);
              if (Array.isArray(p)) existingList = p;
            } catch {}
          }
          const seen = new Set(existingList.map(getForeignOrderDedupKey));
          for (const fo of fOrds) {
            const k = getForeignOrderDedupKey(fo);
            if (!seen.has(k)) {
              seen.add(k);
              existingList.push(fo);
            }
          }
          const serialized = JSON.stringify(existingList);
          localStorage.setItem(qKey, serialized);
          if (localStorage.getItem(qKey) !== serialized) {
            foreignOrdersQuarantineSuccess = false;
            break;
          }
        }

        if (foreignOrdersQuarantineSuccess) {
          const foreignQKey = `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toSafe}`;
          const existingForeignRaw = localStorage.getItem(foreignQKey);
          let existingForeignList: Record<string, unknown>[] = [];
          if (existingForeignRaw) {
            try {
              const p = JSON.parse(existingForeignRaw);
              if (Array.isArray(p)) existingForeignList = p;
            } catch {}
          }
          const foreignSeen = new Set(existingForeignList.map(getForeignOrderDedupKey));
          for (const fo of foreignOrders) {
            const k = getForeignOrderDedupKey(fo);
            if (!foreignSeen.has(k)) {
              foreignSeen.add(k);
              existingForeignList.push(fo);
            }
          }
          const serializedForeign = JSON.stringify(existingForeignList);
          localStorage.setItem(foreignQKey, serializedForeign);
          if (localStorage.getItem(foreignQKey) !== serializedForeign) {
            foreignOrdersQuarantineSuccess = false;
          }
        }
      } catch {
        foreignOrdersQuarantineSuccess = false;
      }

      if (!foreignOrdersQuarantineSuccess) {
        try {
          const migrationMeta = getMigrationMetadata();
          migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
          migrationMeta.failedQuarantineKeys[targetOrdersKey] = true;
          setMigrationMetadata(migrationMeta);
        } catch {}
      }
    }

    const hasForeignBackupToClear = Boolean(
      localStorage.getItem(`palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toSafe}`) ||
      (toAccountId !== toSafe && localStorage.getItem(`palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toAccountId}`))
    );
    const hasRawTargetOrders = Boolean(
      toAccountId !== toSafe &&
      localStorage.getItem(`palluvo_ecommerce_orders_${toAccountId}`)
    );

    let ordersWriteSuccess = true;
    const shouldWriteOrders = sourceReadSuccess && foreignOrdersQuarantineSuccess && (
      mergedOrders.length > initialOrderCount ||
      (initialOrderCount === 0 && mergedOrders.length > 0) ||
      (isSameAccount && hasFilter) ||
      (hasForeignBackupToClear && foreignOrders.length === 0 && mergedOrders.length > 0) ||
      (hasRawTargetOrders && mergedOrders.length > 0) ||
      targetOrdersFilteredCount > 0 ||
      (totalTargetOrdersRead > mergedOrders.length && mergedOrders.length > 0) ||
      (claimedUnknownOrderCounts.size > 0 && mergedOrders.length > 0)
    );

    if (shouldWriteOrders) {
      try {
        const serialized = JSON.stringify(mergedOrders);
        localStorage.setItem(targetOrdersKey, serialized);
        const verified = localStorage.getItem(targetOrdersKey);
        if (verified !== serialized) {
          ordersWriteSuccess = false;
        }
        if (ordersWriteSuccess) {
          if (toAccountId !== toSafe && toAccountId !== targetOrdersKey) {
            try {
              localStorage.removeItem(`palluvo_ecommerce_orders_${toAccountId}`);
            } catch {}
          }
          if (foreignOrders.length === 0) {
            try {
              localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toSafe}`);
              if (toAccountId !== toSafe) {
                localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toAccountId}`);
              }
            } catch {}
          }
          if (claimedUnknownOrderCounts.size > 0) {
            try {
              const rawUnknown = localStorage.getItem(unknownOrdersKey);
              if (rawUnknown && rawUnknown.trim()) {
                const parsed = JSON.parse(rawUnknown);
                if (Array.isArray(parsed)) {
                  const countsToConsume = new Map(claimedUnknownOrderCounts);
                  const remaining: Record<string, unknown>[] = [];
                  for (const item of parsed) {
                    if (!item || typeof item !== "object") {
                      remaining.push(item);
                      continue;
                    }
                    const ord = item as Record<string, unknown>;
                    const exactKey = getExactOrderRowKey(ord);
                    const remainingCount = countsToConsume.get(exactKey) || 0;
                    if (remainingCount > 0 && (isOrderVerifiedForOwner(ord, false) || Boolean(reviewAndRepairUnknownOrder(ord)))) {
                      countsToConsume.set(exactKey, remainingCount - 1);
                    } else {
                      remaining.push(ord);
                    }
                  }
                  if (remaining.length === 0) {
                    localStorage.removeItem(unknownOrdersKey);
                  } else {
                    localStorage.setItem(unknownOrdersKey, JSON.stringify(remaining));
                  }
                }
              }
            } catch {}
          }
          try {
            const migrationMeta = getMigrationMetadata();
            if (migrationMeta.failedQuarantineKeys?.[targetOrdersKey]) {
              delete migrationMeta.failedQuarantineKeys[targetOrdersKey];
              if (!setMigrationMetadata(migrationMeta)) {
                ordersWriteSuccess = false;
              }
            }
          } catch {}
        }
      } catch {
        ordersWriteSuccess = false;
      }
    } else if (!sourceReadSuccess || !foreignOrdersQuarantineSuccess) {
      ordersWriteSuccess = false;
    }

    if (ordersWriteSuccess && foreignOrders.length === 0 && initialOrderCount === 0 && mergedOrders.length === 0) {
      try {
        localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toSafe}`);
        if (toAccountId !== toSafe) {
          localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_orders_${toAccountId}`);
        }
      } catch {}
    }

    // Addresses merging
    const phoneAddrSourceKeys: string[] = [];
    for (const p of verifiedPhoneList) {
      phoneAddrSourceKeys.push(
        `palluvo_ecommerce_addresses_usr_phone_${p}`,
        `palluvo_quarantine_palluvo_ecommerce_addresses_usr_phone_${p}`,
        `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_usr_phone_${p}`
      );
    }
    const addrSources = Array.from(new Set([
      `palluvo_ecommerce_addresses_${fromSafe}`,
      `palluvo_ecommerce_addresses_${fromAccountId}`,
      `palluvo_quarantine_palluvo_ecommerce_addresses_${fromSafe}`,
      `palluvo_quarantine_palluvo_ecommerce_addresses_${fromAccountId}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${fromSafe}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${fromAccountId}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toSafe}`,
      `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toAccountId}`,
      ...phoneAddrSourceKeys,
    ]));
    const targetAddrKey = `palluvo_ecommerce_addresses_${toSafe}`;

    const getAddressDedupKey = (addr: Record<string, unknown>): string => {
      if (typeof addr.id === "string" && addr.id.trim()) {
        return `id:${addr.id.trim()}`;
      }
      const rawName = typeof addr.name === "string" ? addr.name.trim().toLowerCase() : "";
      const rawPhone = addr.phone;
      const phone = typeof rawPhone === "string"
        ? rawPhone.replace(/\D/g, "").slice(-10)
        : typeof rawPhone === "number" && Number.isFinite(rawPhone)
        ? String(rawPhone).replace(/\D/g, "").slice(-10)
        : "";
      const line = typeof addr.addressLine === "string" ? addr.addressLine.trim().toLowerCase() : "";
      const line2 = typeof addr.addressLine2 === "string" ? addr.addressLine2.trim().toLowerCase() : "";
      const city = typeof addr.city === "string" ? addr.city.trim().toLowerCase() : "";
      const state = typeof addr.state === "string" ? addr.state.trim().toLowerCase() : "";
      const pin = typeof addr.pincode === "string" ? addr.pincode.trim() : "";
      const type = typeof addr.type === "string" ? addr.type.trim().toLowerCase() : "";
      const isDefault = Boolean(addr.isDefault);
      if (line && pin) {
        return `loc:${rawName}_${phone}_${line}_${line2}_${city}_${state}_${pin}_${type}_${isDefault}`;
      }
      return `json:${JSON.stringify(addr)}`;
    };

    const getAddressEmailClaims = (addr: Record<string, unknown>) => {
      const raw = [
        typeof addr.email === "string" ? addr.email : "",
        typeof addr.ownerEmail === "string" ? addr.ownerEmail : "",
        typeof addr.userEmail === "string" ? addr.userEmail : "",
      ]
        .map((e) => e.toLowerCase().trim())
        .filter(Boolean);
      const uniqueRaw = Array.from(new Set(raw)).sort();
      const validEmails = uniqueRaw.filter((e) => e.includes("@"));
      const malformedClaims = uniqueRaw.filter((e) => !e.includes("@"));
      return { validEmails, malformedClaims, allRaw: uniqueRaw };
    };

    const getAddressClaimedPhones = (addr: Record<string, unknown>): string[] => {
      const tokens = extractExplicitPhoneTokens(addr);
      return Array.from(new Set(tokens)).sort();
    };

    const getAddressOwnerDiscriminator = (addr: Record<string, unknown>): string => {
      const { validEmails, malformedClaims } = getAddressEmailClaims(addr);
      const phones = getAddressClaimedPhones(addr);
      const parts: string[] = [];
      if (validEmails.length > 0) {
        parts.push(`em:${validEmails.join(",")}`);
      }
      if (malformedClaims.length > 0) {
        parts.push(`raw_em:${malformedClaims.join(",")}`);
      }
      if (phones.length > 0) {
        parts.push(`ph:${phones.join(",")}`);
      }
      return parts.length > 0 ? parts.join(";") : "unknown";
    };

    const getForeignAddressDedupKey = (addr: Record<string, unknown>): string => {
      const baseKey = getAddressDedupKey(addr);
      const ownerDisc = getAddressOwnerDiscriminator(addr);
      return `foreign:${ownerDisc}|${baseKey}`;
    };

    const getForeignAddressQuarantineBucketKey = (addr: Record<string, unknown>): string => {
      const { validEmails, malformedClaims } = getAddressEmailClaims(addr);
      if (malformedClaims.length > 0) {
        return "unknown";
      }
      if (validEmails.length > 0) {
        const rootOwners = Array.from(
          new Set(validEmails.map((e) => (resolveRootOwner(e, meta) || e).toLowerCase().trim()))
        );
        if (rootOwners.length === 1) {
          return rootOwners[0];
        }
        return "unknown";
      }
      const phones = getAddressClaimedPhones(addr);
      if (phones.length === 1) {
        return `usr_phone_${phones[0]}`;
      }
      return "unknown";
    };

    const getExactAddressRowKey = (addr: Record<string, unknown>): string => {
      const sortedKeys = Object.keys(addr).sort();
      const parts: string[] = [];
      for (const k of sortedKeys) {
        const val = addr[k];
        if (val !== undefined && typeof val !== "function") {
          parts.push(`${k}:${typeof val === "object" && val !== null ? JSON.stringify(val) : String(val)}`);
        }
      }
      return `exact_addr:${parts.join("|")}`;
    };

    const isAddressVerifiedForOwner = (addr: Record<string, unknown>, isSameBucket = false): boolean => {
      const { validEmails, malformedClaims } = getAddressEmailClaims(addr);
      const claimedPhones = getAddressClaimedPhones(addr);

      if (!filterEmail && allowedEmailSet.size === 0 && verifiedPhoneList.length === 0) {
        if (malformedClaims.length > 0) return false;
        if (validEmails.length > 1) {
          const firstRoot = (resolveRootOwner(validEmails[0], meta) || validEmails[0]).toLowerCase().trim();
          for (let i = 1; i < validEmails.length; i++) {
            const r = (resolveRootOwner(validEmails[i], meta) || validEmails[i]).toLowerCase().trim();
            if (r !== firstRoot) return false;
          }
        }
        return true;
      }

      if (malformedClaims.length > 0) {
        return false;
      }

      if (validEmails.length > 0) {
        // Require every non-empty owner email to resolve to this account,
        // and fail closed on a conflict.
        return validEmails.every((e) => isEmailVerified(e));
      }

      // If no email was attached to the address:
      // When phone claims exist, require all phone claims to resolve unambiguously to this same owner.
      if (claimedPhones.length > 0) {
        return claimedPhones.every((p) => isPhoneVerified(p));
      }

      // If no email and no phone was attached to the address:
      // Records that already sit in the canonical / same-key bucket have no positive evidence
      // of another owner, so they must stay.
      if (isSameBucket) {
        return true;
      }

      return false;
    };

    const reviewAndRepairUnknownAddress = (addr: Record<string, unknown>): Record<string, unknown> | null => {
      const { validEmails, malformedClaims } = getAddressEmailClaims(addr);
      const claimedPhones = getAddressClaimedPhones(addr);

      if (malformedClaims.length === 0) {
        return null;
      }

      if (validEmails.length > 0 && !validEmails.every((e) => isEmailVerified(e))) {
        return null;
      }

      if (claimedPhones.length > 0 && !claimedPhones.every((p) => isPhoneVerified(p))) {
        return null;
      }

      for (const c of malformedClaims) {
        const recOwner = meta[c]?.ownerEmail?.toLowerCase().trim();
        if (recOwner) {
          const resOwner = getVerifiedRootOwner(recOwner, meta);
          if (resOwner && !isEmailVerified(resOwner)) {
            return null;
          }
        }
        const recAcc = meta[c]?.accountId;
        if (recAcc && recAcc !== toAccountId && recAcc !== fromAccountId && recAcc !== toSafe && recAcc !== fromSafe) {
          return null;
        }
      }

      const hasVerifiedEmail = validEmails.length > 0 && validEmails.every((e) => isEmailVerified(e));
      const hasVerifiedPhone = claimedPhones.length > 0 && claimedPhones.every((p) => isPhoneVerified(p));
      const hasDirectAccountClaim = malformedClaims.some((c) => {
        const lowerC = c.toLowerCase().trim();
        if (lowerC === toAccountId.toLowerCase() || lowerC === fromAccountId.toLowerCase() || lowerC === toSafe || lowerC === fromSafe) {
          return true;
        }
        const recOwner = meta[c]?.ownerEmail?.toLowerCase().trim();
        if (recOwner && isEmailVerified(recOwner)) {
          return true;
        }
        const recAcc = meta[c]?.accountId;
        return recAcc === toAccountId || recAcc === fromAccountId;
      });

      if (!hasVerifiedEmail && !hasVerifiedPhone && !hasDirectAccountClaim) {
        return null;
      }

      const repaired: Record<string, unknown> = { ...addr };
      const canonicalEmail = filterEmail || (validEmails.length > 0 ? validEmails[0] : "");
      if (canonicalEmail) {
        if (typeof repaired.ownerEmail === "string" && !repaired.ownerEmail.includes("@")) {
          repaired.ownerEmail = canonicalEmail;
        }
        if (typeof repaired.userEmail === "string" && !repaired.userEmail.includes("@")) {
          repaired.userEmail = canonicalEmail;
        }
        if (typeof repaired.email === "string" && !repaired.email.includes("@")) {
          repaired.email = canonicalEmail;
        }
      } else if (toAccountId) {
        if (typeof repaired.ownerEmail === "string" && !repaired.ownerEmail.includes("@")) {
          repaired.ownerEmail = toAccountId;
        }
        if (typeof repaired.userEmail === "string" && !repaired.userEmail.includes("@")) {
          repaired.userEmail = toAccountId;
        }
      }
      return repaired;
    };

    const mergedAddrs: Record<string, unknown>[] = [];
    const foreignAddrs: Record<string, unknown>[] = [];
    const seenAddrKeys = new Set<string>();
    const seenForeignAddrKeys = new Set<string>();
    let targetAddrsFilteredCount = 0;
    let totalTargetAddrsRead = 0;

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
                totalTargetAddrsRead++;
                const addr = item as Record<string, unknown>;
                const isForeign = hasFilter && !isAddressVerifiedForOwner(addr, true);
                if (isForeign) {
                  targetAddrsFilteredCount++;
                  const foreignDedupKey = getForeignAddressDedupKey(addr);
                  if (!seenForeignAddrKeys.has(foreignDedupKey)) {
                    seenForeignAddrKeys.add(foreignDedupKey);
                    foreignAddrs.push(addr);
                  }
                } else {
                  const dedupKey = getAddressDedupKey(addr);
                  if (!seenAddrKeys.has(dedupKey)) {
                    seenAddrKeys.add(dedupKey);
                    mergedAddrs.push(addr);
                  }
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
          const isVerifiedOwner = isAddressVerifiedForOwner(addr, false);
          if (isVerifiedOwner) {
            const dedupKey = getAddressDedupKey(addr);
            if (!seenAddrKeys.has(dedupKey)) {
              seenAddrKeys.add(dedupKey);
              mergedAddrs.push(addr);
            }
          } else if (hasFilter) {
            const foreignDedupKey = getForeignAddressDedupKey(addr);
            if (!seenForeignAddrKeys.has(foreignDedupKey)) {
              seenForeignAddrKeys.add(foreignDedupKey);
              foreignAddrs.push(addr);
            }
          }
        }
      } catch {
        sourceReadSuccess = false;
      }
    }

    // Recover any legacy entries from shared unknown quarantine that positively belong to this account
    const claimedUnknownAddrCounts = new Map<string, number>();
    const unknownAddrsKey = "palluvo_quarantine_palluvo_ecommerce_addresses_unknown";
    try {
      const rawUnknown = localStorage.getItem(unknownAddrsKey);
      if (rawUnknown && rawUnknown.trim()) {
        const parsed = JSON.parse(rawUnknown);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (!item || typeof item !== "object") continue;
            const addr = item as Record<string, unknown>;
            // Require affirmative ownership evidence to claim from unknown
            if (isAddressVerifiedForOwner(addr, false)) {
              const exactKey = getExactAddressRowKey(addr);
              claimedUnknownAddrCounts.set(exactKey, (claimedUnknownAddrCounts.get(exactKey) || 0) + 1);
              const dedupKey = getAddressDedupKey(addr);
              if (!seenAddrKeys.has(dedupKey)) {
                seenAddrKeys.add(dedupKey);
                mergedAddrs.push(addr);
              }
            } else if (hasFilter) {
              const repaired = reviewAndRepairUnknownAddress(addr);
              if (repaired) {
                const exactKey = getExactAddressRowKey(addr);
                claimedUnknownAddrCounts.set(exactKey, (claimedUnknownAddrCounts.get(exactKey) || 0) + 1);
                const dedupKey = getAddressDedupKey(repaired);
                if (!seenAddrKeys.has(dedupKey)) {
                  seenAddrKeys.add(dedupKey);
                  mergedAddrs.push(repaired);
                }
              }
            }
          }
        }
      }
    } catch {}

    let foreignAddrsQuarantineSuccess = true;

    if (foreignAddrs.length > 0) {
      try {
        const addrsByForeignBucket = new Map<string, Record<string, unknown>[]>();
        for (const addr of foreignAddrs) {
          const key = getForeignAddressQuarantineBucketKey(addr);
          if (!addrsByForeignBucket.has(key)) {
            addrsByForeignBucket.set(key, []);
          }
          addrsByForeignBucket.get(key)!.push(addr);
        }

        for (const [fKey, fAs] of addrsByForeignBucket.entries()) {
          const fSafe = fKey.replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
          const qKey = `palluvo_quarantine_palluvo_ecommerce_addresses_${fSafe}`;
          const existingRaw = localStorage.getItem(qKey);
          let existingList: Record<string, unknown>[] = [];
          if (existingRaw) {
            try {
              const p = JSON.parse(existingRaw);
              if (Array.isArray(p)) existingList = p;
            } catch {}
          }
          const seen = new Set(existingList.map(getForeignAddressDedupKey));
          for (const fa of fAs) {
            const k = getForeignAddressDedupKey(fa);
            if (!seen.has(k)) {
              seen.add(k);
              existingList.push(fa);
            }
          }
          const serialized = JSON.stringify(existingList);
          localStorage.setItem(qKey, serialized);
          if (localStorage.getItem(qKey) !== serialized) {
            foreignAddrsQuarantineSuccess = false;
            break;
          }
        }

        if (foreignAddrsQuarantineSuccess) {
          const foreignQKey = `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toSafe}`;
          const existingForeignRaw = localStorage.getItem(foreignQKey);
          let existingForeignList: Record<string, unknown>[] = [];
          if (existingForeignRaw) {
            try {
              const p = JSON.parse(existingForeignRaw);
              if (Array.isArray(p)) existingForeignList = p;
            } catch {}
          }
          const foreignSeen = new Set(existingForeignList.map(getForeignAddressDedupKey));
          for (const fa of foreignAddrs) {
            const k = getForeignAddressDedupKey(fa);
            if (!foreignSeen.has(k)) {
              foreignSeen.add(k);
              existingForeignList.push(fa);
            }
          }
          const serializedForeign = JSON.stringify(existingForeignList);
          localStorage.setItem(foreignQKey, serializedForeign);
          if (localStorage.getItem(foreignQKey) !== serializedForeign) {
            foreignAddrsQuarantineSuccess = false;
          }
        }
      } catch {
        foreignAddrsQuarantineSuccess = false;
      }

      if (!foreignAddrsQuarantineSuccess) {
        try {
          const migrationMeta = getMigrationMetadata();
          migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
          migrationMeta.failedQuarantineKeys[targetAddrKey] = true;
          setMigrationMetadata(migrationMeta);
        } catch {}
      }
    }

    const hasForeignAddrBackupToClear = Boolean(
      localStorage.getItem(`palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toSafe}`) ||
      (toAccountId !== toSafe && localStorage.getItem(`palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toAccountId}`))
    );
    const hasRawTargetAddrs = Boolean(
      toAccountId !== toSafe &&
      localStorage.getItem(`palluvo_ecommerce_addresses_${toAccountId}`)
    );

    let addrsWriteSuccess = true;
    const shouldWriteAddrs = sourceReadSuccess && foreignAddrsQuarantineSuccess && (
      mergedAddrs.length > initialAddrCount ||
      (initialAddrCount === 0 && mergedAddrs.length > 0) ||
      (isSameAccount && hasFilter) ||
      (hasForeignAddrBackupToClear && foreignAddrs.length === 0 && mergedAddrs.length > 0) ||
      (hasRawTargetAddrs && mergedAddrs.length > 0) ||
      targetAddrsFilteredCount > 0 ||
      (totalTargetAddrsRead > mergedAddrs.length && mergedAddrs.length > 0) ||
      (claimedUnknownAddrCounts.size > 0 && mergedAddrs.length > 0)
    );

    if (shouldWriteAddrs) {
      try {
        const serialized = JSON.stringify(mergedAddrs);
        localStorage.setItem(targetAddrKey, serialized);
        const verified = localStorage.getItem(targetAddrKey);
        if (verified !== serialized) {
          addrsWriteSuccess = false;
        }
        if (addrsWriteSuccess) {
          if (toAccountId !== toSafe && toAccountId !== targetAddrKey) {
            try {
              localStorage.removeItem(`palluvo_ecommerce_addresses_${toAccountId}`);
            } catch {}
          }
          if (foreignAddrs.length === 0) {
            try {
              localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toSafe}`);
              if (toAccountId !== toSafe) {
                localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toAccountId}`);
              }
            } catch {}
          }
          if (claimedUnknownAddrCounts.size > 0) {
            try {
              const rawUnknown = localStorage.getItem(unknownAddrsKey);
              if (rawUnknown && rawUnknown.trim()) {
                const parsed = JSON.parse(rawUnknown);
                if (Array.isArray(parsed)) {
                  const countsToConsume = new Map(claimedUnknownAddrCounts);
                  const remaining: Record<string, unknown>[] = [];
                  for (const item of parsed) {
                    if (!item || typeof item !== "object") {
                      remaining.push(item);
                      continue;
                    }
                    const addr = item as Record<string, unknown>;
                    const exactKey = getExactAddressRowKey(addr);
                    const remainingCount = countsToConsume.get(exactKey) || 0;
                    if (remainingCount > 0 && (isAddressVerifiedForOwner(addr, false) || Boolean(reviewAndRepairUnknownAddress(addr)))) {
                      countsToConsume.set(exactKey, remainingCount - 1);
                    } else {
                      remaining.push(addr);
                    }
                  }
                  if (remaining.length === 0) {
                    localStorage.removeItem(unknownAddrsKey);
                  } else {
                    localStorage.setItem(unknownAddrsKey, JSON.stringify(remaining));
                  }
                }
              }
            } catch {}
          }
          try {
            const migrationMeta = getMigrationMetadata();
            if (migrationMeta.failedQuarantineKeys?.[targetAddrKey]) {
              delete migrationMeta.failedQuarantineKeys[targetAddrKey];
              if (!setMigrationMetadata(migrationMeta)) {
                addrsWriteSuccess = false;
              }
            }
          } catch {}
        }
      } catch {
        addrsWriteSuccess = false;
      }
    } else if (!sourceReadSuccess || !foreignAddrsQuarantineSuccess) {
      addrsWriteSuccess = false;
    }

    if (addrsWriteSuccess && foreignAddrs.length === 0 && initialAddrCount === 0 && mergedAddrs.length === 0) {
      try {
        localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toSafe}`);
        if (toAccountId !== toSafe) {
          localStorage.removeItem(`palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${toAccountId}`);
        }
      } catch {}
    }

    return (
      sourceReadSuccess &&
      foreignOrdersQuarantineSuccess &&
      ordersWriteSuccess &&
      foreignAddrsQuarantineSuccess &&
      addrsWriteSuccess
    );
  } catch {
    return false;
  }
}

/**
 * Explicit review and repair path for records stranded in the shared unknown quarantine.
 * Resolves ownership safely using verified emails, phones, or account claims and repairs
 * malformed claim fields before rows are permanently excluded from ordinary recovery.
 */
export function reviewAndRepairQuarantinedUnknownRecords(
  targetAccountId?: string,
  options?: CopyCustomerDataOptions
): { repairedOrders: number; repairedAddresses: number } {
  let repairedOrders = 0;
  let repairedAddresses = 0;

  if (typeof window === "undefined" || !window.localStorage) {
    return { repairedOrders: 0, repairedAddresses: 0 };
  }

  try {
    const meta = getAccountMetadata();
    const migrationMeta = getMigrationMetadata();
    let map: Record<string, string> = {};
    try {
      const rawMap = localStorage.getItem(ACCOUNT_MAP_KEY);
      if (rawMap) map = JSON.parse(rawMap);
    } catch {}

    if (targetAccountId && options) {
      const copySuccess = copyCustomerData(targetAccountId, targetAccountId, options);
      return {
        repairedOrders: copySuccess ? 1 : 0,
        repairedAddresses: copySuccess ? 1 : 0,
      };
    }

    const resolveSafeInjectiveAccountId = (rootEmail: string): string => {
      const norm = rootEmail.toLowerCase().trim();
      const expectedInjectiveId = norm === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(norm)}`;

      const legacyLossyId = getDirectLegacyEmailId(norm);

      // Check current map and metadata values
      const mapVal = map[norm];
      const metaVal = meta[norm]?.accountId;

      // Identify any legacy lossy IDs that were mapped or stored
      const candidateLegacyIds = new Set<string>();
      if (legacyLossyId !== expectedInjectiveId) {
        candidateLegacyIds.add(legacyLossyId);
      }
      if (
        mapVal &&
        mapVal !== expectedInjectiveId &&
        (mapVal === legacyLossyId || !isInjectiveEmailAccountId(mapVal) || mapVal.startsWith("usr_email_"))
      ) {
        candidateLegacyIds.add(mapVal);
      }
      if (
        metaVal &&
        metaVal !== expectedInjectiveId &&
        (metaVal === legacyLossyId || !isInjectiveEmailAccountId(metaVal) || metaVal.startsWith("usr_email_"))
      ) {
        candidateLegacyIds.add(metaVal);
      }

      // Rekey and quarantine any legacy lossy IDs encountered
      for (const legId of candidateLegacyIds) {
        if (!isQuarantinedAccountId(legId)) {
          quarantineLegacyBucket(legId, [norm]);
        }
        migrationMeta.rekeyedOwnerIds = migrationMeta.rekeyedOwnerIds || {};
        migrationMeta.rekeyedOwnerIds[legId] = expectedInjectiveId;
      }

      // If active auth user was bound to a legacy lossy ID for this email, rekey them
      try {
        const authRaw = localStorage.getItem("palluvo_ecommerce_auth");
        if (authRaw) {
          const parsed = JSON.parse(authRaw);
          if (
            parsed?.user?.email?.toLowerCase().trim() === norm &&
            parsed?.user?.id &&
            parsed.user.id !== expectedInjectiveId &&
            candidateLegacyIds.has(parsed.user.id)
          ) {
            parsed.user.id = expectedInjectiveId;
            localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify(parsed));
          }
        }
      } catch {}

      // If an injective destination ID is already recorded and not quarantined, verify it matches expected
      const validCanonicalId = (!isQuarantinedAccountId(mapVal) && mapVal === expectedInjectiveId)
        ? mapVal
        : ((!isQuarantinedAccountId(metaVal) && metaVal === expectedInjectiveId) ? metaVal : undefined);

      const targetId = validCanonicalId || expectedInjectiveId;

      if (map[norm] !== targetId) {
        map[norm] = targetId;
        mapModified = true;
      }
      if (!meta[norm] || meta[norm].accountId !== targetId) {
        meta[norm] = {
          ...meta[norm],
          accountId: targetId,
          type: meta[norm]?.type || "primary",
          ownerEmail: norm,
          updatedAt: Date.now(),
        };
      }

      return targetId;
    };

    let mapModified = false;

    // 1. Scan unknown orders quarantine
    const unknownOrdersKey = "palluvo_quarantine_palluvo_ecommerce_orders_unknown";
    const rawUnknownOrders = localStorage.getItem(unknownOrdersKey);
    if (rawUnknownOrders && rawUnknownOrders.trim()) {
      let ordersList: Record<string, unknown>[] = [];
      try {
        const parsed = JSON.parse(rawUnknownOrders);
        if (Array.isArray(parsed)) ordersList = parsed;
      } catch {}

      if (ordersList.length > 0) {
        const targetAccounts = new Set<string>();
        for (const ord of ordersList) {
          if (!ord || typeof ord !== "object") continue;
          const cust = ord.customer as Record<string, unknown> | undefined;
          const raw = [
            typeof cust?.email === "string" ? cust.email : "",
            typeof ord.email === "string" ? ord.email : "",
            typeof ord.ownerEmail === "string" ? ord.ownerEmail : "",
            typeof ord.userEmail === "string" ? ord.userEmail : "",
          ].map((e) => e.toLowerCase().trim()).filter(Boolean);
          const validEmails = raw.filter((e) => e.includes("@"));
          if (validEmails.length > 0) {
            const rootOwners = Array.from(new Set(validEmails.map((e) => (resolveRootOwner(e, meta) || e).toLowerCase().trim())));
            if (rootOwners.length === 1) {
              const root = rootOwners[0];
              const accId = resolveSafeInjectiveAccountId(root);
              if (accId && !isQuarantinedAccountId(accId)) {
                targetAccounts.add(root);
              }
            }
          }
          const phones = extractExplicitPhoneTokens(ord);
          if (phones.length === 1) {
            const p = phones[0];
            const isUnresolved = Boolean(
              meta[p]?.status === "unresolved" ||
              meta[`usr_phone_${p}`]?.status === "unresolved" ||
              migrationMeta.unresolvedPhoneAliases?.[p] ||
              migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${p}`]
            );
            if (!isUnresolved && meta[p]?.ownerEmail) {
              const root = (resolveRootOwner(meta[p].ownerEmail, meta) || meta[p].ownerEmail).toLowerCase().trim();
              const accId = resolveSafeInjectiveAccountId(root);
              if (accId && !isQuarantinedAccountId(accId)) {
                targetAccounts.add(root);
              }
            }
          }
        }

        for (const root of targetAccounts) {
          const accId = resolveSafeInjectiveAccountId(root);
          if (accId && !isQuarantinedAccountId(accId)) {
            const candidateLegacyIds = new Set<string>();
            const legacyBucketId = getDirectLegacyEmailId(root);
            if (legacyBucketId !== accId) candidateLegacyIds.add(legacyBucketId);
            if (migrationMeta.rekeyedOwnerIds) {
              for (const [oldId, newId] of Object.entries(migrationMeta.rekeyedOwnerIds)) {
                if (newId === accId && oldId !== accId) {
                  candidateLegacyIds.add(oldId);
                }
              }
            }
            for (const legSrc of candidateLegacyIds) {
              copyCustomerData(legSrc, accId, {
                filterByOwnerEmail: root,
                allowedEmails: [root],
              });
            }
            const success = copyCustomerData(accId, accId, {
              filterByOwnerEmail: root,
              allowedEmails: [root],
            });
            if (success) repairedOrders++;
          }
        }
      }
    }

    // 2. Scan unknown addresses quarantine
    const unknownAddrsKey = "palluvo_quarantine_palluvo_ecommerce_addresses_unknown";
    const rawUnknownAddrs = localStorage.getItem(unknownAddrsKey);
    if (rawUnknownAddrs && rawUnknownAddrs.trim()) {
      let addrsList: Record<string, unknown>[] = [];
      try {
        const parsed = JSON.parse(rawUnknownAddrs);
        if (Array.isArray(parsed)) addrsList = parsed;
      } catch {}

      if (addrsList.length > 0) {
        const targetAccounts = new Set<string>();
        for (const addr of addrsList) {
          if (!addr || typeof addr !== "object") continue;
          const raw = [
            typeof addr.email === "string" ? addr.email : "",
            typeof addr.ownerEmail === "string" ? addr.ownerEmail : "",
            typeof addr.userEmail === "string" ? addr.userEmail : "",
          ].map((e) => e.toLowerCase().trim()).filter(Boolean);
          const validEmails = raw.filter((e) => e.includes("@"));
          if (validEmails.length > 0) {
            const rootOwners = Array.from(new Set(validEmails.map((e) => (resolveRootOwner(e, meta) || e).toLowerCase().trim())));
            if (rootOwners.length === 1) {
              const root = rootOwners[0];
              const accId = resolveSafeInjectiveAccountId(root);
              if (accId && !isQuarantinedAccountId(accId)) {
                targetAccounts.add(root);
              }
            }
          }
          const phone = normalizeExplicitPhoneToken(addr.phone);
          if (phone) {
            const isUnresolved = Boolean(
              meta[phone]?.status === "unresolved" ||
              meta[`usr_phone_${phone}`]?.status === "unresolved" ||
              migrationMeta.unresolvedPhoneAliases?.[phone] ||
              migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${phone}`]
            );
            if (!isUnresolved && meta[phone]?.ownerEmail) {
              const root = (resolveRootOwner(meta[phone].ownerEmail, meta) || meta[phone].ownerEmail).toLowerCase().trim();
              const accId = resolveSafeInjectiveAccountId(root);
              if (accId && !isQuarantinedAccountId(accId)) {
                targetAccounts.add(root);
              }
            }
          }
        }

        for (const root of targetAccounts) {
          const accId = resolveSafeInjectiveAccountId(root);
          if (accId && !isQuarantinedAccountId(accId)) {
            const candidateLegacyIds = new Set<string>();
            const legacyBucketId = getDirectLegacyEmailId(root);
            if (legacyBucketId !== accId) candidateLegacyIds.add(legacyBucketId);
            if (migrationMeta.rekeyedOwnerIds) {
              for (const [oldId, newId] of Object.entries(migrationMeta.rekeyedOwnerIds)) {
                if (newId === accId && oldId !== accId) {
                  candidateLegacyIds.add(oldId);
                }
              }
            }
            for (const legSrc of candidateLegacyIds) {
              copyCustomerData(legSrc, accId, {
                filterByOwnerEmail: root,
                allowedEmails: [root],
              });
            }
            const success = copyCustomerData(accId, accId, {
              filterByOwnerEmail: root,
              allowedEmails: [root],
            });
            if (success) repairedAddresses++;
          }
        }
      }
    }

    if (mapModified) {
      try {
        const currentMeta = getMigrationMetadata();
        const mergedMeta = mergeMigrationMetadata(currentMeta, migrationMeta);
        if (!setMigrationMetadata(mergedMeta)) {
          return { repairedOrders, repairedAddresses };
        }
        const currentRaw = localStorage.getItem(ACCOUNT_MAP_KEY);
        let currentMap: Record<string, string> = {};
        if (currentRaw) {
          try {
            const p = JSON.parse(currentRaw);
            if (p && typeof p === "object" && !Array.isArray(p)) {
              currentMap = p;
            }
          } catch {}
        }
        for (const [k, v] of Object.entries(map)) {
          if (typeof v === "string" && v.trim()) {
            currentMap[k] = v.trim();
          }
        }
        const serialized = JSON.stringify(currentMap);
        localStorage.setItem(ACCOUNT_MAP_KEY, serialized);
        const verifiedRaw = localStorage.getItem(ACCOUNT_MAP_KEY);
        if (verifiedRaw === serialized) {
          setAccountMetadata(meta);
        }
      } catch {}
    } else {
      try {
        const currentMeta = getMigrationMetadata();
        const mergedMeta = mergeMigrationMetadata(currentMeta, migrationMeta);
        if (JSON.stringify(mergedMeta) !== JSON.stringify(currentMeta)) {
          setMigrationMetadata(mergedMeta);
        }
      } catch {}
    }
  } catch {}

  return { repairedOrders, repairedAddresses };
}

/**
 * Removes quarantine and tombstone markers that were mistakenly applied to a single account owner
 * who merely had changed-email aliases. Persists the clear to disk immediately and records
 * cleared quarantine keys to prevent subsequent metadata merges from resurrecting cleared state.
 * Returns true ONLY when the clear sequence is reserved AND the clear metadata is verified as
 * persisted on disk; returns false and keeps the clear/rekey deferred if the lock or write fails.
 */
export function clearFalseQuarantine(accountId: string, canonicalId: string, migrationMeta?: MigrationMeta): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;
  if (!accountId) return false;
  try {
    const trimmed = accountId.trim();
    const safeId = trimmed.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);

    const keysToClear = [
      trimmed,
      safeId,
      `palluvo_ecommerce_orders_${trimmed}`,
      `palluvo_ecommerce_orders_${safeId}`,
      `palluvo_ecommerce_addresses_${trimmed}`,
      `palluvo_ecommerce_addresses_${safeId}`,
      `retry_migration_${trimmed}`,
      `retry_migration_${safeId}`,
      `deferred_quarantine_${trimmed}`,
      `deferred_quarantine_${safeId}`,
    ];

    if (trimmed.includes("@")) {
      const lower = trimmed.toLowerCase();
      const sanitized = lower.replace(/[^a-z0-9_.-]/g, "_");
      keysToClear.push(
        `palluvo_ecommerce_orders_${lower}`,
        `palluvo_ecommerce_addresses_${lower}`,
        `palluvo_ecommerce_orders_${sanitized}`,
        `palluvo_ecommerce_addresses_${sanitized}`,
        `palluvo_ecommerce_orders_usr_email_${sanitized}`,
        `palluvo_ecommerce_addresses_usr_email_${sanitized}`,
        `retry_migration_${lower}`,
        `retry_migration_${sanitized}`,
        `retry_migration_usr_email_${sanitized}`
      );
    }

    const clearTimestamp = getNextMigrationOpSeq();
    if (clearTimestamp === null) {
      // Lock reservation failed (e.g. storage write error or contention timeout).
      // Defer clearing without deleting tombstones/quarantine backups to prevent
      // unreserved or ambiguous sequence ordering.
      if (migrationMeta) {
        migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
        migrationMeta.failedQuarantineKeys[`retry_migration_${trimmed}`] = true;
        migrationMeta.failedQuarantineKeys[`retry_migration_${safeId}`] = true;
      }
      return false;
    }

    const applyClearToMeta = (metaToUpdate: MigrationMeta) => {
      metaToUpdate.clearedQuarantineKeys = metaToUpdate.clearedQuarantineKeys || {};
      for (const k of keysToClear) {
        metaToUpdate.clearedQuarantineKeys[k] = clearTimestamp;
      }
      metaToUpdate.operationSeq = Math.max(metaToUpdate.operationSeq || 0, clearTimestamp);
      if (metaToUpdate.quarantinedLegacyBuckets) {
        delete metaToUpdate.quarantinedLegacyBuckets[trimmed];
        delete metaToUpdate.quarantinedLegacyBuckets[safeId];
      }
      if (metaToUpdate.quarantinedCollisionIds) {
        delete metaToUpdate.quarantinedCollisionIds[trimmed];
        delete metaToUpdate.quarantinedCollisionIds[safeId];
      }
      if (metaToUpdate.tombstonedKeys) {
        for (const k of keysToClear) {
          delete metaToUpdate.tombstonedKeys[k];
        }
      }
      if (metaToUpdate.failedQuarantineKeys) {
        for (const k of keysToClear) {
          delete metaToUpdate.failedQuarantineKeys[k];
        }
      }
      metaToUpdate.rekeyedOwnerIds = metaToUpdate.rekeyedOwnerIds || {};
      metaToUpdate.rekeyedOwnerIds[trimmed] = canonicalId;
      metaToUpdate.rekeyedOwnerIds[safeId] = canonicalId;
    };

    // Persist and verify the clear in on-disk metadata BEFORE removing tombstones/quarantine backups
    // or mutating caller migrationMeta so a failed lock/write keeps the clear and rekey deferred.
    const diskMeta = getMigrationMetadata();
    applyClearToMeta(diskMeta);
    if (!setMigrationMetadata(diskMeta)) {
      if (migrationMeta) {
        migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
        migrationMeta.failedQuarantineKeys[`retry_migration_${trimmed}`] = true;
        migrationMeta.failedQuarantineKeys[`retry_migration_${safeId}`] = true;
      }
      return false;
    }

    if (migrationMeta) {
      applyClearToMeta(migrationMeta);
    }

    localStorage.removeItem(`palluvo_tombstone_${trimmed}`);
    localStorage.removeItem(`palluvo_tombstone_${safeId}`);
    for (const k of keysToClear) {
      localStorage.removeItem(`palluvo_tombstone_${k}`);
      localStorage.removeItem(`palluvo_quarantine_${k}`);
    }
    return true;
  } catch {
    return false;
  }
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
        } else if (!localStorage.getItem(ACCOUNT_MAP_KEY)) {
          const newMap: Record<string, string> = { [lowerEmail]: activeAuthUser.id || expectedInjectiveId };
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(newMap));
          } catch {}
        }
      }

      // Run quarantine recovery when the identity map is missing
      reviewAndRepairQuarantinedUnknownRecords();
      return;
    }

    const map = JSON.parse(raw);
    if (!map || typeof map !== "object" || Array.isArray(map)) {
      reviewAndRepairQuarantinedUnknownRecords();
      return;
    }
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
          const hasFailedMigration = Boolean(
            migrationMeta.failedQuarantineKeys?.[`retry_migration_${trimmedVal}`]
          );
          const quarantinedEmails = migrationMeta.quarantinedLegacyBuckets?.[trimmedVal]?.emails ||
            migrationMeta.quarantinedCollisionIds?.[trimmedVal] || [];

          if (redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration) {
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

        const isLegacyLossy = trimmedVal !== expectedInjectiveId && (
          trimmedVal.startsWith("usr_email_") ||
          trimmedVal === getDirectLegacyEmailId(singleEmail) ||
          !isInjectiveEmailAccountId(trimmedVal)
        );

        if (isQuarantinedAccountId(trimmedVal) || isLegacyLossy) {
          if (!isQuarantinedAccountId(trimmedVal)) {
            quarantineLegacyBucket(trimmedVal, [singleEmail], migrationMeta);
          }
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
                meta[revPhone]?.status === "unresolved" ||
                meta[meta[singleEmail].phone]?.status === "unresolved" ||
                migrationMeta.unresolvedPhoneAliases?.[revPhone] ||
                migrationMeta.unresolvedPhoneAliases?.[meta[singleEmail].phone]
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
            const isUnresolved = Boolean(
              meta[p]?.status === "unresolved" ||
              meta[normP]?.status === "unresolved" ||
              migrationMeta.unresolvedPhoneAliases?.[p] ||
              migrationMeta.unresolvedPhoneAliases?.[normP]
            );
            if (isUnresolved) continue;

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
            if (migrationMeta.clearedQuarantineKeys) {
              delete migrationMeta.clearedQuarantineKeys[`retry_migration_${trimmedVal}`];
              const safeVal = trimmedVal.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
              delete migrationMeta.clearedQuarantineKeys[`retry_migration_${safeVal}`];
            }
            try {
              localStorage.removeItem(`palluvo_tombstone_retry_migration_${trimmedVal}`);
            } catch {}
            setMigrationMetadata(migrationMeta);
            continue;
          }

          if (migrationMeta.failedQuarantineKeys?.[`deferred_quarantine_${trimmedVal}`]) {
            migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
            migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`] = true;
            setMigrationMetadata(migrationMeta);
            continue;
          }

          const prevRetryMarker = migrationMeta.failedQuarantineKeys?.[`retry_migration_${trimmedVal}`];
          if (migrationMeta.failedQuarantineKeys?.[`retry_migration_${trimmedVal}`]) {
            delete migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`];
          }

          const prevRekeyed = migrationMeta.rekeyedOwnerIds[trimmedVal];
          if (!hasCollisionHistory) {
            // Single-owner legacy bucket without collision history: record rekey
            migrationMeta.rekeyedOwnerIds[trimmedVal] = expectedInjectiveId;
          }

          const prevMigrated = migrationMeta.migratedCollisionIds[trimmedVal];
          migrationMeta.migratedCollisionIds[trimmedVal] = Array.from(
            new Set([...(migrationMeta.migratedCollisionIds[trimmedVal] || []), singleEmail])
          );

          const diskBeforeSingleCommit = getMigrationMetadata();
          const mergedSingleCommit = mergeMigrationMetadata(diskBeforeSingleCommit, migrationMeta);
          if (!setMigrationMetadata(mergedSingleCommit)) {
            if (prevRetryMarker) {
              migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
              migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`] = true;
            } else {
              migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
              migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`] = true;
            }
            if (prevRekeyed === undefined) {
              delete migrationMeta.rekeyedOwnerIds[trimmedVal];
            } else {
              migrationMeta.rekeyedOwnerIds[trimmedVal] = prevRekeyed;
            }
            if (prevMigrated === undefined) {
              delete migrationMeta.migratedCollisionIds[trimmedVal];
            } else {
              migrationMeta.migratedCollisionIds[trimmedVal] = prevMigrated;
            }
            continue;
          }

          map[singleEmail] = expectedInjectiveId;
          meta[singleEmail] = {
            accountId: expectedInjectiveId,
            type: meta[singleEmail]?.type || "primary",
            phone: meta[singleEmail]?.phone,
            updatedAt: Date.now(),
          };
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

        const targetAccountIdForSingleEmail = (isQuarantinedAccountId(trimmedVal) || isLegacyLossy)
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
            const rawP = meta[em].phone;
            const p = normalizeExplicitPhoneToken(rawP);
            if (p && !singleOwnerPhones.includes(p)) {
              const isUnresolved = Boolean(
                meta[p]?.status === "unresolved" ||
                meta[rawP]?.status === "unresolved" ||
                migrationMeta.unresolvedPhoneAliases?.[p] ||
                migrationMeta.unresolvedPhoneAliases?.[rawP]
              );
              if (isUnresolved) continue;

              const recOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
              const resOwner = recOwner ? getVerifiedRootOwner(recOwner, meta) : undefined;
              const hasConflictingReverse = Object.entries(meta).some(([otherEm, otherMeta]) => {
                if (!otherEm.includes("@")) return false;
                const normEm = otherEm.toLowerCase().trim();
                const emRoot = (getVerifiedRootOwner(normEm, meta) || normEm).toLowerCase().trim();
                if (ownerCluster.emails.includes(normEm) || ownerCluster.emails.includes(emRoot) || emRoot === ownerCluster.canonicalEmail) return false;
                return normalizeExplicitPhoneToken(otherMeta?.phone) === p;
              });
              if (!hasConflictingReverse && (!recOwner || (resOwner && (ownerCluster.emails.includes(resOwner) || resOwner === ownerCluster.canonicalEmail)))) {
                singleOwnerPhones.push(p);
              }
            }
          }
        }
        for (const p of nonEmailKeys) {
          const normP = normalizeExplicitPhoneToken(p) || p;
          if (!normP) continue;

          const isUnresolved = Boolean(
            meta[p]?.status === "unresolved" ||
            meta[normP]?.status === "unresolved" ||
            migrationMeta.unresolvedPhoneAliases?.[p] ||
            migrationMeta.unresolvedPhoneAliases?.[normP]
          );
          if (isUnresolved) continue;

          const claimingEmails: string[] = [];
          for (const [em, emMeta] of Object.entries(meta)) {
            if (em.includes("@")) {
              const rawRev = emMeta?.phone;
              if (rawRev && (rawRev === p || normalizeExplicitPhoneToken(rawRev) === normP)) {
                claimingEmails.push(em.toLowerCase().trim());
              }
            }
          }
          const hasConflictingReverse = claimingEmails.some((otherEm) => {
            const root = (getVerifiedRootOwner(otherEm, meta) || otherEm).toLowerCase().trim();
            return !ownerCluster.emails.includes(root) && root !== ownerCluster.canonicalEmail;
          });
          const hasClusterReverseClaim = claimingEmails.some((em) => {
            const root = (getVerifiedRootOwner(em, meta) || em).toLowerCase().trim();
            return ownerCluster.emails.includes(root) || root === ownerCluster.canonicalEmail;
          });
          const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = recordedOwner ? getVerifiedRootOwner(recordedOwner, meta) : undefined;
          const hasClusterRecordedOwner = Boolean(
            resolvedOwner &&
            (ownerCluster.emails.includes(resolvedOwner) || resolvedOwner === ownerCluster.canonicalEmail)
          );
          const belongsToCluster = Boolean(
            !hasConflictingReverse && (
              hasClusterRecordedOwner || (!recordedOwner && hasClusterReverseClaim)
            )
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
          if (migrationMeta.clearedQuarantineKeys) {
            delete migrationMeta.clearedQuarantineKeys[`retry_migration_${trimmedVal}`];
            const safeVal = trimmedVal.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
            delete migrationMeta.clearedQuarantineKeys[`retry_migration_${safeVal}`];
          }
          try {
            localStorage.removeItem(`palluvo_tombstone_retry_migration_${trimmedVal}`);
          } catch {}
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
              `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${safeVal}`,
              `palluvo_quarantine_foreign_palluvo_ecommerce_orders_${trimmedVal}`,
              `palluvo_ecommerce_addresses_${safeVal}`,
              `palluvo_ecommerce_addresses_${trimmedVal}`,
              `palluvo_quarantine_palluvo_ecommerce_addresses_${safeVal}`,
              `palluvo_quarantine_palluvo_ecommerce_addresses_${trimmedVal}`,
              `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${safeVal}`,
              `palluvo_quarantine_foreign_palluvo_ecommerce_addresses_${trimmedVal}`,
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

        let clearSucceeded = true;
        if (hasRecordsFromDifferentOwner) {
          if (trimmedVal === canonicalId) {
            // Source is already canonical: copyCustomerData has rewritten the canonical bucket
            // with only validated records, and quarantined foreign records away from canonicalId.
            // DO NOT quarantine the canonical bucket or tombstone canonicalId!
            clearSucceeded = clearFalseQuarantine(trimmedVal, canonicalId, migrationMeta);
          } else {
            // Shared legacy bucket still contains records from another explicit owner:
            // Keep the legacy bucket quarantined so records with a different owner remain isolated!
            quarantineLegacyBucket(trimmedVal, ownerCluster.emails, migrationMeta);
            if (migrationMeta.failedQuarantineKeys?.[`deferred_quarantine_${trimmedVal}`]) {
              clearSucceeded = false;
            } else {
              clearSucceeded = clearFalseQuarantine(canonicalId, canonicalId, migrationMeta);
            }
          }
        } else {
          clearSucceeded = clearFalseQuarantine(trimmedVal, canonicalId, migrationMeta);
          if (clearSucceeded && trimmedVal !== canonicalId) {
            clearSucceeded = clearFalseQuarantine(canonicalId, canonicalId, migrationMeta);
          }
        }

        if (!clearSucceeded) {
          migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
          migrationMeta.failedQuarantineKeys[`retry_migration_${trimmedVal}`] = true;
          setMigrationMetadata(migrationMeta);
          continue;
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
          const normP = normalizeExplicitPhoneToken(p) || p;
          const claimingEmails: string[] = [];
          for (const [em, emMeta] of Object.entries(meta)) {
            if (em.includes("@")) {
              const rawRev = emMeta?.phone;
              if (rawRev && (rawRev === p || normalizeExplicitPhoneToken(rawRev) === normP)) {
                claimingEmails.push(em.toLowerCase().trim());
              }
            }
          }
          const hasConflictingReverse = claimingEmails.some((otherEm) => {
            const root = (getVerifiedRootOwner(otherEm, meta) || otherEm).toLowerCase().trim();
            return !ownerCluster.emails.includes(root) && root !== ownerCluster.canonicalEmail;
          });
          const hasClusterReverseClaim = claimingEmails.some((em) => {
            const root = (getVerifiedRootOwner(em, meta) || em).toLowerCase().trim();
            return ownerCluster.emails.includes(root) || root === ownerCluster.canonicalEmail;
          });
          const recordedOwner = meta[p]?.ownerEmail?.toLowerCase().trim();
          const resolvedOwner = recordedOwner ? getVerifiedRootOwner(recordedOwner, meta) : undefined;
          const hasClusterRecordedOwner = Boolean(
            resolvedOwner &&
            (ownerCluster.emails.includes(resolvedOwner) || resolvedOwner === ownerCluster.canonicalEmail)
          );
          const belongsToCluster = Boolean(
            !hasConflictingReverse && (
              hasClusterRecordedOwner || (!recordedOwner && hasClusterReverseClaim)
            )
          );

          if (!belongsToCluster) {
            const isolatedId = `usr_phone_${p}`;
            map[p] = isolatedId;

            const candEmails = Array.from(new Set([
              ...ownerCluster.emails,
              ...claimingEmails,
              ...(recordedOwner ? [recordedOwner] : []),
              ...(resolvedOwner ? [resolvedOwner] : []),
            ]));

            const candAccIds = new Set<string>([canonicalId]);
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
          quarantineLegacyBucket(trimmedVal, emailKeys, migrationMeta);
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
      const currentMeta = getMigrationMetadata();
      const mergedMeta = mergeMigrationMetadata(currentMeta, migrationMeta);
      if (setMigrationMetadata(mergedMeta)) {
        localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
        setAccountMetadata(meta);
      }
    } else {
      const currentMeta = getMigrationMetadata();
      const mergedMeta = mergeMigrationMetadata(currentMeta, migrationMeta);
      if (JSON.stringify(mergedMeta) !== JSON.stringify(currentMeta)) {
        if (setMigrationMetadata(mergedMeta)) {
          setAccountMetadata(meta);
        }
      } else {
        setAccountMetadata(meta);
      }
    }

    // Review and repair any stranded records in the shared unknown quarantine
    reviewAndRepairQuarantinedUnknownRecords();
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

    const recoverAndCommitInjectiveEmail = (
      emailKey: string,
      sourceId: string,
      targetInjectiveId: string
    ): string => {
      const safeSourceId = sourceId.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
      const legacyBucketId = getDirectLegacyEmailId(emailKey);
      const safeLegacyBucketId = legacyBucketId.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);

      // Clear earlier retry markers and any stale retry clear markers when starting a new recovery attempt
      const retryKeysToClear = [
        `retry_migration_${sourceId}`,
        `retry_migration_${safeSourceId}`,
        `retry_migration_${legacyBucketId}`,
        `retry_migration_${safeLegacyBucketId}`,
        `retry_migration_${targetInjectiveId}`,
      ];
      for (const rk of retryKeysToClear) {
        if (migrationMeta.clearedQuarantineKeys) {
          delete migrationMeta.clearedQuarantineKeys[rk];
        }
        if (migrationMeta.failedQuarantineKeys) {
          delete migrationMeta.failedQuarantineKeys[rk];
        }
        try {
          localStorage.removeItem(`palluvo_tombstone_${rk}`);
        } catch {}
      }
      try {
        const diskMeta = getMigrationMetadata();
        for (const rk of retryKeysToClear) {
          if (diskMeta.clearedQuarantineKeys) {
            delete diskMeta.clearedQuarantineKeys[rk];
          }
          if (diskMeta.failedQuarantineKeys) {
            delete diskMeta.failedQuarantineKeys[rk];
          }
        }
        setMigrationMetadata(diskMeta);
      } catch {}

      if (legacyBucketId !== targetInjectiveId && !isQuarantinedAccountId(legacyBucketId)) {
        quarantineLegacyBucket(legacyBucketId, [emailKey], migrationMeta);
      }

      const copy1Success = copyCustomerData(sourceId, targetInjectiveId, {
        filterByOwnerEmail: emailKey,
        allowedEmails: [emailKey],
      });
      let copy2Success = true;
      if (legacyBucketId !== sourceId && legacyBucketId !== targetInjectiveId) {
        copy2Success = copyCustomerData(legacyBucketId, targetInjectiveId, {
          filterByOwnerEmail: emailKey,
          allowedEmails: [emailKey],
        });
      }

      if (!copy1Success || !copy2Success) {
        // Keep the old mapping until both recovery copies succeed.
        // Preserve a retryable source/migration marker on failure.
        const currentMeta = getMigrationMetadata();
        const failureSnapshot: MigrationMeta = {
          ...migrationMeta,
          failedQuarantineKeys: {
            ...(migrationMeta.failedQuarantineKeys || {}),
            [`retry_migration_${sourceId}`]: true,
            ...(legacyBucketId !== sourceId && legacyBucketId !== targetInjectiveId
              ? { [`retry_migration_${legacyBucketId}`]: true }
              : {}),
          },
        };
        const mergedMeta = mergeMigrationMetadata(currentMeta, failureSnapshot);
        // Do not keep an old or premature redirect that would bypass retrying this failed copy
        if (mergedMeta.rekeyedOwnerIds) {
          delete mergedMeta.rekeyedOwnerIds[sourceId];
          delete mergedMeta.rekeyedOwnerIds[safeSourceId];
          if (legacyBucketId !== targetInjectiveId) {
            delete mergedMeta.rekeyedOwnerIds[legacyBucketId];
            delete mergedMeta.rekeyedOwnerIds[safeLegacyBucketId];
          }
        }
        try {
          setMigrationMetadata(mergedMeta);
        } catch {}
        return sourceId;
      }

      // Both recovery copies succeeded: commit the rekey only if migration metadata persists
      const currentMeta = getMigrationMetadata();
      const successSnapshot: MigrationMeta = {
        ...migrationMeta,
        rekeyedOwnerIds: {
          ...(migrationMeta.rekeyedOwnerIds || {}),
          [sourceId]: targetInjectiveId,
          ...(legacyBucketId !== targetInjectiveId ? { [legacyBucketId]: targetInjectiveId } : {}),
        },
      };
      const mergedMeta = mergeMigrationMetadata(currentMeta, successSnapshot);
      if (mergedMeta.failedQuarantineKeys) {
        delete mergedMeta.failedQuarantineKeys[`retry_migration_${sourceId}`];
        delete mergedMeta.failedQuarantineKeys[`retry_migration_${safeSourceId}`];
        delete mergedMeta.failedQuarantineKeys[`retry_migration_${legacyBucketId}`];
        delete mergedMeta.failedQuarantineKeys[`retry_migration_${safeLegacyBucketId}`];
      }

      if (!setMigrationMetadata(mergedMeta)) {
        migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
        migrationMeta.failedQuarantineKeys[`retry_migration_${sourceId}`] = true;
        return sourceId;
      }

      map[emailKey] = targetInjectiveId;
      meta[emailKey] = {
        ...meta[emailKey],
        accountId: targetInjectiveId,
        type: meta[emailKey]?.type || "primary",
        updatedAt: Date.now(),
      };
      try {
        localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
        setAccountMetadata(meta);
      } catch {}
      return targetInjectiveId;
    };

    // 1. Check whether val represents a quarantined/tombstoned ID for ANY identifier type
    if (isQuarantinedAccountId(val)) {
      const redirectedId = migrationMeta.rekeyedOwnerIds?.[val];
      const quarantinedEmails = migrationMeta.quarantinedLegacyBuckets?.[val]?.emails ||
        migrationMeta.quarantinedCollisionIds?.[val] || [];
      const safeVal = val.toLowerCase().replace(/[^a-z0-9_]/g, (ch) => `_${ch.charCodeAt(0).toString(16)}_`);
      const legacyBucketId = key.includes("@") ? getDirectLegacyEmailId(key) : null;
      const hasFailedMigration = Boolean(
        migrationMeta.failedQuarantineKeys?.[`retry_migration_${val}`] ||
        migrationMeta.failedQuarantineKeys?.[`retry_migration_${safeVal}`] ||
        (legacyBucketId && migrationMeta.failedQuarantineKeys?.[`retry_migration_${legacyBucketId}`])
      );

      if (redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration) {
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

      // If key is an email, recover from quarantined legacy source to injective ID
      if (key.includes("@")) {
        const expectedInjectiveId = key === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(key)}`;
        return recoverAndCommitInjectiveEmail(key, val, expectedInjectiveId);
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
          const targetId = (isInjectiveEmailAccountId(val) && val === ownerCluster.canonicalId)
            ? val
            : ownerCluster.canonicalId;
          if (val !== targetId) {
            if (!isQuarantinedAccountId(val)) {
              quarantineLegacyBucket(val, collisionEmails, migrationMeta);
            }
            migrationMeta.rekeyedOwnerIds = migrationMeta.rekeyedOwnerIds || {};
            migrationMeta.rekeyedOwnerIds[val] = targetId;
          }
          const copySuccess = copyCustomerData(val, targetId, {
            filterByOwnerEmail: ownerCluster.canonicalEmail,
            allowedEmails: ownerCluster.emails,
            verifiedPhones: [key]
              .map((p) => normalizeExplicitPhoneToken(p))
              .filter((p): p is string => {
                if (!p) return false;
                return !(
                  meta[p]?.status === "unresolved" ||
                  meta[`usr_phone_${p}`]?.status === "unresolved" ||
                  migrationMeta.unresolvedPhoneAliases?.[p] ||
                  migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${p}`]
                );
              }),
          });
          if (!copySuccess) {
            return val;
          }
          if (!clearFalseQuarantine(val, targetId, migrationMeta)) {
            migrationMeta.failedQuarantineKeys = migrationMeta.failedQuarantineKeys || {};
            migrationMeta.failedQuarantineKeys[`retry_migration_${val}`] = true;
            setMigrationMetadata(migrationMeta);
            return val;
          }
          const currentMeta = getMigrationMetadata();
          const mergedMeta = mergeMigrationMetadata(currentMeta, migrationMeta);
          if (!setMigrationMetadata(mergedMeta)) {
            return val;
          }
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
          } catch {}
          return targetId;
        }

        // True collision between distinct owners
        if (!migrationMeta.quarantinedLegacyBuckets?.[val]) {
          quarantineLegacyBucket(val, collisionEmails, migrationMeta);
        }

        const myCluster = partition.clusters.find((c) => c.emails.includes(key));
        const targetId = myCluster?.canonicalId || expectedInjectiveId;
        const currentMeta = getMigrationMetadata();
        migrationMeta.migratedCollisionIds[val] = Array.from(
          new Set([...(migrationMeta.migratedCollisionIds[val] || []), key])
        );
        const mergedMeta = mergeMigrationMetadata(currentMeta, migrationMeta);
        if (!setMigrationMetadata(mergedMeta)) {
          return val;
        }
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
        } catch {}
        return targetId;
      }

      if (val !== expectedInjectiveId) {
        if (!isQuarantinedAccountId(val)) {
          quarantineLegacyBucket(val, [key], migrationMeta);
        }
        return recoverAndCommitInjectiveEmail(key, val, expectedInjectiveId);
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

          const prevMeta = meta[key];
          const prevUnresolved = migrationMeta.unresolvedPhoneAliases?.[key];
          meta[key] = {
            ...meta[key],
            accountId: resolvedId,
            ownerEmail: resolvedOwnerEmail || meta[key]?.ownerEmail,
            phone: key,
            status: "active",
            updatedAt: Date.now(),
          };
          if (migrationMeta.unresolvedPhoneAliases?.[key]) {
            delete migrationMeta.unresolvedPhoneAliases[key];
          }

          const copyOptions: CopyCustomerDataOptions = {
            filterByOwnerEmail: resolvedOwnerEmail,
            allowedEmails: Array.from(allowedEmailSet),
            verifiedPhones: Array.from(new Set([key, meta[key]?.phone].map((p) => normalizeExplicitPhoneToken(p)).filter((p): p is string => {
              if (!p) return false;
              return !(
                meta[p]?.status === "unresolved" ||
                meta[`usr_phone_${p}`]?.status === "unresolved" ||
                migrationMeta.unresolvedPhoneAliases?.[p] ||
                migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${p}`]
              );
            }))),
          };

          let copySuccess = true;
          if (recordedLegacyId && recordedLegacyId !== resolvedId) {
            copySuccess = copyCustomerData(recordedLegacyId, resolvedId, copyOptions);
          }
          if (copySuccess && `usr_phone_${key}` !== resolvedId) {
            copySuccess = copyCustomerData(`usr_phone_${key}`, resolvedId, copyOptions);
          }

          if (!copySuccess || !setMigrationMetadata(migrationMeta)) {
            if (prevMeta) meta[key] = prevMeta;
            if (prevUnresolved) {
              migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
              migrationMeta.unresolvedPhoneAliases[key] = prevUnresolved;
            }
            return val;
          }

          map[key] = resolvedId;
          if (resolvedOwnerEmail && meta[resolvedOwnerEmail]) {
            meta[resolvedOwnerEmail] = {
              ...meta[resolvedOwnerEmail],
              phone: key,
              updatedAt: Date.now(),
            };
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
      const hasFailedMigration = Boolean(
        migrationMeta.failedQuarantineKeys?.[`retry_migration_${val}`]
      );
      if (redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration) {
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
      const hasFailedExisting = Boolean(
        migrationMeta.failedQuarantineKeys?.[`retry_migration_${map[key]}`]
      );
      if (existingRedirect !== val || hasFailedExisting) {
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

      const prevMeta = meta[key];
      const prevUnresolved = migrationMeta.unresolvedPhoneAliases?.[key];
      meta[key] = {
        ...meta[key],
        accountId: val,
        ownerEmail: effectiveOwnerEmail,
        phone: effectivePhone || key,
        status: "active",
        updatedAt: Date.now(),
      };
      if (migrationMeta.unresolvedPhoneAliases?.[key]) {
        delete migrationMeta.unresolvedPhoneAliases[key];
      }

      const copyOptions: CopyCustomerDataOptions = {
        filterByOwnerEmail: resolvedOwnerEmail,
        allowedEmails: Array.from(allowedEmailSet),
        verifiedPhones: Array.from(new Set([key, effectivePhone, meta[key]?.phone].map((p) => normalizeExplicitPhoneToken(p)).filter((p): p is string => {
          if (!p) return false;
          return !(
            meta[p]?.status === "unresolved" ||
            meta[`usr_phone_${p}`]?.status === "unresolved" ||
            migrationMeta.unresolvedPhoneAliases?.[p] ||
            migrationMeta.unresolvedPhoneAliases?.[`usr_phone_${p}`]
          );
        }))),
      };

      let copySuccess = true;
      if (recordedLegacyId && recordedLegacyId !== val) {
        copySuccess = copyCustomerData(recordedLegacyId, val, copyOptions);
      }
      if (copySuccess && `usr_phone_${key}` !== val) {
        copySuccess = copyCustomerData(`usr_phone_${key}`, val, copyOptions);
      }

      if (!copySuccess || !setMigrationMetadata(migrationMeta)) {
        // Do not persist the phone alias when its data copy or migration metadata persistence fails.
        // Retain the unresolved mapping/metadata and return false before persisting the map.
        if (prevMeta) meta[key] = prevMeta;
        if (prevUnresolved) {
          migrationMeta.unresolvedPhoneAliases = migrationMeta.unresolvedPhoneAliases || {};
          migrationMeta.unresolvedPhoneAliases[key] = prevUnresolved;
        }
        return false;
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
    const hasFailedMigration = Boolean(
      migrationMeta.failedQuarantineKeys?.[`retry_migration_${accountId}`]
    );
    if (redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration) {
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
        const hasFailedMigration = Boolean(
          migrationMeta.failedQuarantineKeys?.[`retry_migration_${user.id}`]
        );
        if (redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration) {
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
        const hasFailedMigration = Boolean(
          migrationMeta.failedQuarantineKeys?.[`retry_migration_${user.id}`]
        );
        const targetId = redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration
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
          const hasFailedMigration = Boolean(
            migrationMeta.failedQuarantineKeys?.[`retry_migration_${id}`]
          );
          if (redirectedId && !isQuarantinedAccountId(redirectedId) && !hasFailedMigration) {
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
