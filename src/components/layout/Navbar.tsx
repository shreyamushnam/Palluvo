"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount, setIsCartOpen, setIsSearchOpen } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "New Arrivals", href: "/shop?category=New+Arrivals" },
    { label: "Sarees", href: "/shop" },
    { label: "Collections", href: "/shop" },
    { label: "Silk", href: "/shop?category=Silk" },
    { label: "Handloom", href: "/shop?category=Handloom" },
    { label: "Festive", href: "/shop?category=Festive" },
    { label: "Bridal", href: "/shop?category=Bridal" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#1C1A18]/8 py-3.5"
            : "bg-[#FAF7F2] border-b border-[#1C1A18]/6 py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
          
          {/* Mobile Menu Trigger & Logo Group */}
          <div className="flex items-center gap-3 lg:gap-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors focus:outline-none"
              aria-label="Open mobile category menu"
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex flex-col items-start group">
              <span className="font-serif-display text-2xl sm:text-3xl font-medium tracking-[0.2em] text-[#1C1A18] uppercase group-hover:text-[#541920] transition-colors">
                PALLUVO
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.28em] text-[#8A857E] uppercase font-light -mt-1 hidden sm:block">
                Every drape, a little magic
              </span>
            </Link>
          </div>

          {/* Center: E-Commerce Category Links */}
          <nav className="hidden lg:flex items-center space-x-7 xl:space-x-8 text-[12px] uppercase tracking-[0.16em] font-medium text-[#1C1A18]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative py-1 hover:text-[#541920] transition-colors ${
                    isActive ? "text-[#541920] font-semibold" : ""
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#541920] transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </nav>

          {/* Right: E-Commerce Utilities */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors flex items-center gap-1.5"
              aria-label="Search sarees"
              title="Search"
            >
              <Search size={20} strokeWidth={1.8} />
              <span className="text-xs uppercase tracking-wider text-[#5E5A54] hidden xl:inline-block font-normal">
                Search
              </span>
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors"
              aria-label="My Account"
              title="Account"
            >
              <User size={20} strokeWidth={1.8} />
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors relative"
              aria-label={`Wishlist with ${wishlistCount} items`}
              title="Wishlist"
            >
              <Heart size={20} strokeWidth={1.8} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#BF6A54] text-[#FAF7F2] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart / Bag Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-[#1C1A18] hover:text-[#541920] transition-colors relative flex items-center gap-1"
              aria-label={`Shopping bag with ${cartCount} items`}
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#541920] text-[#FAF7F2] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAF7F2] text-[#1C1A18] animate-in fade-in duration-200">
          <div className="p-4 flex items-center justify-between border-b border-[#1C1A18]/10">
            <span className="font-serif-display text-2xl tracking-[0.2em] uppercase font-medium">
              PALLUVO
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#1C1A18] hover:text-[#541920]"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
            <div className="flex flex-col space-y-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8A857E] font-semibold mb-2">
                Saree Categories
              </span>
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif-display text-2xl py-1 text-[#1C1A18] hover:text-[#541920] border-b border-[#1C1A18]/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-8 border-t border-[#1C1A18]/10 space-y-3">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm py-2 text-[#1C1A18]"
              >
                <User size={18} /> My Account & Orders
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm py-2 text-[#1C1A18]"
              >
                <Heart size={18} /> Saved Wishlist ({wishlistCount})
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm py-2 text-[#1C1A18]"
              >
                <ShoppingBag size={18} /> View Cart ({cartCount})
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
