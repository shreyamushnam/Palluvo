"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pause, Play } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    titleLine1: "Every drape,",
    titleLine2: "a little magic",
    description: "Discover sarees crafted for moments worth remembering.",
    curationTag: "Bestseller",
    categoryName: "Tissue Silk",
    categoryHref: "/shop?category=Tissue+Silk",
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
    curationTag: "Popular",
    categoryName: "Kanjeevaram",
    categoryHref: "/shop?category=Kanjeevaram",
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
    curationTag: "Trending",
    categoryName: "Banarasi",
    categoryHref: "/shop?category=Banarasi",
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
  const [isHovered, setIsHovered] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const totalSlides = SLIDES.length;
  const slide = SLIDES[currentSlideIdx];

  // Detect user preference for reduced motion
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener?.("change", handleChange);
    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
    };
  }, []);

  const isPaused = isHovered || isManuallyPaused || prefersReducedMotion;

  // Auto-advance showcase slides every 4.5 seconds (does NOT trigger live announcements)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % totalSlides);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  // Handler for explicit, user-initiated slide changes (e.g. keyboard or click navigation)
  const handleUserSelectSlide = (idx: number) => {
    setCurrentSlideIdx(idx);
    const targetSlide = SLIDES[idx];
    setLiveAnnouncement(
      `Slide ${idx + 1} of ${totalSlides}: ${targetSlide.titleLine1} ${targetSlide.titleLine2} - featuring ${targetSlide.product.name}`
    );
  };

  const handleTogglePause = () => {
    if (prefersReducedMotion) return;
    setIsManuallyPaused((prev) => {
      const nextPaused = !prev;
      setLiveAnnouncement(
        nextPaused ? "Carousel paused" : "Carousel auto-rotation resumed"
      );
      return nextPaused;
    });
  };

  return (
    <section
      className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#E8E2D9]"
      aria-roledescription="carousel"
      aria-label="Featured Collections Carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onFocus={() => {
        // WAI Carousel Pattern: When carousel receives focus, rotation stops persistently
        // until explicitly restarted by the user.
        setIsManuallyPaused(true);
      }}
    >
      {/* Screen-reader live announcement ONLY for user-initiated actions */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
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
                      href={item.categoryHref}
                      tabIndex={isActive ? 0 : -1}
                      aria-hidden={!isActive}
                      aria-label={`Explore ${item.categoryName} Collection`}
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

                {/* Bottom Overlay: Slide-Specific Curation Badge, Pagination Dots & Rotation Control */}
                <div className="absolute bottom-3 sm:bottom-4 inset-x-0 z-30 flex flex-col items-center gap-2 sm:gap-2.5 px-4 pointer-events-none">
                  {/* Dynamic Slide-Specific Curation Tag */}
                  <span className="pointer-events-auto inline-flex items-center gap-1.5 bg-black/45 backdrop-blur-md text-white text-[10px] sm:text-xs font-medium tracking-wider uppercase px-3 py-1 rounded-full border border-white/20 shadow-sm transition-all hover:bg-black/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] shrink-0" aria-hidden="true" />
                    <span>{slide.curationTag}</span>
                  </span>

                  {/* Controls: Pagination Indicator Dots & Accessible Pause/Play Button */}
                  <div
                    className="pointer-events-auto flex items-center justify-center gap-1 sm:gap-2"
                    role="group"
                    aria-label="Slide controls"
                  >
                    <div
                      className="flex items-center justify-center"
                      role="group"
                      aria-label="Slide selection"
                    >
                      {SLIDES.map((item, idx) => {
                        const isActive = idx === currentSlideIdx;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-label={`Slide ${idx + 1} of ${totalSlides}: ${item.product.name}`}
                            aria-current={isActive ? "true" : undefined}
                            onClick={() => handleUserSelectSlide(idx)}
                            className="group relative flex items-center justify-center min-w-[44px] min-h-[44px] p-2 focus-visible:outline-none cursor-pointer"
                          >
                            <span
                              className={`h-2.5 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black/50 ${
                                isActive
                                  ? "w-6 sm:w-7 bg-white shadow-sm"
                                  : "w-2.5 bg-white/40 group-hover:bg-white/70"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    {/* Visible & Keyboard-Accessible Pause / Resume Carousel Control */}
                    <button
                      type="button"
                      onClick={handleTogglePause}
                      disabled={prefersReducedMotion}
                      aria-label={
                        prefersReducedMotion
                          ? "Auto-rotation disabled by system reduced motion preference"
                          : isManuallyPaused
                          ? "Resume auto-rotating carousel"
                          : "Pause auto-rotating carousel"
                      }
                      aria-pressed={prefersReducedMotion || isManuallyPaused}
                      className={`relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 ${
                        prefersReducedMotion
                          ? "opacity-60 cursor-not-allowed text-white/60"
                          : "text-white/90 hover:text-white cursor-pointer"
                      }`}
                    >
                      <span className="w-8 h-8 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/60 flex items-center justify-center border border-white/20 shadow-sm transition-all">
                        {prefersReducedMotion || isManuallyPaused ? (
                          <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        ) : (
                          <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        )}
                      </span>
                    </button>
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

