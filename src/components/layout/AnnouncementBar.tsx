"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#1C1A18] text-[#FAF7F2] text-[10px] sm:text-xs py-1 sm:py-2 px-3 sm:px-4 text-center font-medium tracking-normal sm:tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 sm:gap-2 border-b border-[#3B0E14]/30 z-50 relative">
      <Sparkles size={12} className="text-[#C5A575] shrink-0" />
      <span className="leading-tight">
        FREE SHIPPING OVER ₹1999 • USE CODE <strong className="text-[#C5A575] font-semibold">PALLUVO10</strong> FOR 10% OFF
      </span>
      <Link href="/shop" className="underline ml-1 hidden sm:inline-block hover:text-[#C5A575] transition-colors">
        Shop Now
      </Link>
    </div>
  );
};
