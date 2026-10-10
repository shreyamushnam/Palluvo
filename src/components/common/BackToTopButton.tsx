"use client";

import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { scrollToTop } from "@/utils/scroll";

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-20 sm:bottom-8 z-40 animate-fade-in pointer-events-auto">
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white hover:bg-neutral-100 text-black shadow-lg hover:shadow-xl border border-neutral-200/80 transition-all duration-200 inline-flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none group"
      >
        <ChevronUp
          className="w-5 h-5 text-black group-hover:-translate-y-0.5 transition-transform duration-200 shrink-0"
          aria-hidden="true"
        />
      </button>
    </div>
  );
};
