"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Compass, CheckCircle2 } from "lucide-react";
import { DRAPE_STORIES } from "@/data/drapes";

export const DrapeStories: React.FC = () => {
  const [activeDrapeIndex, setActiveDrapeIndex] = useState(0);
  const activeStory = DRAPE_STORIES[activeDrapeIndex];

  return (
    <section id="drape-stories-section" className="py-24 md:py-36 bg-[#FAF7F2] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1C1A18]/10 pb-8 mb-14 md:mb-16">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#541920] font-semibold">
              The Architecture of Drape
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light mt-2">
              One saree. Many stories.
            </h2>
          </div>
          <p className="text-sm text-[#5E5A54] max-w-sm mt-4 md:mt-0 font-light leading-relaxed">
            The same six yards can become an armored column of power dressing, an ethereal evening cloud, or timeless regal heritage.
          </p>
        </div>

        {/* Drape Selector Tabs */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-4 mb-12">
          {DRAPE_STORIES.map((story, idx) => {
            const isActive = idx === activeDrapeIndex;
            return (
              <button
                key={story.id}
                onClick={() => setActiveDrapeIndex(idx)}
                className={`flex items-center gap-2.5 px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[#541920] text-[#FAF7F2] shadow-md"
                    : "bg-[#F5EFEB] text-[#1C1A18] hover:bg-[#EAE4DC]"
                }`}
              >
                <span>{story.name}</span>
                {isActive && <Sparkles size={12} className="text-[#C5A575]" />}
              </button>
            );
          })}
        </div>

        {/* Dynamic Interactive Visual & Editorial Story Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center bg-[#F5EFEB] p-6 sm:p-10 lg:p-14 shadow-lg border border-[#C5A575]/20">
          
          {/* Large Image Showcase with Smooth Transition */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto overflow-hidden bg-[#FAF7F2] shadow-xl group">
              <Image
                key={activeStory.id}
                src={activeStory.image}
                alt={activeStory.name}
                fill
                className="object-cover object-top animate-in fade-in zoom-in-95 duration-700"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/50 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 p-4 glass-card">
                <p className="text-[10px] uppercase tracking-widest text-[#541920] font-semibold">
                  {activeStory.subtitle}
                </p>
                <p className="font-serif-display text-sm text-[#1C1A18] mt-1 italic">
                  &ldquo;{activeStory.quote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Draping Guide & Details */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#C5A575] mb-2">
              <Compass size={16} />
              <span className="text-[11px] uppercase tracking-widest font-semibold">
                Drape Blueprint • Step-by-Step
              </span>
            </div>

            <h3 className="font-serif-display text-3xl sm:text-4xl text-[#1C1A18] font-light mb-2">
              {activeStory.name}
            </h3>
            <p className="text-sm font-serif-display italic text-[#541920] mb-6">
              {activeStory.subtitle}
            </p>

            {/* Steps list */}
            <div className="space-y-3.5 mb-8">
              {activeStory.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-3 text-xs sm:text-sm text-[#5E5A54] leading-relaxed">
                  <CheckCircle2 size={16} className="text-[#BF6A54] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Styling Tip Box */}
            <div className="p-4 bg-[#FAF7F2] border-l-2 border-[#C5A575] space-y-2 mb-8">
              <p className="text-[10px] uppercase tracking-wider text-[#1C1A18] font-semibold">
                Stylist Note
              </p>
              <p className="text-xs text-[#5E5A54] font-light leading-relaxed">
                {activeStory.stylingTip}
              </p>
              <p className="text-[11px] text-[#8A857E] pt-1">
                <strong>Ideal Occasion:</strong> {activeStory.idealFor}
              </p>
            </div>

            {/* Action CTA */}
            <div>
              <a
                href="#shop-section"
                className="inline-flex items-center justify-center px-6 py-3 bg-[#1C1A18] hover:bg-[#541920] text-[#FAF7F2] text-xs uppercase tracking-widest transition-colors font-medium"
              >
                Shop Sarees For This Drape
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
