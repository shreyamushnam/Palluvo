"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, formatPrice, setQuickViewProduct } = useStore();
  const [query, setQuery] = useState("");

  if (!isSearchOpen) return null;

  const filtered = query.trim()
    ? PRODUCTS.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          p.colorName.toLowerCase().includes(q)
        );
      })
    : PRODUCTS.slice(0, 4);

  const curatedTags = [
    "Kanjeevaram",
    "Organza",
    "Gold Zari",
    "Noir Matka",
    "Tussar",
    "Chanderi",
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C1A18]/80 backdrop-blur-md p-4 sm:p-6 md:p-10 flex items-start justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FAF7F2] shadow-2xl border border-[#C5A575]/40 mt-10 p-6 sm:p-10">
        
        {/* Close Button */}
        <button
          onClick={() => setIsSearchOpen(false)}
          className="absolute top-6 right-6 p-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
          aria-label="Close search"
        >
          <X size={22} />
        </button>

        {/* Search Input */}
        <div className="border-b border-[#1C1A18]/20 pb-4 mb-6">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#541920] font-semibold">
            Catalogue Search
          </span>
          <div className="flex items-center gap-3 mt-3">
            <Search size={22} className="text-[#8A857E]" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by weave, silk grade, region or color..."
              className="w-full bg-transparent font-serif-display text-2xl sm:text-3xl text-[#1C1A18] placeholder:text-[#8A857E]/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Curated Tags */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-[10px] uppercase tracking-wider text-[#8A857E]">
            Suggested:
          </span>
          {curatedTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="text-[11px] px-3 py-1 bg-[#F5EFEB] hover:bg-[#1C1A18] hover:text-[#FAF7F2] text-[#5E5A54] transition-colors uppercase tracking-wider"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-[#8A857E] pb-3 mb-4 border-b border-[#1C1A18]/10 uppercase tracking-widest">
          <span>{query.trim() ? `Search Results (${filtered.length})` : "Curated Recommendations"}</span>
          {query.trim() && (
            <button
              onClick={() => setQuery("")}
              className="hover:text-[#541920]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results List */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#8A857E]">
            No weaves matched &ldquo;{query}&rdquo;. Try searching for &ldquo;Kanjeevaram&rdquo; or &ldquo;Silk&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
            {filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setIsSearchOpen(false);
                  setQuickViewProduct(product);
                }}
                className="group flex gap-4 p-3 bg-[#F5EFEB] hover:bg-white border border-transparent hover:border-[#C5A575]/40 transition-colors cursor-pointer"
              >
                <div className="relative w-16 aspect-[3/4] bg-[#FAF7F2] shrink-0 overflow-hidden">
                  <Image
                    src={product.primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif-display text-base text-[#1C1A18] group-hover:text-[#541920] transition-colors">
                      {product.name}
                    </h5>
                    <p className="text-[10px] text-[#8A857E] line-clamp-1">
                      {product.fabric}
                    </p>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-serif-display text-xs text-[#1C1A18] font-medium">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-[#541920] flex items-center gap-0.5">
                      Inspect <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
