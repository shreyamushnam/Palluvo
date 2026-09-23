"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, Info } from "lucide-react";

interface Hotspot {
  id: string;
  top: string;
  left: string;
  title: string;
  detail: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "hs-1",
    top: "35%",
    left: "28%",
    title: "Electroplated Antique Gold Zari",
    detail: "Dipped silver core wrapped in fine unrefined gold thread. Imparts a subdued, matte luminosity rather than glaring yellow shine.",
  },
  {
    id: "hs-2",
    top: "55%",
    left: "68%",
    title: "Four-Ply Mulberry Weft",
    detail: "Continuous silk filament harvested from heritage non-violent sericulture farms, delivering fluid drape weight without stiffness.",
  },
  {
    id: "hs-3",
    top: "72%",
    left: "42%",
    title: "Hand-Knotted Resham Tassels",
    detail: "Every pallu fringe is individually twisted and knotted by hand over 6 hours, finished with tiny gilded beads.",
  },
];

export const FabricCloseup: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="fabric-closeup-section" className="relative min-h-[85vh] w-full flex items-center justify-center overflow-hidden bg-[#1C1A18] text-[#FAF7F2]">
      
      {/* Background High-Res Macro Textile Image with Subtle Parallax */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1698657169427-a24d79024f14?q=80&w=1800&auto=format&fit=crop"
          alt="Macro close-up of intricate handwoven silk fabric and zari details"
          fill
          className="object-cover object-center opacity-45 transition-transform duration-1000 ease-out"
          style={{
            transform: `scale(1.08) translateY(${(scrollY - 2000) * 0.04}px)`,
          }}
          sizes="100vw"
        />
        {/* Editorial grain & vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18] via-transparent to-[#1C1A18]/80 pointer-events-none" />
      </div>

      {/* Interactive Hotspots on the Fabric */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="relative w-full h-full max-w-7xl mx-auto">
          {HOTSPOTS.map((spot) => (
            <div
              key={spot.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: spot.top, left: spot.left }}
            >
              <button
                onClick={() =>
                  setActiveHotspot(activeHotspot?.id === spot.id ? null : spot)
                }
                className="relative group p-2 focus:outline-none"
                aria-label={`View detail: ${spot.title}`}
              >
                <span className="absolute inset-0 rounded-full bg-[#C5A575]/40 animate-ping" />
                <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF7F2] text-[#1C1A18] shadow-lg border border-[#C5A575] hover:scale-110 transition-transform">
                  <Sparkles size={13} className="text-[#541920]" />
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Center Editorial Overlay Text */}
      <div className="relative z-20 max-w-3xl mx-auto px-6 text-center py-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF7F2]/10 backdrop-blur-md border border-[#C5A575]/30 mb-6 text-[10px] uppercase tracking-[0.3em] text-[#C5A575]">
          <Info size={12} />
          <span>Macro Craftsmanship</span>
        </div>

        <h2 className="font-serif-display text-5xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#FAF7F2] mb-4">
          Look closer.
        </h2>

        <p className="font-serif-display text-xl sm:text-2xl italic text-[#FAF7F2]/90 max-w-lg mx-auto font-light leading-relaxed">
          &ldquo;Because magic lives in the details.&rdquo;
        </p>

        <p className="text-xs sm:text-sm text-[#FAF7F2]/70 max-w-md mx-auto mt-6 font-light leading-relaxed">
          Touch the luminous hotspots above to inspect the ancient mathematics of our warp tension, pure gold wrapping, and artisan selvedges.
        </p>

        {/* Hotspot details card popup if active */}
        {activeHotspot && (
          <div className="mt-8 p-6 bg-[#FAF7F2] text-[#1C1A18] shadow-2xl border border-[#C5A575] max-w-md mx-auto text-left animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-start justify-between">
              <span className="text-[10px] uppercase tracking-widest text-[#541920] font-bold">
                WEAVE SPECIFICATION
              </span>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-xs text-[#8A857E] hover:text-[#1C1A18]"
              >
                ✕
              </button>
            </div>
            <h4 className="font-serif-display text-xl text-[#1C1A18] mt-1 mb-2">
              {activeHotspot.title}
            </h4>
            <p className="text-xs text-[#5E5A54] leading-relaxed font-light">
              {activeHotspot.detail}
            </p>
          </div>
        )}
      </div>

    </section>
  );
};
