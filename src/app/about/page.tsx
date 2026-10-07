import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Brand Philosophy & Handloom Heritage | PALLUVO",
  description:
    "Discover the story of PALLUVO, celebrating the timeless poetry of slow Indian textiles, artisanal master weavers, and pure silk mark certification.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 lg:pb-16">
      {/* Editorial Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#541920] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
            <span>The Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-neutral-900 leading-tight">
            Every Drape, A Little Magic
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans max-w-xl mx-auto leading-relaxed">
            Honoring six yards of unstitched fluid geometry, cultural legacy, and generational craft.
          </p>
        </div>
      </div>

      {/* Main Prose */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8 text-sm text-neutral-700 leading-relaxed font-sans">
        <p className="text-base sm:text-lg text-neutral-900 font-serif leading-relaxed">
          PALLUVO was born from a reverent celebration of the Indian saree, a six-yard tapestry of generational wisdom, cultural legacy, and effortless femininity.
        </p>

        <p>
          In an era of fleeting fast fashion, PALLUVO anchors itself in the enduring poetry of slow textiles. We bridge the world between revered artisan handloom clusters and the contemporary woman who wears her heritage with modern grace.
        </p>

        <blockquote className="p-6 bg-[#F4EFE6] border-l-2 border-[#541920] rounded-r-xs italic font-serif text-base sm:text-lg text-neutral-800 my-8">
          &ldquo;When a woman drapes a PALLUVO weave, she doesn&apos;t just wear a garment; she carries centuries of artisan devotion, golden threads, and celebratory memories.&rdquo;
        </blockquote>

        <p>
          Each weave in our collection is curated directly from master weaving clusters across Kanchipuram, Varanasi, Chanderi, and Paithan. Certified with authentic Silk Mark purity, our textiles are designed to become treasured family heirlooms.
        </p>

        <div className="pt-8 border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/shop"
            className="w-full sm:w-auto min-h-[44px] px-8 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            <span>Explore Handloom Sarees</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/collections"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-white border border-[#DCD5C9] text-neutral-800 text-xs uppercase tracking-widest font-medium rounded-xs hover:bg-[#FAF7F2] transition-colors inline-flex items-center justify-center"
          >
            <span>View Curated Collections</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
