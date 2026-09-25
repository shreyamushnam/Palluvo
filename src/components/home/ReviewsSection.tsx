"use client";

import React from "react";
import { Sparkles, ShieldCheck } from "lucide-react";

/**
 * ReviewsSection: Retained as a placeholder pending verification of customer quotes and approved counts.
 */
export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-12 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4EFE6] border border-[#DCD5C9] rounded-full text-xs text-[#541920] font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Artisanal Quality & Craftsmanship</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900">
          Rooted in Handloom Authenticity
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 font-sans max-w-lg mx-auto">
          Every weave in the PALLUVO collection is sourced directly from master weaver clusters, thoroughly checked for quality and pure silk authenticity.
        </p>
      </div>
    </section>
  );
};
