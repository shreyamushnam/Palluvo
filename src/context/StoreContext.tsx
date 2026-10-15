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
 * Migrates existing legacy collision-prone email and phone aliases in palluvo_account_identity_map
 * to distinct injective IDs.
 * Make migration key-aware: only remaps aliases proven to be direct legacy mappings for that same email
 * (or belonging to confirmed collision groups where multiple distinct emails point to the same ID),
 * and strictly preserves aliases pointing to an existing immutable account ID (such as when a customer
 * changed their email before the migration).
 */
export function migrateLegacyAccountAliases(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    if (!raw) return;
    const map = JSON.parse(raw);
    if (!map || typeof map !== "object" || Array.isArray(map)) return;
    let modified = false;

    // Build collision frequency map for email aliases to detect confirmed collision groups
    const collisionCounts = new Map<string, string[]>();
    for (const [k, v] of Object.entries(map)) {
      if (typeof v === "string" && k.toLowerCase().includes("@")) {
        const trimmedVal = v.trim();
        const list = collisionCounts.get(trimmedVal) || [];
        list.push(k.toLowerCase().trim());
        collisionCounts.set(trimmedVal, list);
      }
    }

    for (const key of Object.keys(map)) {
      const val = map[key];
      if (typeof val !== "string") {
        delete map[key];
        modified = true;
        continue;
      }
      const trimmedVal = val.trim();
      const lowerKey = key.toLowerCase().trim();

      if (lowerKey.includes("@")) {
        const expectedInjectiveId = lowerKey === "radhika.sharma@example.com"
          ? "usr_demo_radhika"
          : `usr_email_${encodeIdentifierToId(lowerKey)}`;

        // Only remap aliases proven to be direct legacy mappings for that same email,
        // or aliases belonging to confirmed collision groups (where multiple distinct emails point to the same ID).
        // Strictly preserve aliases to an existing immutable account ID.
        const isDirectLegacy = trimmedVal === getDirectLegacyEmailId(lowerKey) && trimmedVal !== expectedInjectiveId;
        const isCollisionGroup = (collisionCounts.get(trimmedVal)?.length ?? 0) > 1 && trimmedVal === getDirectLegacyEmailId(lowerKey);

        if (isDirectLegacy || isCollisionGroup) {
          map[key] = expectedInjectiveId;
          modified = true;
        }
      } else if (trimmedVal.startsWith("usr_phone_")) {
        const phoneDigits = trimmedVal.slice("usr_phone_".length);
        if (phoneDigits.length < 10) {
          delete map[key];
          modified = true;
        }
      }
    }

    if (modified) {
      localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
    }
  } catch {}
}

/**
 * Returns a known immutable account ID mapped to an identifier (email or phone digits), if any.
 * Key-aware: remaps proven direct legacy mappings for that same email or confirmed collision groups,
 * and preserves valid aliases pointing to existing immutable account IDs.
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

        let count = 0;
        for (const [k, v] of Object.entries(map)) {
          if (typeof v === "string" && v.trim() === val && k.toLowerCase().includes("@")) {
            count++;
          }
        }

        const isDirectLegacy = val === getDirectLegacyEmailId(key) && val !== expectedInjectiveId;
        const isCollisionGroup = count > 1 && val === getDirectLegacyEmailId(key);

        if (isDirectLegacy || isCollisionGroup) {
          map[key] = expectedInjectiveId;
          try {
            localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
          } catch {}
          return expectedInjectiveId;
        }
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
 * Returns true if registered successfully (or already owned by accountId); false if owned by another account.
 */
