import React from "react";
import type { Metadata } from "next";
import { HeroBanner } from "@/components/home/HeroBanner";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedCollectionSection } from "@/components/home/FeaturedCollectionSection";
import { ShopTheLook } from "@/components/home/ShopTheLook";
import { CollectionBanner } from "@/components/home/CollectionBanner";
import { TrustSection } from "@/components/home/TrustSection";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { OfferWelcomeModal } from "@/components/home/OfferWelcomeModal";
import { BackToTopButton } from "@/components/common/BackToTopButton";

export const metadata: Metadata = {
  title: "PALLUVO | Buy Designer Sarees Online | Pure Silk, Handloom, & Bridal",
  description:
    "Shop premium Indian sarees online at PALLUVO. Discover handwoven Kanjeevaram silk, Banarasi brocades, lightweight organza, and festive party wear. Free shipping above ₹1999 & easy returns.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Welcome 10% Offer Modal for Signed-In Members */}
      <OfferWelcomeModal />

      {/* Floating Back to Top Button */}
      <BackToTopButton />

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
