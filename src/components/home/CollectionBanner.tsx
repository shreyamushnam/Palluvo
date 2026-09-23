"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

export const CollectionBanner: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-md overflow-hidden bg-[#541920] text-white shadow-xl">
          {/* Background Image Overlay */}
          <div className="absolute inset-0 opacity-30 mix-blend-overlay">
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80"
              alt="Silk weaving texture"
              fill
              className="object-cover"
            />
          </div>

          <div className="relative px-6 py-12 sm:px-12 sm:py-16 md:py-20 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full border border-white/20 text-xs font-medium text-[#FAF7F2]">
              <Tag className="w-3.5 h-3.5 text-[#C5A575]" />
              <span className="uppercase tracking-widest">Seasonal Special Offer</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal leading-tight">
              The Heritage Bridal & Festive Edit
            </h2>

            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-sans max-w-xl">
              Immerse yourself in authentic zari brocades, royal temple borders, and heirloom silk drapes woven over 45 days by generational master weavers.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
              <Link
                href="/shop?category=Festive+Sarees"
                className="px-8 py-3.5 bg-white text-[#541920] hover:bg-[#FAF7F2] text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center gap-2"
              >
                <span>Shop Festive Sarees</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-xs text-neutral-300">
                Use code <span className="text-[#C5A575] font-mono font-bold">PALLUVO10</span> for extra 10% off
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
