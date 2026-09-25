import React from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedCollectionSection } from "@/components/home/FeaturedCollectionSection";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { CollectionBanner } from "@/components/home/CollectionBanner";
import { TrustSection } from "@/components/home/TrustSection";
import { InstagramGrid } from "@/components/home/InstagramGrid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* E-Commerce Hero Banner with CTAs & Live Badges */}
      <HeroBanner />

      {/* 8-Category Visual Shopping Grid */}
      <CategoryGrid />

      {/* Consolidated Featured Collection (New Arrivals, Popular, Bestsellers) */}
      <FeaturedCollectionSection />

      {/* Stylist Curated "Shop The Look" Bundle Builder */}
      <ShopTheLook />

      {/* Special Festive / Seasonal Promo Banner */}
      <CollectionBanner />

      {/* PALLUVO Single Trust & Authenticity Pillars */}
      <TrustSection />

      {/* Community Instagram Styling Masonry */}
      <InstagramGrid />
    </div>
  );
}
