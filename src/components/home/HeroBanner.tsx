"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    primaryCta: { label: "Shop Kanjeevaram", href: "/shop?category=Kanjeevaram" },
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
    primaryCta: { label: "Shop Banarasi", href: "/shop?category=Banarasi" },
    secondaryCta: { label: "Explore Handloom", href: "/shop?category=Handloom" },
    image: "/images/products/red-banarasi-saree.jpg",
    product: {
      badge: "Festive Masterpiece",
      name: "Red Banarasi Brocade Saree",
      price: "₹6,300",
      originalPrice: "₹8,000",
      discount: "21% OFF",
      href: "/product/pal-005",
    },
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = SLIDES.length;
  const slide = SLIDES[currentSlideIdx];

  // Auto-advance showcase slides every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  return (
    <section
      className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#E8E2D9]"
      aria-roledescription="carousel"
      aria-label="Featured Collections Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Screen-reader live announcement for slide changes */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Slide {currentSlideIdx + 1} of {totalSlides}: {slide.titleLine1} {slide.titleLine2} - featuring {slide.product.name}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-4 sm:py-6 md:py-10 lg:py-16">
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${currentSlideIdx + 1} of ${totalSlides}: ${slide.titleLine1} ${slide.titleLine2}`}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8 lg:gap-12 items-center"
        >
          {/* Left Column: Brand Copy & Direct CTAs */}
          <div className="lg:col-span-6 space-y-2 sm:space-y-3.5 md:space-y-6 text-center lg:text-left">
            <h1 className="text-base min-[380px]:text-lg sm:text-2xl md:text-3xl lg:text-[2.25rem] xl:text-[2.75rem] font-serif font-normal text-[#1C1A18] tracking-tight leading-snug sm:leading-[1.2] whitespace-nowrap">
              <span>{slide.titleLine1}</span>{" "}
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
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="min-h-[44px] px-2.5 sm:px-5 md:px-7 py-2 sm:py-2.5 md:py-3.5 bg-white hover:bg-[#F4EFE6] text-neutral-900 border border-[#DCD5C9] text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center text-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none shrink-0"
              >
                {slide.secondaryCta.label}
              </Link>
            </div>
          </div>

          {/* Right Column: Full-Width Clean Saree Hero Image Showcase */}
          <div className="lg:col-span-6 relative mt-1 lg:mt-0 w-full">
            <div className="relative w-full">
              <div
                className="group relative w-full aspect-[4/5] md:aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-neutral-900 border-2 sm:border-4 border-white block transition-all duration-300 ease-out hover:shadow-3xl focus-within:ring-2 focus-within:ring-[#541920]"
              >
                {/* Layered Cross-Fade Slide Images & Links */}
                {SLIDES.map((item, idx) => {
                  const isActive = idx === currentSlideIdx;
                  return (
                    <Link
                      key={item.id}
                      href={item.product.href}
                      tabIndex={isActive ? 0 : -1}
                      aria-hidden={!isActive}
                      aria-label={`View ${item.product.name} - ${item.product.price}`}
                      className={`absolute inset-0 block transition-opacity duration-700 ease-in-out ${
                        isActive
                          ? "opacity-100 z-10 pointer-events-auto"
                          : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.product.name}
                        fill
                        priority={idx === 0}
                        loading={idx === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 600px"
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </Link>
                  );
                })}

                {/* Subtle Gradient Scrim at Bottom for Badge & Dot Contrast */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-20"
                  aria-hidden="true"
                />

                {/* Bottom Overlay: Bestsellers • Popular Badge & Pagination Dots */}
                <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-30 flex flex-col items-center gap-2 sm:gap-2.5 px-4 pointer-events-none">
                  {/* "Bestsellers • Popular" Curation Tag */}
                  <span className="pointer-events-auto inline-flex items-center gap-1.5 bg-black/45 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full border border-white/20 shadow-sm transition-all hover:bg-black/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] shrink-0" aria-hidden="true" />
                    <span>Bestsellers • Popular</span>
                  </span>

                  {/* Pagination Indicator Dots */}
                  <div
                    className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2"
                    role="tablist"
                    aria-label="Showcase slide indicators"
                  >
                    {SLIDES.map((item, idx) => {
                      const isActive = idx === currentSlideIdx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          aria-label={`Go to slide ${idx + 1}: ${item.product.name}`}
                          onClick={() => setCurrentSlideIdx(idx)}
                          className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer ${
                            isActive
                              ? "w-5 sm:w-6 bg-white shadow-sm"
                              : "w-2 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
