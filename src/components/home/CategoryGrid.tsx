"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, getCategoryHref } from "@/data/categories";

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
            className="min-h-[44px] px-2 -mr-2 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#541920] font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 Categories in an enlarged, responsive grid */}
        <div className="grid grid-cols-2 min-[480px]:grid-cols-4 lg:grid-cols-8 gap-3.5 sm:gap-4 lg:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={getCategoryHref(cat.canonicalQuery || cat.name)}
              className="group flex flex-col items-center text-center p-1 rounded-sm transition-all duration-200 ease-out hover:-translate-y-1 active:scale-[0.97] active:shadow-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
            >
              <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-neutral-100 shadow-xs group-hover:shadow-md transition-all duration-200 ease-out border border-[#E8E2D9]">
                <Image
                  src={cat.image}
                  alt=""
                  fill
                  sizes="(max-width: 479px) 50vw, (max-width: 1023px) 25vw, 150px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs sm:text-sm font-serif font-medium text-neutral-900 mt-2 sm:mt-2.5 group-hover:text-[#541920] transition-colors line-clamp-2 leading-snug text-center min-h-[2.25rem] sm:min-h-[2.5rem] flex items-center justify-center">
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
