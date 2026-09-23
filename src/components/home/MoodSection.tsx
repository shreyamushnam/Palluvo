"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, X } from "lucide-react";

export const MoodSection: React.FC = () => {
  const [showStoryModal, setShowStoryModal] = useState(false);

  return (
    <section id="mood-section" className="relative py-24 md:py-36 bg-[#F5EFEB] overflow-hidden border-t border-[#1C1A18]/5">
      {/* Background Accent Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5A575]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Editorial Header Tag */}
        <div className="flex items-center justify-between border-b border-[#1C1A18]/10 pb-4 mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#541920] font-medium">
            Chapter 02 • The PALLUVO Mood
          </p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A857E] hidden sm:block">
            Architectural Fluidity
          </p>
        </div>

        {/* Magazine Spread Split-Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Side 1: Large Artistic Saree Fabric / Detail Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden shadow-2xl bg-[#FAF7F2] group">
              <Image
                src="https://images.unsplash.com/photo-1752702532556-2a0b095f3a98?q=80&w=1400&auto=format&fit=crop"
                alt="PALLUVO Saree fabric texture and handloom drape"
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Soft editorial gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Textile Micro Caption */}
              <div className="absolute bottom-6 left-6 right-6 p-4 glass-card text-left">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#541920] font-bold">
                  TEXTILE ARCHIVE
                </span>
                <p className="font-serif-display text-sm text-[#1C1A18] mt-0.5">
                  Hand-twisted zari weft on fine mulberry silk • Woven by generational masters
                </p>
              </div>
            </div>

            {/* Overlapping small accent card */}
            <div className="absolute -bottom-6 -right-4 sm:-right-8 p-5 bg-[#FAF7F2] border border-[#C5A575]/40 shadow-xl max-w-[200px] hidden sm:block">
              <Sparkles size={16} className="text-[#C5A575] mb-2" />
              <p className="text-[10px] uppercase tracking-wider text-[#1C1A18] font-semibold">
                Unstitched Geometry
              </p>
              <p className="text-[11px] text-[#5E5A54] mt-1 font-serif-display italic">
                Six yards of dynamic kinetic grace.
              </p>
            </div>
          </div>

          {/* Side 2: Editorial Typography & Philosophy */}
          <div className="lg:col-span-6 flex flex-col justify-center lg:pl-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#C5A575] font-semibold mb-4">
              Our Design Ethos
            </span>

            {/* Large Heading */}
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light leading-[1.12] mb-8">
              Made to be <br />
              <span className="italic font-normal text-[#541920]">remembered.</span>
            </h2>

            {/* Body Quote */}
            <p className="font-serif-display text-xl sm:text-2xl text-[#1C1A18] leading-relaxed mb-6 font-normal">
              “PALLUVO celebrates the beauty of the Indian drape through contemporary design, expressive textiles and effortless elegance.”
            </p>

            <p className="text-sm text-[#5E5A54] leading-relaxed mb-8 max-w-lg font-light">
              We believe a saree is not static tradition; it is living art. Stripped of heavy stiffness, each PALLUVO creation breathes with fluidity—reimagined with modern proportions, softened metallic threads, and a tactile richness that honors both the artisan’s hands and the wearer’s personal voice.
            </p>

            {/* Interactive CTA */}
            <div>
              <button
                onClick={() => setShowStoryModal(true)}
                className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.24em] font-medium text-[#1C1A18] hover:text-[#541920] transition-colors py-2 border-b border-[#1C1A18]/20 hover:border-[#541920]"
              >
                <span>Our Story</span>
                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-[#C5A575]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1A18]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#FAF7F2] p-8 md:p-12 shadow-2xl border border-[#C5A575]/40 text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute top-6 right-6 p-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
              aria-label="Close story modal"
            >
              <X size={22} />
            </button>

            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A575] font-semibold">
              The Genesis of PALLUVO
            </span>
            <h3 className="font-serif-display text-3xl sm:text-4xl text-[#1C1A18] mt-2 mb-6">
              Every drape, a little magic.
            </h3>

            <div className="space-y-4 text-sm text-[#5E5A54] leading-relaxed font-light">
              <p>
                PALLUVO was conceived from a single, compelling conviction: that the Indian saree is humanity&apos;s most sophisticated garment, yet it deserves to be liberated from museum pedestals and rigid ceremonial burdens.
              </p>
              <p>
                Our name evokes the <em>Pallu</em>—the expressive, floating end of the saree that drapes over the shoulder, catching wind, movement, and sentiment. In that floating yardage lies the magic of spontaneous drama.
              </p>
              <p>
                We collaborate directly with generational weaving clusters in Kanchipuram, Varanasi, Chanderi, and Fulia. By recalibrating warp tensions and employing unrefined, antique electroplated gold and silver zari, we produce sarees that are substantially lighter, fluid, and comfortable enough to wear from a morning gallery opening to a midnight celebration.
              </p>
              <blockquote className="p-4 bg-[#F5EFEB] border-l-2 border-[#541920] my-4 font-serif-display text-base text-[#1C1A18] italic">
                “When you drape a PALLUVO, you wear six yards of freedom, sculpted entirely by your own hands.”
              </blockquote>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1C1A18]/10 flex justify-end">
              <button
                onClick={() => setShowStoryModal(false)}
                className="px-6 py-2.5 bg-[#1C1A18] text-[#FAF7F2] text-xs uppercase tracking-widest hover:bg-[#541920] transition-colors"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
