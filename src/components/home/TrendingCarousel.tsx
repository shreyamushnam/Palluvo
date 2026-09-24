"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ecommerce/ProductCard";

export const TrendingCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trendingProducts = PRODUCTS.filter((p) => p.isTrending || p.isBestseller);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Nav Arrows */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-neutral-900">
            Trending Now
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-[#DCD5C9] bg-white hover:bg-[#F4EFE6] text-neutral-800 transition-colors shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-[#DCD5C9] bg-white hover:bg-[#F4EFE6] text-neutral-800 transition-colors shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x"
        >
          {trendingProducts.map((product) => (
            <div
              key={product.id}
              className="w-[260px] sm:w-[280px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
