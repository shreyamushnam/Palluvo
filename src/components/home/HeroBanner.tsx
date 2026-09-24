"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Award, Truck, RotateCcw, ShieldCheck } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    titleLine1: "Every drape,",
    titleLine2: "a little magic",
    description: "Discover sarees crafted for moments worth remembering.",
    primaryCta: { label: "Shop Sarees", href: "/shop" },
    secondaryCta: { label: "Explore New Arrivals", href: "/shop?sort=newest" },
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
    secondaryCta: { label: "View Bridal Edits", href: "/shop?category=Bridal" },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Brand Copy & Direct CTAs */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#1C1A18] tracking-tight leading-[1.12]">
              {slide.titleLine1} <br />
              <span className="italic font-serif text-[#541920]">{slide.titleLine2}</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans">
              {slide.description}
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              <Link
                href={slide.primaryCta.href}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 group"
              >
                <span>{slide.primaryCta.label}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-[#F4EFE6] text-neutral-900 border border-[#DCD5C9] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors text-center"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>

            {/* Slider navigation indicator 01 / 03 */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-4 text-xs font-mono text-neutral-600">
              <div className="flex items-center gap-1 font-semibold text-neutral-900">
                <span>0{currentSlideIdx + 1}</span>
                <span className="text-neutral-400">/</span>
                <span className="text-neutral-400">0{totalSlides}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentSlideIdx((idx) => (idx === 0 ? totalSlides - 1 : idx - 1))}
                  className="p-1.5 rounded-full border border-[#DCD5C9] bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentSlideIdx((idx) => (idx === totalSlides - 1 ? 0 : idx + 1))}
                  className="p-1.5 rounded-full border border-[#DCD5C9] bg-white hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Saree Hero Image Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-neutral-100 border-4 border-white">
                <Image
                  key={slide.image}
                  src={slide.image}
                  alt={slide.product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 550px"
                  className="object-cover object-top transition-opacity duration-300"
                />

                {/* Floating Product Highlight Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xs shadow-lg border border-[#E8E2D9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#541920]">
                      {slide.product.badge}
                    </span>
                    <h3 className="text-xs sm:text-sm font-serif font-medium text-neutral-900">
                      {slide.product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-xs font-bold text-[#541920]">{slide.product.price}</span>
                      <span className="text-[11px] text-neutral-400 line-through">{slide.product.originalPrice}</span>
                      <span className="text-[10px] text-[#15803D] font-bold">{slide.product.discount}</span>
                    </div>
                  </div>

                  <Link
                    href={slide.product.href}
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
                <p className="text-xs font-semibold text-neutral-900">Premium Fabrics</p>
                <p className="text-[10px] text-neutral-500">Thoughtfully selected textiles</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Quality Checked</p>
                <p className="text-[10px] text-neutral-500">Inspected before dispatch</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <Truck className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Secure Payments</p>
                <p className="text-[10px] text-neutral-500">Safe & encrypted checkout</p>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <RotateCcw className="w-5 h-5 text-[#541920] shrink-0" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Easy Returns</p>
                <p className="text-[10px] text-neutral-500">Simple return experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
