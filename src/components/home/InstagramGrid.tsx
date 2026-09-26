"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import { ShoppingBag } from "lucide-react";

const COMMUNITY_POSTS = [
  {
    id: 1,
    image: "/images/community/customer_1.jpg",
    handle: "@ananya_drapes",
    saree: "Wine Tissue Silk",
    productId: "pal-001",
  },
  {
    id: 2,
    image: "/images/community/customer_2.jpg",
    handle: "@priya_elegance",
    saree: "Mustard Cotton Silk",
    productId: "pal-004",
  },
  {
    id: 3,
    image: "/images/community/customer_3.jpg",
    handle: "@tanya.ethnic",
    saree: "Red Banarasi Brocade",
    productId: "pal-005",
  },
  {
    id: 4,
    image: "/images/community/customer_4.jpg",
    handle: "@meera.weaves",
    saree: "Royal Blue Kanjeevaram",
    productId: "pal-002",
  },
  {
    id: 5,
    image: "/images/community/customer_5.jpg",
    handle: "@radhika_celebrates",
    saree: "Lavender Organza",
    productId: "pal-007",
  },
  {
    id: 6,
    image: "/images/community/customer_6.jpg",
    handle: "@sneha_saree_diaries",
    saree: "Emerald Green Silk",
    productId: "pal-009",
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
            Styled by PALLUVO
          </h2>
          <p className="text-xs text-neutral-600 font-sans">
            Real customers celebrating in handcrafted PALLUVO weaves across India.
          </p>
        </div>

        {/* 6-Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
          {COMMUNITY_POSTS.map((post) => (
            <Link
              key={post.id}
              href={`/product/${post.productId}`}
              className="group relative aspect-square sm:aspect-[4/5] rounded-sm overflow-hidden bg-neutral-100 block shadow-xs hover:shadow-lg transition-all duration-300 border border-[#E8E2D9]"
            >
              <Image
                src={post.image}
                alt={post.saree}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex flex-col items-center justify-end p-2.5 sm:p-3 text-white text-center">
                <ShoppingBag className="w-4 h-4 mb-0.5 sm:mb-1 text-[#C5A575]" />
                <span className="text-[10px] font-sans font-medium text-neutral-200">{post.handle}</span>
                <span className="text-[11px] font-serif font-semibold mt-0.5 line-clamp-1">{post.saree}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#C5A575] font-semibold mt-1">Shop Saree →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
