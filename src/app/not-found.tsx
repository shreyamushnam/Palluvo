import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#FAF7F2]">
      <div className="max-w-md w-full text-center space-y-6">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A575] font-semibold">
          Error 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-medium text-[#1C1A18] leading-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans max-w-sm mx-auto">
          The saree or drape you are searching for does not exist, may have retired from our collection, or the link may be broken.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/shop"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Collection</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-white border border-[#DCD5C9] hover:border-neutral-400 text-neutral-800 text-xs uppercase tracking-widest font-medium rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
