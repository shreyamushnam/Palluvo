"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ecommerce/ProductCard";

export const BestsellersSection: React.FC = () => {
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller).slice(0, 4);

  return (
    <section className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-neutral-900">
            Bestsellers
          </h2>

          <Link
            href="/shop?sort=bestselling"
            className="text-xs uppercase tracking-wider text-[#541920] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View all</span>
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
