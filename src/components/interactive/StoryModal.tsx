"use client";

import React from "react";
import Image from "next/image";
import { X, Clock, User, Share2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const StoryModal: React.FC = () => {
  const { activeArticle, setActiveArticle } = useStore();

  if (!activeArticle) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C1A18]/80 backdrop-blur-md p-4 sm:p-6 md:p-12 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#FAF7F2] shadow-2xl border border-[#C5A575]/40 overflow-hidden text-left my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveArticle(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#FAF7F2]/80 hover:bg-[#1C1A18] hover:text-[#FAF7F2] text-[#1C1A18] transition-colors"
          aria-label="Close article"
        >
          <X size={20} />
        </button>

        {/* Hero Image */}
        <div className="relative aspect-[16/9] w-full bg-[#F5EFEB]">
          <Image
            src={activeArticle.image}
            alt={activeArticle.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-[#FAF7F2]">
            <span className="text-[10px] uppercase tracking-widest text-[#C5A575] font-semibold">
              {activeArticle.category} • {activeArticle.date}
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-10 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center gap-4 text-xs text-[#8A857E] pb-4 mb-6 border-b border-[#1C1A18]/10">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-[#541920]" /> {activeArticle.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#C5A575]" /> {activeArticle.readTime}
            </span>
          </div>

          <h2 className="font-serif-display text-3xl sm:text-4xl text-[#1C1A18] leading-tight mb-4">
            {activeArticle.title}
          </h2>

          <p className="font-serif-display text-lg text-[#541920] italic mb-8 leading-relaxed">
            {activeArticle.subtitle}
          </p>

          <div className="space-y-5 text-sm text-[#5E5A54] leading-relaxed font-light">
            {activeArticle.content.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Social Share & Footer */}
          <div className="mt-10 pt-6 border-t border-[#1C1A18]/10 flex items-center justify-between text-xs text-[#8A857E]">
            <span>Published in The PALLUVO Journal</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert("Article link copied to clipboard.");
              }}
              className="flex items-center gap-1.5 text-[#1C1A18] hover:text-[#541920]"
            >
              <Share2 size={13} /> Share Essay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
