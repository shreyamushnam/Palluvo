"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";

export const CategoryGrid: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
            Curated Weaves
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900 mt-1">
            Shop by Category
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-sans">
            From imperial Kanjeevarams to breezy summer mulmuls, find the perfect drape for every celebration.
          </p>
        </div>

        {/* Categories Grid (4 columns on desktop, 2 on mobile) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex flex-col rounded-sm overflow-hidden bg-white shadow-xs hover:shadow-lg transition-all duration-300 border border-[#E8E2D9]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 280px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Category Text & Action at Bottom */}
                <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white flex flex-col justify-end">
                  <span className="text-[10px] sm:text-xs text-[#E5DFD5] font-sans uppercase tracking-wider">
                    {cat.itemCount} Designs
                  </span>
                  <h3 className="text-sm sm:text-base font-serif font-medium mt-0.5 leading-snug">
                    {cat.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-[11px] font-sans font-semibold text-[#FAF7F2] opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                    <span>Explore Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
