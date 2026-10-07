import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 bg-[#F8F5EF]">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Subtle Luxury Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#D6B878]/40 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D6B878]" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#641C2D] font-semibold">
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
            href="/sarees"
            className="w-full sm:w-auto min-h-[46px] px-7 py-3 bg-[#641C2D] hover:bg-[#4E1422] text-[#F8F5EF] text-xs uppercase tracking-widest font-semibold rounded-xs shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#641C2D] focus-visible:outline-none"
          >
            <span>Explore Saree Collection</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto min-h-[46px] px-6 py-3 bg-white border border-[#D6B878]/50 hover:border-[#641C2D] text-[#1C1A18] text-xs uppercase tracking-widest font-medium rounded-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#641C2D] focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4 text-[#641C2D]" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
