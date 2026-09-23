"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { COLLECTIONS } from "@/data/collections";

export const CollectionsSection: React.FC = () => {
  return (
    <section id="collections-section" className="py-24 md:py-36 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 border-b border-[#1C1A18]/10 pb-8">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#541920] font-semibold">
              Curated Chapters
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light mt-2">
              Collections
            </h2>
          </div>
          <p className="text-sm text-[#5E5A54] max-w-sm mt-4 md:mt-0 font-light leading-relaxed">
            Four distinct narratives of weave, weight, and silhouette. Designed to transition effortlessly from daylight to deep dusk.
          </p>
        </div>

        {/* Dramatic Asymmetric Editorial Layout */}
        <div className="space-y-16 lg:space-y-24">
          
          {/* Pair 1: The Silk Edit (Large 7-col) + Midnight Drapes (5-col) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Collection 1: The Silk Edit */}
            <div className="lg:col-span-7 group">
              <a href="#shop-section" className="block focus:outline-none">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5EFEB] shadow-xl">
                  <Image
                    src={COLLECTIONS[0].image}
                    alt={COLLECTIONS[0].name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  {/* Floating Number Badge */}
                  <div className="absolute top-6 left-6 font-serif-display text-3xl text-[#FAF7F2]/80 font-light">
                    {COLLECTIONS[0].number}
                  </div>

                  <div className="absolute bottom-6 right-6 px-3 py-1.5 glass-card text-[10px] uppercase tracking-widest text-[#1C1A18]">
                    {COLLECTIONS[0].countText}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-transparent group-hover:border-[#C5A575]/40 pb-2 transition-colors">
                  <div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1A18] group-hover:text-[#541920] transition-colors">
                      {COLLECTIONS[0].name}
                    </h3>
                    <p className="text-xs text-[#5E5A54] mt-1 font-light max-w-md">
                      {COLLECTIONS[0].description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#1C1A18] group-hover:text-[#541920] transition-colors font-medium">
                    <span>Explore</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#C5A575]" />
                  </div>
                </div>
              </a>
            </div>

            {/* Collection 2: Midnight Drapes */}
            <div className="lg:col-span-5 group lg:translate-y-12">
              <a href="#shop-section" className="block focus:outline-none">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5EFEB] shadow-xl">
                  <Image
                    src={COLLECTIONS[1].image}
                    alt={COLLECTIONS[1].name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 left-6 font-serif-display text-3xl text-[#FAF7F2]/80 font-light">
                    {COLLECTIONS[1].number}
                  </div>

                  <div className="absolute bottom-6 right-6 px-3 py-1.5 glass-card text-[10px] uppercase tracking-widest text-[#1C1A18]">
                    {COLLECTIONS[1].countText}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-transparent group-hover:border-[#C5A575]/40 pb-2 transition-colors">
                  <div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1A18] group-hover:text-[#541920] transition-colors">
                      {COLLECTIONS[1].name}
                    </h3>
                    <p className="text-xs text-[#5E5A54] mt-1 font-light max-w-sm">
                      {COLLECTIONS[1].description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#1C1A18] group-hover:text-[#541920] transition-colors font-medium">
                    <span>Explore</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#C5A575]" />
                  </div>
                </div>
              </a>
            </div>

          </div>

          {/* Pair 2: Festive Stories (5-col) + Everyday Poetry (7-col) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pt-8">
            
            {/* Collection 3: Festive Stories */}
            <div className="lg:col-span-5 group">
              <a href="#shop-section" className="block focus:outline-none">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5EFEB] shadow-xl">
                  <Image
                    src={COLLECTIONS[2].image}
                    alt={COLLECTIONS[2].name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 left-6 font-serif-display text-3xl text-[#FAF7F2]/80 font-light">
                    {COLLECTIONS[2].number}
                  </div>

                  <div className="absolute bottom-6 right-6 px-3 py-1.5 glass-card text-[10px] uppercase tracking-widest text-[#1C1A18]">
                    {COLLECTIONS[2].countText}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-transparent group-hover:border-[#C5A575]/40 pb-2 transition-colors">
                  <div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1A18] group-hover:text-[#541920] transition-colors">
                      {COLLECTIONS[2].name}
                    </h3>
                    <p className="text-xs text-[#5E5A54] mt-1 font-light max-w-sm">
                      {COLLECTIONS[2].description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#1C1A18] group-hover:text-[#541920] transition-colors font-medium">
                    <span>Explore</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#C5A575]" />
                  </div>
                </div>
              </a>
            </div>

            {/* Collection 4: Everyday Poetry */}
            <div className="lg:col-span-7 group lg:translate-y-10">
              <a href="#shop-section" className="block focus:outline-none">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5EFEB] shadow-xl">
                  <Image
                    src={COLLECTIONS[3].image}
                    alt={COLLECTIONS[3].name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                  
                  <div className="absolute top-6 left-6 font-serif-display text-3xl text-[#FAF7F2]/80 font-light">
                    {COLLECTIONS[3].number}
                  </div>

                  <div className="absolute bottom-6 right-6 px-3 py-1.5 glass-card text-[10px] uppercase tracking-widest text-[#1C1A18]">
                    {COLLECTIONS[3].countText}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-transparent group-hover:border-[#C5A575]/40 pb-2 transition-colors">
                  <div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1A18] group-hover:text-[#541920] transition-colors">
                      {COLLECTIONS[3].name}
                    </h3>
                    <p className="text-xs text-[#5E5A54] mt-1 font-light max-w-md">
                      {COLLECTIONS[3].description}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#1C1A18] group-hover:text-[#541920] transition-colors font-medium">
                    <span>Explore</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#C5A575]" />
                  </div>
                </div>
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
