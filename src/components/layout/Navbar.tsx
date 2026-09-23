"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const {
    cartCount,
    wishlistCount,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsMobileMenuOpen,
  } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top micro announcement bar */}
      <div className="bg-[#1C1A18] text-[#FAF7F2] text-[10px] md:text-[11px] tracking-[0.22em] uppercase py-2 px-4 text-center border-b border-[#3B0E14]/40 font-medium">
        <span>Handcrafted in India • Complimentary Bespoke Gift Packaging • Worldwide Express Courier</span>
      </div>

      <header
        className={`fixed top-8 left-0 right-0 z-40 transition-all duration-500 ease-out ${
          isScrolled
            ? "glass-nav py-3.5 shadow-[0_4px_30px_rgba(28,26,24,0.04)]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors focus:outline-none focus:ring-1 focus:ring-[#C5A575]"
              aria-label="Open navigation menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors"
              aria-label="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>
          </div>

          {/* Left: Brand Wordmark */}
          <div className="flex flex-col items-center lg:items-start">
            <Link
              href="/"
              className="group flex flex-col items-center lg:items-start focus:outline-none"
            >
              <span className="font-serif-display text-2xl md:text-3xl tracking-[0.24em] font-medium uppercase text-[#1C1A18] group-hover:text-[#541920] transition-colors duration-300">
                PALLUVO
              </span>
              <span className="text-[9px] uppercase tracking-[0.32em] text-[#8A857E] font-light -mt-0.5">
                Every drape, a little magic
              </span>
            </Link>
          </div>

          {/* Center Navigation Links (Editorial Magazine Style) */}
          <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10 text-[12px] uppercase tracking-[0.18em] font-medium text-[#1C1A18]">
            <a
              href="#shop-section"
              className="relative py-1 hover:text-[#541920] transition-colors duration-200 group"
            >
              New Arrivals
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#shop-section"
              className="relative py-1 hover:text-[#541920] transition-colors duration-200 group"
            >
              Sarees
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#collections-section"
              className="relative py-1 hover:text-[#541920] transition-colors duration-200 group"
            >
              Collections
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#drape-stories-section"
              className="relative py-1 hover:text-[#541920] transition-colors duration-200 group"
            >
              Drape Stories
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#journal-section"
              className="relative py-1 hover:text-[#541920] transition-colors duration-200 group"
            >
              Journal
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
            </a>
            <a
              href="#mood-section"
              className="relative py-1 hover:text-[#541920] transition-colors duration-200 group"
            >
              About
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-3.5 sm:space-x-5">
            {/* Search (Desktop) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden lg:flex items-center gap-2 p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors"
              aria-label="Search catalogue"
              title="Search"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Account Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors"
                aria-label="Account profile"
                title="Account"
              >
                <User size={19} strokeWidth={1.5} />
              </button>

              {isAccountOpen && (
                <div
                  className="absolute right-0 mt-3 w-56 bg-[#FAF7F2] border border-[#C5A575]/30 p-4 shadow-xl z-50 text-left animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setIsAccountOpen(false)}
                >
                  <p className="text-[11px] uppercase tracking-wider text-[#8A857E] mb-2 font-medium">
                    Welcome to PALLUVO
                  </p>
                  <p className="font-serif-display text-base text-[#1C1A18] mb-3">
                    Collector&apos;s Circle
                  </p>
                  <button
                    onClick={() => {
                      alert("PALLUVO Patron Concierge: Log in or register for bespoke appointment bookings & priority textile drops.");
                      setIsAccountOpen(false);
                    }}
                    className="w-full py-2 bg-[#1C1A18] hover:bg-[#541920] text-[#FAF7F2] text-[11px] uppercase tracking-widest transition-colors mb-2"
                  >
                    Sign In / Register
                  </button>
                  <div className="border-t border-[#1C1A18]/10 pt-2 flex flex-col space-y-1.5 text-[11px] text-[#5E5A54]">
                    <a href="#shop-section" className="hover:text-[#541920] transition-colors">Order Tracking</a>
                    <a href="#mood-section" className="hover:text-[#541920] transition-colors">Bespoke Fitting Concierge</a>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors relative"
              aria-label={`Wishlist with ${wishlistCount} items`}
              title="Wishlist"
            >
              <Heart size={19} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#BF6A54] text-[#FAF7F2] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors relative flex items-center gap-1.5"
              aria-label={`Shopping bag with ${cartCount} items`}
              title="Shopping Bag"
            >
              <div className="relative">
                <ShoppingBag size={19} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#541920] text-[#FAF7F2] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
