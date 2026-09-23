"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Clock } from "lucide-react";
import { ARTICLES, Article } from "@/data/articles";
import { useStore } from "@/context/StoreContext";

export const JournalSection: React.FC = () => {
  const { setActiveArticle } = useStore();
  const leadArticle = ARTICLES[0];
  const sideArticles = ARTICLES.slice(1);

  return (
    <section id="journal-section" className="py-24 md:py-36 bg-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1C1A18]/10 pb-8 mb-14 md:mb-16">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-[#541920] font-semibold">
              Editorial Dispatches
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light mt-2">
              The PALLUVO Journal
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0 text-xs text-[#5E5A54] uppercase tracking-widest">
            <BookOpen size={15} className="text-[#C5A575]" />
            <span>Volume 01 • Curated Essays on Textile Culture</span>
          </div>
        </div>

        {/* Magazine-Style Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Main Feature Story (Lead 7-col) */}
          <div
            onClick={() => setActiveArticle(leadArticle)}
            className="lg:col-span-7 group cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-[#F5EFEB] shadow-xl">
              <Image
                src={leadArticle.image}
                alt={leadArticle.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/50 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-4 left-4 px-3 py-1 glass-card text-[9px] uppercase tracking-widest text-[#541920] font-bold">
                Cover Story
              </div>
            </div>

            <div className="pt-6">
              <div className="flex items-center gap-4 text-xs text-[#8A857E] mb-2.5">
                <span className="uppercase tracking-widest text-[#541920] font-semibold">
                  {leadArticle.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {leadArticle.readTime}
                </span>
                <span>•</span>
                <span>{leadArticle.author}</span>
              </div>

              <h3 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl text-[#1C1A18] group-hover:text-[#541920] transition-colors leading-tight mb-3">
                {leadArticle.title}
              </h3>

              <p className="text-sm text-[#5E5A54] font-light leading-relaxed mb-4 max-w-xl">
                {leadArticle.excerpt}
              </p>

              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-medium text-[#1C1A18] group-hover:text-[#541920] transition-colors">
                <span>Read Full Essay</span>
                <ArrowUpRight size={14} className="text-[#C5A575] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Secondary Editorial Column (5-col with 3 stories) */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-[#1C1A18]/10">
            {sideArticles.map((article: Article) => (
              <div
                key={article.id}
                onClick={() => setActiveArticle(article)}
                className="group cursor-pointer py-6 first:pt-0 last:pb-0 flex items-start gap-5"
              >
                <div className="relative w-24 sm:w-28 aspect-[3/4] shrink-0 overflow-hidden bg-[#F5EFEB] shadow-md">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    sizes="120px"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-[#8A857E] mb-1">
                      <span className="uppercase tracking-wider text-[#541920] font-semibold">
                        {article.category}
                      </span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h4 className="font-serif-display text-lg sm:text-xl text-[#1C1A18] group-hover:text-[#541920] transition-colors leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-xs text-[#5E5A54] mt-1 font-light line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-2 text-[10px] uppercase tracking-widest text-[#C5A575] font-semibold flex items-center gap-1">
                    <span>Read Story</span>
                    <ArrowUpRight size={11} />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
