"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

export const HeroBanner: React.FC = () => {
  return (
    <section className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Copy & Direct CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F4EFE6] border border-[#E5DFD5] rounded-full text-xs font-medium text-[#541920]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
              <span className="uppercase tracking-wider">The Festive & Wedding Edit 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#1C1A18] tracking-tight leading-[1.15]">
              Every drape, <br />
              <span className="italic font-serif text-[#541920]">a little magic.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
              Discover authentic handloom, pure Kanjeevaram silks, and contemporary organza drapes woven by master artisans across Varanasi, Kanchipuram, and Chanderi.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>Shop All Sarees</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/shop?sort=newest"
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-[#F4EFE6] text-neutral-900 border border-[#DCD5C9] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors text-center"
              >
                Explore New Arrivals
              </Link>
            </div>

            {/* Mini Trust Highlights */}
            <div className="pt-6 border-t border-[#E8E2D9] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <p className="text-xs font-bold text-neutral-900">5,000+</p>
                <p className="text-[11px] text-neutral-500">Happy Brides</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">100% Pure</p>
                <p className="text-[11px] text-neutral-500">Silk Mark Certified</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">7-Day</p>
                <p className="text-[11px] text-neutral-500">Hassle-Free Return</p>
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Free Express</p>
                <p className="text-[11px] text-neutral-500">Shipping on ₹1999+</p>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Saree Hero Image Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Card */}
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-neutral-100 border-4 border-white">
                <Image
                  src="/images/hero-saree.jpg"
                  alt="PALLUVO Royal Crimson Silk Saree draped model"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-cover object-top"
                />
                
                {/* Floating promo badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-[#E8E2D9] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                  <span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wider">
                    Pure Kanchipuram Weave
                  </span>
                </div>

                {/* Floating Product Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xs shadow-lg border border-[#E8E2D9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#541920]">
                      Featured Masterpiece
                    </span>
                    <h3 className="text-xs sm:text-sm font-serif font-medium text-neutral-900">
                      Rani Crimson Pure Silk Saree
                    </h3>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#541920]">₹14,999</span>
                      <span className="text-[11px] text-neutral-400 line-through">₹18,500</span>
                      <span className="text-[10px] text-[#15803D] font-bold">19% OFF</span>
                    </div>
                  </div>

                  <Link
                    href="/product/pal-001"
                    className="px-3.5 py-2 bg-[#541920] hover:bg-[#3D1217] text-white text-[11px] uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors shrink-0"
                  >
                    View Saree
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="bg-[#F4EFE6] border-t border-[#E8E2D9] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Award className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Authentic Handloom</p>
                <p className="text-[10px] text-neutral-500">Direct from artisan looms</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Truck className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Free Express Delivery</p>
                <p className="text-[10px] text-neutral-500">All India shipping on ₹1999+</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <RotateCcw className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">7-Day Easy Returns</p>
                <p className="text-[10px] text-neutral-500">Doorstep reverse pickup</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Silk Mark Certified</p>
                <p className="text-[10px] text-neutral-500">Guaranteed 100% pure silk</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