export function registerAccountAlias(identifier: string, accountId: string): boolean {
  if (!identifier || !accountId) return false;
  const key = identifier.toLowerCase().trim();
  const val = accountId.trim();
  if (!key || !val) return false;
  try {
    const raw = localStorage.getItem(ACCOUNT_MAP_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};

    // Invalidate stale alias if it was a direct legacy mapping for this key being upgraded to injective ID
    if (key.includes("@") && map[key] && typeof map[key] === "string") {
      const existingVal = map[key].trim();
      const expectedInjectiveId = key === "radhika.sharma@example.com"
        ? "usr_demo_radhika"
        : `usr_email_${encodeIdentifierToId(key)}`;
      const isDirectLegacy = existingVal === getDirectLegacyEmailId(key) && existingVal !== expectedInjectiveId;
      if (isDirectLegacy && val === expectedInjectiveId) {
        delete map[key];
      }
    }

    // Reject if already mapped to a different account ID
    if (map[key] && map[key] !== val) {
      return false;
    }
    map[key] = val;
    localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
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
    if (map[key] === val) {
      delete map[key];
      localStorage.setItem(ACCOUNT_MAP_KEY, JSON.stringify(map));
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
    const expectedInjectiveId = email.toLowerCase() === "radhika.sharma@example.com"
      ? "usr_demo_radhika"
      : `usr_email_${encodeIdentifierToId(email)}`;
    // Only upgrade if rawId was a direct legacy mapping for this same email
    // and lookupAccountId migrated it to the injective ID.
    // Strictly preserve aliases pointing to existing immutable account IDs.
    if (id === getDirectLegacyEmailId(email) && id !== expectedInjectiveId) {
      const remapped = lookupAccountId(email);
      if (remapped === expectedInjectiveId) {
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
  const accountId = user.id && user.id.trim() ? user.id.trim() : generateAccountId(user);
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

    // Migrate legacy collision-prone aliases to distinct injective IDs
    migrateLegacyAccountAliases();

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
      localStorage.setItem("palluvo_ecommerce_auth", JSON.stringify({ isLoggedIn, user }));
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

    // Clean up any legacy ambiguous collision-prone keys without copying to avoid attributing shared data to new IDs
    if (user.email) {
      const legacySanitized = user.email.toLowerCase().trim().replace(/[^a-z0-9_.-]/g, "_");
      const legacyEmailOrderKey = `palluvo_ecommerce_orders_${legacySanitized}`;
      if (legacyEmailOrderKey !== ordersKey) {
        try {
          localStorage.removeItem(legacyEmailOrderKey);
        } catch {}
      }
      const legacyPrefixedOrderKey = `palluvo_ecommerce_orders_usr_email_${legacySanitized}`;
      if (legacyPrefixedOrderKey !== ordersKey) {
        try {
          localStorage.removeItem(legacyPrefixedOrderKey);
        } catch {}
      }

      const legacyEmailAddrKey = `palluvo_ecommerce_addresses_${legacySanitized}`;
      if (legacyEmailAddrKey !== addressesKey) {
        try {
          localStorage.removeItem(legacyEmailAddrKey);
        } catch {}
      }
      const legacyPrefixedAddrKey = `palluvo_ecommerce_addresses_usr_email_${legacySanitized}`;
      if (legacyPrefixedAddrKey !== addressesKey) {
        try {
          localStorage.removeItem(legacyPrefixedAddrKey);
        } catch {}
      }
    }

    // Load user-scoped orders - retain only known mock seed data for demo account; never import unscoped legacy records
    try {
      const savedOrders = localStorage.getItem(ordersKey);
      if (savedOrders !== null) {
        setOrders(validateAndNormalizeOrders(JSON.parse(savedOrders)));
      } else if (isDemoUser) {
        setOrders(MOCK_ORDERS);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders(isDemoUser ? MOCK_ORDERS : []);
    }

    // Load user-scoped addresses - retain only known mock seed data for demo account; never import unscoped legacy records
    try {
      const savedAddresses = localStorage.getItem(addressesKey);
      if (savedAddresses !== null) {
        setAddresses(validateAndNormalizeAddresses(JSON.parse(savedAddresses)));
      } else if (isDemoUser) {
        setAddresses(MOCK_ADDRESSES);
      } else {
        setAddresses([]);
      }
    } catch {
      setAddresses(isDemoUser ? MOCK_ADDRESSES : []);
    }
  }, [isLoggedIn, user, isHydrated]);

  const login = useCallback((userData?: UserProfile) => {
    setIsLoggedIn(true);
    setUser((prevUser) => {
      if (userData) {
        const id = userData.id || prevUser?.id || generateAccountId(userData);
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
      localStorage.setItem(key, JSON.stringify(orders));
    } catch {}
  }, [orders, isLoggedIn, user, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    if (!isLoggedIn || !user) return;
    try {
      const key = getUserStorageKey(user, "addresses");
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
