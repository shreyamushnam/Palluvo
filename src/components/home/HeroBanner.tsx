"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    titleLine1: "Every drape,",
    titleLine2: "a little magic",
    description: "Discover sarees crafted for moments worth remembering.",
    primaryCta: { label: "Shop Sarees", href: "/shop" },
    secondaryCta: { label: "New Arrivals", href: "/shop?sort=newest" },
    image: "/images/hero-saree.jpg",
    product: {
      badge: "The Signature Drape",
      name: "Wine Tissue Silk Saree",
      price: "₹3,999",
      originalPrice: "₹4,999",
      discount: "20% OFF",
      href: "/product/pal-001",
    },
  },
  {
    id: 2,
    titleLine1: "Royal heritage,",
    titleLine2: "timeless temple weaves",
    description: "Handcrafted pure silk Kanjeevarams woven with authentic gold zari motifs.",
    primaryCta: { label: "Shop Kanjeevaram", href: "/shop?category=Silk" },
    secondaryCta: { label: "Bridal Edits", href: "/shop?category=Bridal" },
    image: "/images/products/royal-blue-kanjeevaram.jpg",
    product: {
      badge: "Bridal Heirloom",
      name: "Royal Blue Kanjeevaram Silk",
      price: "₹5,699",
      originalPrice: "₹7,500",
      discount: "24% OFF",
      href: "/product/pal-002",
    },
  },
  {
    id: 3,
    titleLine1: "Imperial elegance,",
    titleLine2: "pure Banarasi brocade",
    description: "Opulent crimson red Kadwa silk brocades curated for grand Indian weddings.",
    primaryCta: { label: "Shop Banarasi", href: "/shop?category=Bridal" },
    secondaryCta: { label: "Explore Handloom", href: "/shop?category=Handloom" },
    image: "/images/products/red-banarasi-saree.jpg",
    product: {
      badge: "Festive Masterpiece",
      name: "Red Banarasi Brocade Saree",
      price: "₹6,300",
      originalPrice: "₹8,000",
      discount: "22% OFF",
      href: "/product/pal-005",
    },
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const slide = SLIDES[currentSlideIdx];
  const totalSlides = SLIDES.length;

  return (
    <section className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 sm:py-6 md:py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 md:gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Copy & Direct CTAs */}
          <div className="lg:col-span-6 space-y-2 sm:space-y-3.5 md:space-y-6 text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-serif font-normal text-[#1C1A18] tracking-tight leading-[1.14]">
              {slide.titleLine1} <br />
              <span className="italic font-serif text-[#541920]">{slide.titleLine2}</span>
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans line-clamp-2 sm:line-clamp-none">
              {slide.description}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center lg:justify-start gap-1.5 sm:gap-3.5 pt-0.5 sm:pt-1.5 md:pt-2">
              <Link
                href={slide.primaryCta.href}
                className="min-h-[44px] px-2.5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-1 sm:gap-2 group focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none shrink-0"
              >
                <span>{slide.primaryCta.label}</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="min-h-[44px] px-2.5 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3.5 bg-white hover:bg-[#F4EFE6] text-neutral-900 border border-[#DCD5C9] text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center text-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none shrink-0"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>

            {/* Slider navigation indicator */}
            <div className="pt-0.5 sm:pt-2 md:pt-4 flex items-center justify-center lg:justify-start gap-2.5 sm:gap-4 text-xs font-mono text-neutral-600">
              <div className="flex items-center gap-1 font-semibold text-neutral-900">
                <span>0{currentSlideIdx + 1}</span>
                <span className="text-neutral-400">/</span>
                <span className="text-neutral-400">0{totalSlides}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentSlideIdx((idx) => (idx === 0 ? totalSlides - 1 : idx - 1))}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[#DCD5C9] bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentSlideIdx((idx) => (idx === totalSlides - 1 ? 0 : idx + 1))}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-[#DCD5C9] bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Saree Hero Image Showcase */}
          <div className="lg:col-span-6 relative mt-1 lg:mt-0">
            <div className="relative mx-auto max-w-[240px] sm:max-w-[280px] md:max-w-sm lg:max-w-none">
              <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-neutral-100 border-2 sm:border-4 border-white">
                <Image
                  key={slide.image}
                  src={slide.image}
                  alt={slide.product.name}
                  fill
                  priority
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-cover object-top transition-opacity duration-300"
                />

                {/* Floating Product Highlight Card */}
                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 md:bottom-4 md:left-4 md:right-4 bg-white/95 backdrop-blur-md p-2 sm:p-2.5 md:p-3.5 rounded-xs shadow-lg border border-[#E8E2D9] flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#541920] block">
                        {slide.product.badge}
                      </span>
                      <span className="text-[10px] text-[#15803D] font-bold bg-[#15803D]/10 px-1.5 py-0.5 rounded-2xs shrink-0 whitespace-nowrap">
                        {slide.product.discount}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-serif font-medium text-neutral-900 leading-snug">
                      {slide.product.name}
                    </h3>

                    <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#541920]">{slide.product.price}</span>
                      <span className="text-[11px] text-neutral-400 line-through">{slide.product.originalPrice}</span>
                    </div>
                  </div>

                  <Link
                    href={slide.product.href}
                    className="w-full md:w-auto min-h-[44px] px-3 py-2 bg-[#541920] hover:bg-[#3D1217] text-white text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors shrink-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  >
                    View Saree
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
