"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, PRODUCTS } from "@/data/products";
import { Article } from "@/data/articles";

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Currency = "INR" | "USD" | "EUR" | "GBP";

interface StoreContextType {
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  quickViewProduct: Product | null;
  activeArticle: Article | null;
  currency: Currency;
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  setQuickViewProduct: (product: Product | null) => void;
  setActiveArticle: (article: Article | null) => void;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInINR: number) => string;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number }> = {
  INR: { symbol: "₹", rate: 1 },
  USD: { symbol: "$", rate: 0.012 },
  EUR: { symbol: "€", rate: 0.011 },
  GBP: { symbol: "£", rate: 0.0095 },
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Pre-load default cart item for realistic luxury boutique experience
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(["pal-001", "pal-003"]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [currency, setCurrency] = useState<Currency>("INR");

  // Load from localStorage safely on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("palluvo_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        // seed with 1 default luxury item for demonstration
        setCart([{ product: PRODUCTS[0], quantity: 1 }]);
      }
      const savedWishlist = localStorage.getItem("palluvo_wishlist");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Save changes
  useEffect(() => {
    try {
      localStorage.setItem("palluvo_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("palluvo_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const formatPrice = (amountInINR: number): string => {
    const config = CURRENCY_RATES[currency];
    const converted = amountInINR * config.rate;
    if (currency === "INR") {
      return `₹${amountInINR.toLocaleString("en-IN")}`;
    }
    return `${config.symbol}${converted.toLocaleString("en-US", {
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        isCartOpen,
        isWishlistOpen,
        isSearchOpen,
        isMobileMenuOpen,
        quickViewProduct,
        activeArticle,
        currency,
        cartCount,
        wishlistCount,
        subtotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        setIsCartOpen,
        setIsWishlistOpen,
        setIsSearchOpen,
        setIsMobileMenuOpen,
        setQuickViewProduct,
        setActiveArticle,
        setCurrency,
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
