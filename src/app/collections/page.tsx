"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const CURATED_COLLECTIONS = [
  {
    id: "the-silk-edit",
    number: "01",
    name: "The Silk Edit",
    tagline: "Heirloom Silks & Pure Metallic Zari",
    description:
      "Opulent Kanjeevarams, liquid Benarasi satins, and sculpted Tanchoi brocades woven for moments that echo across generations.",
    image: "/images/products/royal-blue-kanjeevaram.jpg",
    countText: "Curated Silk Weaves",
    href: "/shop?category=Silk",
    accentColor: "#541920",
  },
  {
    id: "midnight-drapes",
    number: "02",
    name: "Midnight Drapes",
    tagline: "The Poetry of Shadow & Sheer",
    description:
      "Organza, whisper-light tissue silks, and noir matkas created for twilight soirees, cocktail evenings, and candlelit celebrations.",
    image: "/images/products/black-chiffon-saree.jpg",
    countText: "Party Wear Editions",
    href: "/shop?category=Party+Wear",
    accentColor: "#1C1A18",
  },
  {
    id: "festive-stories",
    number: "03",
    name: "Festive Stories",
    tagline: "Gilded Nostalgia & Royal Hues",
    description:
      "Luminous turmeric yellows, ruby carmines, and ceremonial gold tissue silks reimagined with clean contemporary geometry.",
    image: "/images/products/wine-tissue-silk.jpg",
    countText: "Festive Masterpieces",
    href: "/shop?category=Festive",
    accentColor: "#BF6A54",
  },
  {
    id: "everyday-poetry",
    number: "04",
    name: "Everyday Poetry",
    tagline: "Breathable Weaves for Living In",
    description:
      "Handspun Chanderi, unbleached Ahimsa tussar, and organic handlooms crafted for the quiet poetry of everyday life.",
    image: "/images/products/mustard-cotton-saree.jpg",
    countText: "Artisanal Handlooms",
    href: "/shop?category=Handloom",
    accentColor: "#C5A575",
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <nav className="text-xs text-neutral-500 mb-2 flex items-center justify-center sm:justify-start gap-1.5 font-sans">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Collections</span>
          </nav>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs uppercase tracking-widest text-[#541920] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
            <span>Curated Heritage Edits</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-normal text-neutral-900">
            The PALLUVO Collections
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-sans max-w-2xl">
            Thematic explorations of Indian textiles — from celebratory gold zari brocades to lightweight twilight chiffons.
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {CURATED_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-[#541920] text-xs font-mono font-bold px-3 py-1 rounded-xs border border-[#E8E2D9]">
                  {col.number}
                </span>
                <span className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-xs text-white text-[11px] font-sans px-3 py-1 rounded-xs">
                  {col.countText}
                </span>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A575] block">
                    {col.tagline}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-neutral-900 mt-1">
                    {col.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 font-sans mt-2 leading-relaxed">
                    {col.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E2D9]">
                  <Link
                    href={col.href}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
