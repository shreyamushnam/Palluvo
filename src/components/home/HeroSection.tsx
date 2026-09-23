"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";

export const HeroSection: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-[#FAF7F2] pt-20 pb-16 lg:py-0">
      {/* Background Subtle Editorial Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-10">
        <div className="max-w-7xl mx-auto h-full px-6 md:px-10 border-x border-[#1C1A18]/5 grid grid-cols-1 md:grid-cols-12">
          <div className="hidden md:block col-span-5 border-r border-[#1C1A18]/5 h-full" />
          <div className="hidden md:block col-span-7 h-full" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full px-6 md:px-10 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-100px)]">
          
          {/* Asymmetric Typography - Left / Center Left */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center order-2 lg:order-1 pt-6 lg:pt-0">
            {/* Editorial Issue Marker */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-[1px] bg-[#C5A575]" />
              <span className="text-[11px] uppercase tracking-[0.28em] text-[#541920] font-medium">
                Volume 01 • Autumn / Winter
              </span>
            </div>

            {/* Asymmetrical Hero Headline */}
            <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-light text-[#1C1A18] leading-[1.08] tracking-tight mb-6">
              Every drape, <br />
              <span className="italic font-normal text-[#541920] pl-2 md:pl-6 inline-block">
                a little magic.
              </span>
            </h1>

            {/* Supporting quote */}
            <p className="text-base sm:text-lg text-[#5E5A54] font-light max-w-md mb-8 sm:mb-10 leading-relaxed tracking-wide">
              Modern silhouettes. Timeless Indian artistry.
              <span className="block mt-2 text-xs sm:text-sm text-[#8A857E]">
                Crafted for the woman who inhabits the modern world with an ancient grace.
              </span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
              <a
                href="#shop-section"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#1C1A18] text-[#FAF7F2] text-xs uppercase tracking-[0.24em] font-medium transition-all duration-300 hover:bg-[#541920] hover:shadow-[0_10px_25px_-5px_rgba(84,25,32,0.3)] hover:-translate-y-0.5"
              >
                <span>Explore the Collection</span>
              </a>

              <a
                href="#mood-section"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-[#1C1A18] hover:text-[#541920] transition-colors py-2"
              >
                <span className="relative">
                  Discover PALLUVO
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A575] transition-all duration-300 group-hover:bg-[#541920]" />
                </span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-[#C5A575]" />
              </a>
            </div>

            {/* Micro Details */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-[#1C1A18]/8">
              <div>
                <p className="font-serif-display text-xl sm:text-2xl text-[#1C1A18]">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-[#8A857E] mt-0.5">Mulberry Silk</p>
              </div>
              <div>
                <p className="font-serif-display text-xl sm:text-2xl text-[#1C1A18]">28 Days</p>
                <p className="text-[10px] uppercase tracking-wider text-[#8A857E] mt-0.5">Per Handloom</p>
              </div>
              <div>
                <p className="font-serif-display text-xl sm:text-2xl text-[#1C1A18]">Varanasi</p>
                <p className="text-[10px] uppercase tracking-wider text-[#8A857E] mt-0.5">& Kanchipuram</p>
              </div>
            </div>
          </div>

          {/* Large High-Fashion Photography - Right Asymmetric Composition */}
          <div className="lg:col-span-6 xl:col-span-7 relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              
              {/* Decorative vintage magazine frame outline */}
              <div className="absolute -inset-3 sm:-inset-4 border border-[#C5A575]/40 -z-10 translate-x-3 translate-y-3 pointer-events-none hidden sm:block" />

              {/* Main Fashion Photograph with calibrated 3:4 dimensions */}
              <div className="relative aspect-[3/4] w-full max-h-[78vh] overflow-hidden shadow-2xl bg-[#F5EFEB]">
                <Image
                  src="/images/hero-saree.jpg"
                  alt="PALLUVO Couture Royal Burgundy & Gold Kanjeevaram Saree"
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                />

                {/* Subtle vignette & soft warm film overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/25 via-transparent to-transparent pointer-events-none" />

                {/* Editorial Corner Badge */}
                <div className="absolute bottom-5 right-5 glass-card px-4 py-2.5 text-right hidden sm:block">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-[#8A857E]">LOOK 01</p>
                  <p className="font-serif-display text-sm text-[#1C1A18] font-medium">Aadrika Chandrakala</p>
                  <p className="text-[10px] text-[#541920] font-sans-body">Royal Heritage Silk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Small Vertical Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-20">
        <span className="text-[9px] uppercase tracking-[0.3em] text-[#8A857E]">
          Scroll to Explore
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#C5A575] to-transparent animate-scroll-indicator" />
      </div>
    </section>
  );
};
