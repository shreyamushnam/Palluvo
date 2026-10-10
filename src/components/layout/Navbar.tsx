"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu, X, Bell } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface NavLinkItem {
  label: string;
  href: string;
  category?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "New Arrivals", href: "/shop?category=New+Arrivals", category: "new arrival" },
  { label: "Sarees", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Silk", href: "/shop?category=Silk", category: "silk" },
  { label: "Handloom", href: "/shop?category=Handloom", category: "handloom" },
  { label: "Festive", href: "/shop?category=Festive", category: "festive" },
  { label: "Bridal", href: "/shop?category=Bridal", category: "bridal" },
];

function isNavLinkActive(link: NavLinkItem, pathname: string, currentCategory: string): boolean {
  if (link.label === "Collections") {
    return pathname === "/collections";
  }

  if (pathname !== "/shop") {
    return false;
  }

  // On /shop
  if (link.category) {
    if (link.category === "new arrival") {
      return currentCategory.includes("new arrival") || currentCategory === "new+arrivals";
    }
    if (link.category === "silk") {
      return currentCategory.includes("silk") && !currentCategory.includes("cotton");
    }
    if (link.category === "bridal") {
      return currentCategory.includes("bridal") || currentCategory.includes("wedding");
    }
    return currentCategory.includes(link.category);
  }

  // "Sarees" (/shop) is active ONLY when on /shop and NO specific category is selected
  return !currentCategory;
}

function NavLinksList({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = (searchParams.get("category") || "").toLowerCase().trim();

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive = isNavLinkActive(link, pathname, currentCategory);
        return (
          <Link
            key={link.label}
            href={link.href}
            onClick={onLinkClick}
            aria-current={isActive ? "page" : undefined}
            className={`relative py-1 px-1.5 rounded-xs hover:text-[#541920] transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
              isActive ? "text-[#541920] font-bold" : "text-[#1C1A18]"
            }`}
          >
            <span>{link.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#541920] transition-all" />
            )}
          </Link>
        );
      })}
    </>
  );
}

