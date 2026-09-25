"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-neutral-900">
            Shop by Category
          </h2>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider text-[#541920] font-semibold hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Categories in a clean row / grid */}
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-neutral-100 shadow-xs group-hover:shadow-md transition-all duration-300 border border-[#E8E2D9]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 120px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-[11px] sm:text-xs font-serif font-medium text-neutral-800 mt-1.5 sm:mt-2 group-hover:text-[#541920] transition-colors line-clamp-2 leading-tight text-center min-h-[2rem] sm:min-h-[2.25rem] flex items-center justify-center">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
