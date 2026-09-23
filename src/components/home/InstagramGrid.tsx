"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import { ShoppingBag } from "lucide-react";

const COMMUNITY_POSTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80",
    handle: "@ananya_drapes",
    saree: "Rani Crimson Silk",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80",
    handle: "@priya_elegance",
    saree: "Emerald Kanjeevaram",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=700&q=80",
    handle: "@tanya.ethnic",
    saree: "Peacock Blue Paithani",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
    handle: "@meera.weaves",
    saree: "Banarasi Golden Brocade",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=700&q=80",
    handle: "@radhika_celebrates",
    saree: "Lotus Organza Tissue",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=700&q=80",
    handle: "@sneha_saree_diaries",
    saree: "Sunlit Mustard Tussar",
  },
];

export const InstagramGrid: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest text-[#541920] font-semibold">
            <InstagramIcon className="w-4 h-4" />
            <span>#PalluvoDrapes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900">
            Styled by You Across India
          </h2>
          <p className="text-xs text-neutral-600 font-sans">
            Tag @palluvo_official in your festive and wedding moments to be featured.
          </p>
        </div>

        {/* 6-Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {COMMUNITY_POSTS.map((post) => (
            <Link
              key={post.id}
              href="/shop"
              className="group relative aspect-[3/4] rounded-sm overflow-hidden bg-neutral-200 block shadow-2xs hover:shadow-md transition-shadow"
            >
              <Image
                src={post.image}
                alt={post.saree}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white text-center">
                <ShoppingBag className="w-4 h-4 mb-1 text-[#C5A575]" />
                <span className="text-[10px] font-sans font-medium">{post.handle}</span>
                <span className="text-[11px] font-serif font-semibold mt-0.5 line-clamp-1">{post.saree}</span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-300 mt-1">Shop Look →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
