"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const CollectionBanner: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-sm overflow-hidden bg-[#2C1810] text-white shadow-xl min-h-[380px] sm:min-h-[440px] flex items-center">
          {/* Background Image of Festive Edit Campaign */}
          <div className="absolute inset-0">
            <Image
              src="/images/banners/festive-edit-banner.jpg"
              alt="The Festive Edit"
              fill
              priority
              className="object-cover object-right sm:object-center"
            />
            {/* Dark gradient overlay on the left so copy is readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          </div>

          <div className="relative px-6 py-12 sm:px-12 max-w-xl space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A575] font-semibold block">
              Curated Heritage Weaves
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal uppercase tracking-wider text-[#FAF7F2] leading-tight">
              THE FESTIVE EDIT
            </h2>

            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans max-w-md">
              Celebrate every occasion in a drape made to be remembered. Pure silk zari weaves illuminated with heirloom craftsmanship.
            </p>

            <div className="pt-3">
              <Link
                href="/shop?category=Festive+Sarees"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all border border-[#C5A575]/40"
              >
                <span>Shop Festive</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
