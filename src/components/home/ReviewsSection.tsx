"use client";

import React from "react";
import { Star, CheckCircle, Quote } from "lucide-react";
import { CUSTOMER_REVIEWS } from "@/data/reviews";

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="flex items-center justify-center gap-1 text-[#C5A575]">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold block">
            Real Customer Stories
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900">
            Loved By Over 10,000 Drape Lovers
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-sans">
            Rated 4.9/5 stars based on 3,400+ verified customer reviews across India.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOMER_REVIEWS.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-[#F4EFE6] p-6 rounded-sm border border-[#E8E2D9] flex flex-col justify-between space-y-4 hover:shadow-xs transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-[#C5A575]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-5 h-5 text-neutral-300" />
                </div>

                <p className="text-xs sm:text-sm text-neutral-700 font-sans italic leading-relaxed">
                  &ldquo;{review.review}&rdquo;
                </p>
              </div>

              <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-serif font-semibold text-neutral-900">
                    {review.customerName}
                  </h4>
                  <p className="text-[11px] text-neutral-500">{review.location} • {review.productName}</p>
                </div>

                {review.verifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#15803D] bg-white px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle className="w-3 h-3" />
                    Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