function MobileNavLinksList({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = (searchParams.get("category") || "").toLowerCase().trim();

  return (
    <>
      {NAV_LINKS.map((link) => {
        const isActive = isNavLinkActive(link, pathname, currentCategory);
        return (
          <Link
            key={link.label}
            href={link.href}
            onClick={onLinkClick}
            aria-current={isActive ? "page" : undefined}
            className={`font-serif-display text-2xl py-1 min-h-[44px] flex items-center border-b border-[#1C1A18]/5 transition-colors ${
              isActive ? "text-[#541920] font-bold" : "text-[#1C1A18] hover:text-[#541920]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount, wishlistCount, setIsCartOpen, isSearchOpen, setIsSearchOpen, isLoggedIn } = useStore();

  const mobileDrawerRef = useFocusTrap<HTMLDivElement>({
    isOpen: mobileMenuOpen,
    onClose: () => setMobileMenuOpen(false),
  });

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm border-b border-[#1C1A18]/8 py-2 sm:py-3.5"
            : "bg-[#FAF7F2] border-b border-[#1C1A18]/6 py-1 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 xl:px-8 2xl:px-10 flex items-center justify-between w-full min-w-0">
          
          {/* Mobile Menu Trigger & Logo Group */}
          <div className="flex items-center gap-1.5 sm:gap-3 xl:gap-0 min-w-0 shrink">
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="xl:hidden min-h-[44px] min-w-[44px] p-2 text-[#1C1A18] hover:text-[#541920] transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none cursor-pointer shrink-0"
              aria-label={mobileMenuOpen ? "Close mobile category menu" : "Open mobile category menu"}
            >
              <Menu size={22} />
            </button>

            {/* Brand Logo */}
            <Link
              href="/"
              aria-current={pathname === "/" ? "page" : undefined}
              className="flex flex-col items-start group min-w-0 rounded-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none p-0.5"
            >
              <span className="font-serif-display text-xl sm:text-2xl lg:text-3xl font-medium tracking-[0.16em] sm:tracking-[0.2em] text-[#1C1A18] uppercase group-hover:text-[#541920] transition-colors truncate">
                PALLUVO
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.28em] text-neutral-600 uppercase font-light -mt-1 hidden sm:block">
                Every drape, a little magic
              </span>
            </Link>
          </div>

          {/* Center: E-Commerce Category Links */}
          <nav aria-label="Main Navigation" className="hidden xl:flex items-center space-x-5 2xl:space-x-8 text-[11px] 2xl:text-[12px] uppercase tracking-[0.14em] 2xl:tracking-[0.16em] font-medium shrink-0">
            <React.Suspense fallback={<div className="h-4 w-48" />}>
              <NavLinksList />
            </React.Suspense>
          </nav>

          {/* Right: E-Commerce Utilities */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 xl:gap-3 shrink-0">
            {/* Desktop Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search sarees"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
              className="hidden lg:flex items-center gap-2 w-36 xl:w-52 pl-3 pr-3 py-1.5 text-xs bg-[#F4EFE6]/70 hover:bg-[#F4EFE6] border border-[#DCD5C9] rounded-full text-neutral-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920] transition-colors text-left"
            >
              <Search size={14} className="text-neutral-500 shrink-0" />
              <span className="truncate">Search sarees…</span>
            </button>

            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2 text-[#1C1A18] hover:text-[#541920] transition-colors flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none cursor-pointer"
              aria-label="Search sarees"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
              title="Search"
            >
              <Search size={20} strokeWidth={1.8} />
            </button>

            {/* Account - on mobile <sm, Account is accessed via the mobile drawer or bottom nav */}
            <Link
              href="/account"
              aria-current={pathname === "/account" ? "page" : undefined}
              className="hidden sm:flex min-h-[44px] min-w-[44px] p-2 text-[#1C1A18] hover:text-[#541920] transition-colors items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              aria-label="My Account"
              title="Account"
            >
              <User size={20} strokeWidth={1.8} />
            </Link>

            {/* Notifications */}
            {isLoggedIn && (
              <Link
                href="/notifications"
                aria-current={pathname === "/notifications" ? "page" : undefined}
                className="min-h-[44px] min-w-[44px] p-2 text-[#1C1A18] hover:text-[#541920] transition-colors relative flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
                aria-label="Notifications"
                title="Notifications"
              >
                <div className="relative">
                  <Bell size={20} strokeWidth={1.8} />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#541920] rounded-full ring-2 ring-[#FAF7F2]" />
                </div>
              </Link>
            )}

            {/* Shopping Bag / Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="min-h-[44px] min-w-[44px] p-2 text-[#1C1A18] hover:text-[#541920] transition-colors relative flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs cursor-pointer"
              aria-label={`Shopping Cart with ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              aria-haspopup="dialog"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={1.8} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#541920] text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums shadow-xs">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <div
        id="mobile-navigation-drawer"
        ref={mobileDrawerRef}
        tabIndex={-1}
        className={`fixed inset-0 z-50 flex flex-col bg-[#FAF7F2] text-[#1C1A18] transition-opacity duration-200 outline-none ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none hidden"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#1C1A18]/10">
          <span className="font-serif-display text-2xl tracking-[0.2em] uppercase font-medium">
            PALLUVO
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-controls="mobile-navigation-drawer"
            aria-expanded={mobileMenuOpen}
            className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center text-[#1C1A18] hover:text-[#541920] rounded-full transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
          <div className="flex flex-col space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-semibold mb-2">
              Saree Categories
            </span>
            <React.Suspense fallback={<div className="h-20" />}>
              <MobileNavLinksList onLinkClick={() => setMobileMenuOpen(false)} />
            </React.Suspense>
          </div>

          <div className="pt-8 border-t border-[#1C1A18]/10 space-y-3">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname === "/account" ? "page" : undefined}
              className="min-h-[44px] flex items-center gap-3 text-sm py-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
            >
              <User size={18} /> {isLoggedIn ? "My Account & Orders" : "Sign In / Register"}
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname === "/wishlist" ? "page" : undefined}
              className="min-h-[44px] flex items-center gap-3 text-sm py-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
            >
              <Heart size={18} /> Saved Wishlist ({wishlistCount})
            </Link>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              aria-current={pathname === "/cart" ? "page" : undefined}
              className="min-h-[44px] flex items-center gap-3 text-sm py-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
            >
              <ShoppingBag size={18} /> View Cart ({cartCount})
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
