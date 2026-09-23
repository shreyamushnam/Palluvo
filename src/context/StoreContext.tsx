"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, PRODUCTS } from "@/data/products";
import { OrderRecord, MOCK_ORDERS } from "@/data/mockOrders";

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
  cart: CartItem[];
  wishlist: string[];
  orders: OrderRecord[];
  isCartOpen: boolean;
  isSearchOpen: boolean;
  quickViewProduct: Product | null;
  couponCode: string;
  discountAmount: number;
  appliedCoupon: string | null;
  toast: ToastInfo | null;
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
  finalTotal: number;
  cartCount: number;
  wishlistCount: number;
  addToCart: (product: Product, quantity?: number, selectedColor?: string, blouseOption?: string) => void;
  removeFromCart: (productId: string, selectedColor?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedColor?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  placeOrder: (order: Omit<OrderRecord, "id" | "orderNumber" | "date" | "status" | "deliveryDate">) => OrderRecord;
  setIsCartOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  showToast: (message: string, type?: "success" | "info") => void;
  formatPrice: (amount: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(["pal-001", "pal-004"]);
  const [orders, setOrders] = useState<OrderRecord[]>(MOCK_ORDERS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("palluvo_ecommerce_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        // Seed initial cart item for instant e-commerce demonstration
        setCart([{ product: PRODUCTS[0], quantity: 1, selectedColor: "Wine", blouseOption: "Unstitched (Included)" }]);
      }
      const savedWishlist = localStorage.getItem("palluvo_ecommerce_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
      const savedOrders = localStorage.getItem("palluvo_ecommerce_orders");
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem("palluvo_ecommerce_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("palluvo_ecommerce_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem("palluvo_ecommerce_orders", JSON.stringify(orders));
    } catch {}
  }, [orders]);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3200);
  };

  const addToCart = (product: Product, quantity = 1, selectedColor?: string, blouseOption = "Unstitched (Included)") => {
    const color = selectedColor || product.color;
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }
      return [...prev, { product, quantity, selectedColor: color, blouseOption }];
    });
    setIsCartOpen(true);
    showToast(`Added ${product.name} to Bag!`);
  };

  const removeFromCart = (productId: string, selectedColor?: string) => {
    setCart((prev) =>
      prev.filter((item) => {
        if (selectedColor) {
          return !(item.product.id === productId && item.selectedColor === selectedColor);
        }
        return item.product.id !== productId;
      })
    );
    showToast("Item removed from Bag", "info");
  };

  const updateQuantity = (productId: string, quantity: number, selectedColor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedColor);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const matches = selectedColor
          ? item.product.id === productId && item.selectedColor === selectedColor
          : item.product.id === productId;
        return matches ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const toggleWishlist = (productId: string) => {
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
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1999;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 149;

  // Re-calculate coupon discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon === "PALLUVO10") {
      setDiscountAmount(Math.round(subtotal * 0.1));
    }
  }, [subtotal, appliedCoupon]);

  const applyCoupon = (code: string) => {
    const formatted = code.trim().toUpperCase();
    if (formatted === "PALLUVO10") {
      setAppliedCoupon("PALLUVO10");
      setDiscountAmount(Math.round(subtotal * 0.1));
      showToast("Coupon PALLUVO10 applied: 10% discount!");
      return { success: true, message: "10% discount applied successfully!" };
    } else if (formatted === "MAGIC500" && subtotal >= 3000) {
      setAppliedCoupon("MAGIC500");
      setDiscountAmount(500);
      showToast("Coupon MAGIC500 applied: ₹500 discount!");
      return { success: true, message: "₹500 discount applied successfully!" };
    }
    return { success: false, message: "Invalid or expired coupon code. Try 'PALLUVO10'" };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    showToast("Coupon removed", "info");
  };

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const placeOrder = (orderData: Omit<OrderRecord, "id" | "orderNumber" | "date" | "status" | "deliveryDate">): OrderRecord => {
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
  };

  const formatPrice = (amount: number): string => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        couponCode,
        discountAmount,
        appliedCoupon,
        toast,
        subtotal,
        shippingFee,
        freeShippingThreshold,
        finalTotal,
        cartCount,
        wishlistCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        applyCoupon,
        removeCoupon,
        placeOrder,
        setIsCartOpen,
        setIsSearchOpen,
        setQuickViewProduct,
        showToast,
        formatPrice,
      }}
    >
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
