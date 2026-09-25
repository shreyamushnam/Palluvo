"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { ProductCard } from "@/components/ecommerce/ProductCard";

type CollectionTabKey = "new-arrivals" | "popular" | "bestsellers";

interface CollectionTab {
  id: CollectionTabKey;
  label: string;
  shopHref: string;
  viewAllText: string;
  getProducts: () => Product[];
}

const TABS: CollectionTab[] = [
  {
    id: "new-arrivals",
    label: "New Arrivals",
    shopHref: "/shop?sort=newest",
    viewAllText: "View All New Arrivals",
    getProducts: () => PRODUCTS.filter((p) => p.isNewArrival).slice(0, 4),
  },
  {
    id: "popular",
    label: "Popular",
    shopHref: "/shop?sort=popular",
    viewAllText: "View All Popular",
    getProducts: () =>
      PRODUCTS.filter((p) => p.isTrending || (p.rating >= 4.8 && !p.isNewArrival))
        .concat(PRODUCTS.filter((p) => p.isTrending))
        .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
        .slice(0, 4),
  },
  {
    id: "bestsellers",
    label: "Bestsellers",
    shopHref: "/shop?sort=bestselling",
    viewAllText: "View All Bestsellers",
    getProducts: () => PRODUCTS.filter((p) => p.isBestseller).slice(0, 4),
  },
];

export const FeaturedCollectionSection: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<CollectionTabKey>("new-arrivals");

  const currentTab = TABS.find((t) => t.id === activeTabId) || TABS[0];
  const displayedProducts = currentTab.getProducts();

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % TABS.length;
      setActiveTabId(TABS[nextIdx].id);
      const nextEl = document.getElementById(`tab-${TABS[nextIdx].id}`);
      nextEl?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (index - 1 + TABS.length) % TABS.length;
      setActiveTabId(TABS[prevIdx].id);
      const prevEl = document.getElementById(`tab-${TABS[prevIdx].id}`);
      prevEl?.focus();
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Unified Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold block mb-1">
              Curated Drapes
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900">
              Featured Collections
            </h2>
          </div>

          {/* Tab Controls (New Arrivals, Popular, Bestsellers) */}
          <div
            role="tablist"
            aria-label="Product Collections"
            className="flex items-center gap-1.5 p-1 bg-[#F4EFE6] border border-[#DCD5C9] rounded-sm self-start sm:self-auto overflow-x-auto max-w-full"
          >
            {TABS.map((tab, idx) => {
              const isActive = activeTabId === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="featured-product-grid"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveTabId(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`min-h-[44px] px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-xs transition-all whitespace-nowrap cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                    isActive
                      ? "bg-[#541920] text-white shadow-xs"
                      : "text-neutral-700 hover:text-neutral-900 hover:bg-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        <div
          id="featured-product-grid"
          role="tabpanel"
          aria-labelledby={`tab-${activeTabId}`}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {displayedProducts.map((product) => (
            <ProductCard key={`${activeTabId}-${product.id}`} product={product} />
          ))}
        </div>

        {/* Direct Route to Matching Shop Destination */}
        <div className="mt-8 pt-4 border-t border-[#E8E2D9] flex justify-center sm:justify-end">
          <Link
            href={currentTab.shopHref}
            className="min-h-[44px] px-5 py-2.5 inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#541920] hover:text-[#3D1217] hover:underline focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
          >
            <span>{currentTab.viewAllText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
