"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS } from "@/data/products";

const POPULAR_SEARCHES = [
  "Kanjeevaram Silk",
  "Banarasi Brocade",
  "Organza Embroidered",
  "Pure Linen",
  "Bridal Red",
  "Chiffon Floral",
  "Paithani Peacock",
  "Tussar Handloom",
];

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, formatPrice } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.occasion.toLowerCase().includes(q) ||
          p.colors.some((c) => c.name.toLowerCase().includes(q)) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }).slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-12">
        <div className="relative w-full max-w-3xl bg-[#FAF7F2] rounded-md shadow-2xl overflow-hidden border border-[#E5DFD5] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Search Header Input */}
          <div className="p-4 sm:p-6 border-b border-[#E8E2D9] flex items-center gap-3 bg-white">
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setIsSearchOpen(false);
                }
              }}
              placeholder="Search sarees by fabric, weave, color, or occasion..."
              className="flex-1 text-base sm:text-lg bg-transparent border-none outline-none text-[#1C1A18] placeholder-neutral-400 font-sans"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs text-neutral-400 hover:text-black uppercase px-2 py-1"
              >
                Clear
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-neutral-400 bg-neutral-100 px-2 py-1 rounded-xs border border-neutral-200 font-mono">
                Press ESC to close
              </span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors shrink-0"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* When no query is typed: Popular Tags & Curated categories */}
            {!query.trim() && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
                    <span>Popular Searches</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setQuery(tag)}
                        className="px-3 py-1.5 text-xs bg-[#F4EFE6] hover:bg-[#541920] hover:text-white text-neutral-800 rounded-full transition-colors border border-[#E8E2D9]"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-3">
                    Trending Sarees Right Now
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PRODUCTS.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="group flex gap-3 p-2 bg-[#F4EFE6] rounded-sm hover:bg-[#EFEAE1] transition-colors"
                      >
                        <div className="relative w-14 h-18 shrink-0 rounded-xs overflow-hidden bg-neutral-200">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="60px"
                            className="object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <p className="text-xs font-serif font-medium text-neutral-900 line-clamp-1 group-hover:text-[#541920]">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{product.fabric}</p>
                          <p className="text-xs font-semibold text-[#541920] mt-1">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results when searching */}
            {query.trim() && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-[#E8E2D9] pb-2">
                  <span>
                    Found <strong className="text-neutral-900">{filteredProducts.length}</strong> matching sarees for &ldquo;{query}&rdquo;
                  </span>
                  {filteredProducts.length > 0 && (
                    <Link
                      href={`/shop?q=${encodeURIComponent(query)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="text-[#541920] font-semibold hover:underline flex items-center gap-1"
                    >
                      View All in Shop <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <p className="font-serif text-base text-neutral-800">
                      No sarees found matching &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Try searching for broader terms like &quot;Silk&quot;, &quot;Zari&quot;, &quot;Bridal&quot;, or check our popular suggestions above.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/shop"
                        onClick={() => setIsSearchOpen(false)}
                        className="inline-block px-5 py-2 bg-[#541920] text-white text-xs uppercase tracking-widest font-medium rounded-sm"
                      >
                        Explore Entire Catalogue
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="group flex gap-3.5 p-2.5 bg-white rounded-sm border border-[#E8E2D9] hover:border-[#541920] transition-colors"
                      >
                        <div className="relative w-16 h-22 shrink-0 rounded-xs overflow-hidden bg-neutral-200">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="70px"
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#541920] tracking-wider">
                              {product.category}
                            </span>
                            <p className="text-xs font-serif font-medium text-neutral-900 line-clamp-1 group-hover:text-[#541920]">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5">
                              {product.fabric} • {product.occasion}
                            </p>
                          </div>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-xs font-bold text-[#541920]">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Footer */}
          <div className="p-3 bg-[#F4EFE6] border-t border-[#E8E2D9] text-center text-xs text-neutral-500">
            Press <kbd className="px-1.5 py-0.5 bg-white border border-[#DCD5C9] rounded-xs text-[10px] font-mono">ESC</kbd> to close
          </div>
        </div>
      </div>
    </div>
  );
};
