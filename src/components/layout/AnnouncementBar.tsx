"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return null;
  }

  return (
    <section
      aria-label="Promotional offer"
      className="bg-[#1C1A18] text-[#FAF7F2] text-[10px] sm:text-xs py-1 sm:py-2 px-8 sm:px-10 text-center font-medium tracking-normal sm:tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 sm:gap-2 border-b border-[#3B0E14]/30 z-50 relative"
    >
      <Sparkles size={12} className="text-[#C5A575] shrink-0" />
      <span className="leading-tight">
        FREE SHIPPING OVER ₹1999 • USE CODE <strong className="text-[#C5A575] font-semibold">PALLUVO10</strong> FOR 10% OFF
      </span>
      <Link href="/shop" className="underline ml-1 hidden sm:inline-block hover:text-[#C5A575] transition-colors">
        Shop Now
      </Link>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 text-white hover:text-neutral-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xs inline-flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5 text-white" aria-hidden="true" />
      </button>
    </section>
  );
};
