"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Heart, MapPin, X } from "lucide-react";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import { SOCIAL_POSTS, SocialPost } from "@/data/social";

export const SocialEdit: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);

  return (
    <section className="py-24 md:py-36 bg-[#F5EFEB] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#1C1A18]/10 pb-8 mb-14 md:mb-16">
          <div>
            <div className="flex items-center gap-2 text-[#541920] mb-1">
              <InstagramIcon size={16} />
              <span className="text-[11px] uppercase tracking-[0.3em] font-semibold">
                @palluvo
              </span>
            </div>
            <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light mt-1">
              Seen in the wild
            </h2>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] font-medium text-[#1C1A18] hover:text-[#541920] transition-colors mt-4 md:mt-0 py-1"
          >
            <span>Follow the story</span>
            <ArrowUpRight size={14} className="text-[#C5A575] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Masonry-Style Image Arrangement */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {SOCIAL_POSTS.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="break-inside-avoid relative overflow-hidden bg-[#FAF7F2] shadow-md group cursor-pointer"
            >
              <div className={`relative ${post.aspect} w-full`}>
                <Image
                  src={post.image}
                  alt={post.caption}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                
                {/* Hover overlay with location & likes */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1C1A18]/80 via-[#1C1A18]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-5 text-[#FAF7F2]">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-[#C5A575]">
                    <span>{post.tag}</span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} className="fill-current text-[#C5A575]" /> {post.likes}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-[11px] text-[#FAF7F2]/80 mb-1">
                      <MapPin size={11} /> {post.location}
                    </div>
                    <p className="text-xs text-[#FAF7F2] font-serif-display italic line-clamp-2">
                      &ldquo;{post.caption}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Modal Preview */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1A18]/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#FAF7F2] overflow-hidden shadow-2xl border border-[#C5A575]/40 text-left">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1C1A18]/60 text-white hover:bg-[#1C1A18] transition-colors"
              aria-label="Close image preview"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[4/5] w-full">
              <Image
                src={selectedPost.image}
                alt={selectedPost.caption}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between text-xs text-[#8A857E] mb-2">
                <span className="font-semibold text-[#541920]">{selectedPost.author}</span>
                <span className="flex items-center gap-1 text-[#1C1A18]">
                  <MapPin size={12} /> {selectedPost.location}
                </span>
              </div>
              <p className="text-sm font-serif-display text-[#1C1A18] italic mb-3">
                &ldquo;{selectedPost.caption}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-[#1C1A18]/10 text-xs">
                <span className="text-[#C5A575] font-medium">{selectedPost.tag}</span>
                <span className="text-[#8A857E]">{selectedPost.likes} appreciations</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
