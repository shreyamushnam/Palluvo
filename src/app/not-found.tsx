import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-[#FAF7F2]">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Subtle Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C5A575]/40 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#541920] font-semibold">
            Error 404 • Lost Drape
          </span>
        </div>

        {/* Error Headline */}
        <h1 className="text-4xl sm:text-5xl font-serif font-medium text-[#1C1A18] leading-tight">
          Page Not Found
        </h1>

        {/* Helpful Explanation Copy */}
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-sans max-w-md mx-auto">
          The saree or heirloom piece you are searching for may have retired from our collection, moved to a new vault, or the link may be outdated.
        </p>

        {/* CTAs */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto min-h-[46px] px-7 py-3 bg-[#541920] hover:bg-[#3D1217] text-[#FAF7F2] text-xs uppercase tracking-widest font-semibold rounded-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
          >
            <span>Explore Saree Collection</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto min-h-[46px] px-6 py-3 bg-white border border-[#C5A575]/50 hover:border-[#541920] text-[#1C1A18] text-xs uppercase tracking-widest font-medium rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4 text-[#541920]" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
