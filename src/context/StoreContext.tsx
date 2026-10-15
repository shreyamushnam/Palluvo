"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Product, PRODUCTS } from "@/data/products";
import { OrderRecord, OrderProductItem, MOCK_ORDERS, SavedAddress, MOCK_ADDRESSES } from "@/data/mockOrders";

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
  user: { name: string; email: string } | null;
  login: (user?: { name: string; email: string }) => void;
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
    const blouseOption =
      typeof rawBlouse === "string" && rawBlouse.trim().length > 0
        ? rawBlouse.trim()
        : undefined;

    normalized.push({
      product: canonicalProduct,
      quantity,
      selectedColor,
      blouseOption,
    });
  }

  return normalized;
}

/**
 * Validates and normalizes raw parsed auth data from storage.
 * Handles null, primitives, non-objects, and missing or malformed fields safely.
 * Only accepts literal booleans for isLoggedIn, defaulting malformed/non-boolean values to false.
 */
export function validateAndNormalizeAuth(raw: unknown): {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
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
      user: { name: "Radhika Sharma", email: "radhika.sharma@example.com" },
    };
  }

  const userObj = rawUser as { name?: unknown; email?: unknown };
  const name =
    typeof userObj.name === "string" && userObj.name.trim().length > 0
      ? userObj.name.trim()
      : "Radhika Sharma";
  const email =
    typeof userObj.email === "string" && userObj.email.trim().length > 0
      ? userObj.email.trim()
      : "radhika.sharma@example.com";

  return {
    isLoggedIn: true,
    user: { name, email },
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
      if (typeof p.name !== "string" || p.name.trim().length === 0) continue;

      const rawPrice = p.price;
      const price = typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice >= 0 ? rawPrice : 0;

      const rawQty = p.quantity;
      const quantity = typeof rawQty === "number" && Number.isFinite(rawQty) && rawQty >= 1 ? Math.floor(rawQty) : 1;

      const image =
        typeof p.image === "string" && p.image.trim().length > 0
          ? p.image.trim()
          : "/images/hero-saree.jpg";

      const color = typeof p.color === "string" ? p.color.trim() : "";

      validItems.push({
        id: p.id.trim(),
        name: p.name.trim(),
        image,
        price,
        quantity,
        color,
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
        ? rawPhone.trim()
        : typeof rawPhone === "number" && Number.isFinite(rawPhone)
        ? String(rawPhone)
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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydratedRef = useRef(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(["pal-001", "pal-004"]);
  const [orders, setOrders] = useState<OrderRecord[]>(MOCK_ORDERS);
  const [addresses, setAddresses] = useState<SavedAddress[]>(MOCK_ADDRESSES);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

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
        setCart([{ product: PRODUCTS[0], quantity: 1, selectedColor: "Wine", blouseOption: "Unstitched (Included)" }]);
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

    // 4. Orders: load, validate records and nested items, discard malformed entries
    try {
      const savedOrders = localStorage.getItem("palluvo_ecommerce_orders");
      if (savedOrders !== null) {
        try {
          const parsed = JSON.parse(savedOrders);
          const validated = validateAndNormalizeOrders(parsed);
          setOrders(validated);
        } catch {}
      }
    } catch {
      // Storage access error fallback
    }

    // 5. Addresses: load, validate records, discard malformed entries
    try {
      const savedAddresses = localStorage.getItem("palluvo_ecommerce_addresses");
      if (savedAddresses !== null) {
        try {
          const parsed = JSON.parse(savedAddresses);
          const validated = validateAndNormalizeAddresses(parsed);
          setAddresses(validated);
        } catch {}
      }
    } catch {
      // Storage access error fallback
    }

    // Mark hydration complete only after all storage keys have finished loading
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

  const login = useCallback((userData?: { name: string; email: string }) => {
    setIsLoggedIn(true);
    setUser(userData || { name: "Radhika Sharma", email: "radhika.sharma@example.com" });
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
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
    try {
      localStorage.setItem("palluvo_ecommerce_orders", JSON.stringify(orders));
    } catch {}
  }, [orders, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isHydratedRef.current) return;
    try {
      localStorage.setItem("palluvo_ecommerce_addresses", JSON.stringify(addresses));
    } catch {}
  }, [addresses, isHydrated]);

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
      const finalBlouseOption = product.hasBlousePiece
        ? (blouseOption ?? product.blouseOptions?.[0] ?? "Unstitched (Included)")
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
      localStorage.removeItem("palluvo_ecommerce_orders");
    } catch {}
    showToast("Simulated order history cleared", "info");
  }, [showToast]);

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
