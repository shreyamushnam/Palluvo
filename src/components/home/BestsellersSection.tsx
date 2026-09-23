"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ecommerce/ProductCard";

export const BestsellersSection: React.FC = () => {
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#541920] font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 text-[#541920]" />
              <span>Timeless Classics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900">
              Bestselling Sarees
            </h2>
          </div>

          <Link
            href="/shop?sort=bestselling"
            className="text-xs uppercase tracking-widest text-[#541920] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All Bestsellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Product Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
