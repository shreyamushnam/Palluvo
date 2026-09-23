import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { MoodSection } from "@/components/home/MoodSection";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { ShopSection } from "@/components/home/ShopSection";
import { DrapeStories } from "@/components/home/DrapeStories";
import { FabricCloseup } from "@/components/home/FabricCloseup";
import { JournalSection } from "@/components/home/JournalSection";
import { SocialEdit } from "@/components/home/SocialEdit";
import { BrandStatement } from "@/components/home/BrandStatement";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { CartDrawer } from "@/components/interactive/CartDrawer";
import { WishlistDrawer } from "@/components/interactive/WishlistDrawer";
import { SearchModal } from "@/components/interactive/SearchModal";
import { QuickViewModal } from "@/components/interactive/QuickViewModal";
import { StoryModal } from "@/components/interactive/StoryModal";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#1C1A18] selection:bg-[#541920] selection:text-[#FAF7F2]">
      {/* Navigation */}
      <Navbar />
      <MobileMenu />

      {/* 10 Editorial Sections from Scratch */}
      <HeroSection />
      <MoodSection />
      <CollectionsSection />
      <ShopSection />
      <DrapeStories />
      <FabricCloseup />
      <JournalSection />
      <SocialEdit />
      <BrandStatement />
      <NewsletterSection />

      {/* Footer */}
      <Footer />

      {/* Interactive Global Drawers & Modals */}
      <CartDrawer />
      <WishlistDrawer />
      <SearchModal />
      <QuickViewModal />
      <StoryModal />
    </main>
  );
}
