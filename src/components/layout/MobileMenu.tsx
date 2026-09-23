"use client";

import React from "react";
import Link from "next/link";
import { X, Search, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const MobileMenu: React.FC = () => {
  const {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    setIsSearchOpen,
    setIsWishlistOpen,
    setIsCartOpen,
    wishlistCount,
    cartCount,
  } = useStore();

  if (!isMobileMenuOpen) return null;

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF7F2] text-[#1C1A18] animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="p-6 flex items-center justify-between border-b border-[#1C1A18]/10">
        <Link href="/" onClick={handleLinkClick}>
          <span className="font-serif-display text-2xl tracking-[0.2em] uppercase font-medium">
            PALLUVO
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
          aria-label="Close menu"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col justify-between">
        <nav className="flex flex-col space-y-6">
          {[
            { label: "New Arrivals", href: "#shop-section", tag: "Edition 01" },
            { label: "Sarees & Weaves", href: "#shop-section" },
            { label: "Signature Collections", href: "#collections-section" },
            { label: "Drape Stories & Guide", href: "#drape-stories-section", tag: "Interactive" },
            { label: "Fabric Architecture", href: "#fabric-closeup-section" },
            { label: "The PALLUVO Journal", href: "#journal-section" },
            { label: "The PALLUVO Mood", href: "#mood-section" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              onClick={handleLinkClick}
              className="group flex items-center justify-between font-serif-display text-2xl tracking-wide hover:text-[#541920] transition-colors py-1 border-b border-transparent hover:border-[#C5A575]/40"
            >
              <span className="flex items-center gap-3">
                {item.label}
                {item.tag && (
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#541920]/10 text-[#541920] font-sans-body">
                    {item.tag}
                  </span>
                )}
              </span>
              <ArrowRight
                size={16}
                className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-[#C5A575]"
              />
            </a>
          ))}
        </nav>

        {/* Bottom Utility Drawer */}
        <div className="pt-8 border-t border-[#1C1A18]/10 flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                handleLinkClick();
                setIsSearchOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 bg-[#F5EFEB] text-[11px] uppercase tracking-wider text-[#1C1A18]"
            >
              <Search size={14} /> Search
            </button>
            <button
              onClick={() => {
                handleLinkClick();
                setIsWishlistOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 bg-[#F5EFEB] text-[11px] uppercase tracking-wider text-[#1C1A18]"
            >
              <Heart size={14} /> Wishlist ({wishlistCount})
            </button>
            <button
              onClick={() => {
                handleLinkClick();
                setIsCartOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 bg-[#1C1A18] text-[#FAF7F2] text-[11px] uppercase tracking-wider"
            >
              <ShoppingBag size={14} /> Bag ({cartCount})
            </button>
          </div>

          <p className="text-[10px] text-center tracking-[0.2em] text-[#8A857E] uppercase">
            Every drape, a little magic • PALLUVO Luxury Couture
          </p>
        </div>
      </div>
    </div>
  );
};
