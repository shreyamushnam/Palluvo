"use client";

import React, { useState, useEffect } from "react";

export const BrandStatement: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative min-h-[70vh] sm:min-h-[85vh] w-full flex items-center justify-center bg-[#FAF7F2] py-28 md:py-44 px-6 md:px-12 text-center overflow-hidden border-t border-[#1C1A18]/5">
      {/* Background Decorative Circular Radiance */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-[#C5A575]/10 blur-3xl pointer-events-none transition-transform duration-1000 ease-out"
        style={{
          transform: `translateY(${(scrollY - 3500) * 0.05}px)`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        {/* Subtle antique gold crown line */}
        <div className="w-12 h-[1.5px] bg-[#C5A575] mb-10" />

        <p className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#541920] font-semibold mb-6">
          The Philosophy
        </p>

        {/* Large Statement Typography */}
        <h2 className="font-serif-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-[#1C1A18] leading-[1.15] tracking-tight">
          Not just a saree. <br />
          <span className="italic font-normal text-[#541920]">
            A feeling you carry.
          </span>
        </h2>

        {/* Micro Subline */}
        <p className="mt-8 sm:mt-10 text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8A857E] max-w-md font-light">
          Woven in quiet luxury • Rooted in heritage • Bound to memory
        </p>

        {/* Subtle antique gold base line */}
        <div className="w-12 h-[1.5px] bg-[#C5A575] mt-10" />
      </div>
    </section>
  );
};
