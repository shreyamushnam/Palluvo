"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setIsVisible(window.scrollY > 400);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 bottom-20 sm:bottom-8 z-40 transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        tabIndex={isVisible ? 0 : -1}
        className="min-h-[44px] min-w-[44px] px-4 py-2.5 bg-[#1C1A18]/90 hover:bg-[#1C1A18] backdrop-blur-md text-[#FAF7F2] text-[10px] sm:text-xs font-semibold tracking-widest uppercase rounded-full border border-[#C5A575]/35 hover:border-[#C5A575] shadow-xl hover:shadow-2xl transition-all duration-200 inline-flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none group"
      >
        <ChevronUp className="w-3.5 h-3.5 text-[#C5A575] group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0" aria-hidden="true" />
        <span>TOP</span>
      </button>
    </div>
  );
};
