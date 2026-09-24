import React from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { TrendingCarousel } from "@/components/home/TrendingCarousel";
import { CollectionBanner } from "@/components/home/CollectionBanner";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { TrustSection } from "@/components/home/TrustSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { InstagramGrid } from "@/components/home/InstagramGrid";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* E-Commerce Hero Banner with CTAs & Live Badges */}
      <HeroBanner />

      {/* 8-Category Visual Shopping Grid */}
      <CategoryGrid />

      {/* Fresh New Arrivals 4-Column Product Grid */}
      <NewArrivalsSection />

      {/* Stylist Curated "Shop The Look" Bundle Builder */}
      <ShopTheLook />

      {/* Trending Sarees Horizontal Carousel */}
      <TrendingCarousel />

      {/* Special Festive / Seasonal Promo Banner */}
      <CollectionBanner />

      {/* Customer Favorite Bestsellers Grid */}
      <BestsellersSection />

      {/* PALLUVO Trust & Authenticity Pillars */}
      <TrustSection />

      {/* Verified Customer Reviews & Testimonials */}
      <ReviewsSection />

      {/* Community Instagram Styling Masonry */}
      <InstagramGrid />
    </div>
  );
}
