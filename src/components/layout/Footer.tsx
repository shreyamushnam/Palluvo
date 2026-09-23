"use client";

import React from "react";
import Link from "next/link";
import { Globe, ArrowUp } from "lucide-react";
import { InstagramIcon, YoutubeIcon, TwitterIcon } from "@/components/icons/BrandIcons";
import { useStore, Currency } from "@/context/StoreContext";

export const Footer: React.FC = () => {
  const { currency, setCurrency } = useStore();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1C1A18] text-[#FAF7F2] pt-20 pb-12 border-t border-[#3B0E14]/40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-[#FAF7F2]/10">
          
          {/* Brand Column (5 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-block focus:outline-none">
                <span className="font-serif-display text-3xl tracking-[0.24em] font-medium uppercase text-[#FAF7F2]">
                  PALLUVO
                </span>
                <p className="font-serif-display text-sm italic text-[#C5A575] mt-1">
                  “Every drape, a little magic”
                </p>
              </Link>

              <p className="text-xs text-[#FAF7F2]/60 mt-6 max-w-sm font-light leading-relaxed">
                An Indian luxury saree and drape house dedicated to fluid contemporary silhouettes, unstitched geometry, and generational handloom artistry.
              </p>
            </div>

            {/* Currency Selector */}
            <div className="mt-8 pt-6 border-t border-[#FAF7F2]/10 flex items-center gap-3">
              <Globe size={14} className="text-[#C5A575]" />
              <span className="text-[11px] uppercase tracking-wider text-[#FAF7F2]/60">
                Region / Currency:
              </span>
              <div className="flex gap-2 text-xs font-medium">
                {(["INR", "USD", "EUR", "GBP"] as Currency[]).map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`px-2 py-0.5 transition-colors ${
                      currency === cur
                        ? "bg-[#C5A575] text-[#1C1A18] font-bold"
                        : "text-[#FAF7F2]/60 hover:text-[#FAF7F2]"
                    }`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SHOP Column (2 cols) */}
          <div className="lg:col-span-2 lg:pl-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A575] font-semibold mb-6">
              Shop
            </p>
            <ul className="space-y-3.5 text-xs text-[#FAF7F2]/75 font-light">
              <li>
                <a href="#shop-section" className="hover:text-[#C5A575] transition-colors">
                  New Arrivals
                </a>
              </li>
              <li>
                <a href="#shop-section" className="hover:text-[#C5A575] transition-colors">
                  Sarees
                </a>
              </li>
              <li>
                <a href="#collections-section" className="hover:text-[#C5A575] transition-colors">
                  Collections
                </a>
              </li>
              <li>
                <a href="#shop-section" className="hover:text-[#C5A575] transition-colors">
                  Limited Editions
                </a>
              </li>
              <li>
                <a href="#shop-section" className="hover:text-[#C5A575] transition-colors">
                  Bridal Trousseau
                </a>
              </li>
            </ul>
          </div>

          {/* DISCOVER Column (3 cols) */}
          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A575] font-semibold mb-6">
              Discover
            </p>
            <ul className="space-y-3.5 text-xs text-[#FAF7F2]/75 font-light">
              <li>
                <a href="#mood-section" className="hover:text-[#C5A575] transition-colors">
                  About PALLUVO
                </a>
              </li>
              <li>
                <a href="#drape-stories-section" className="hover:text-[#C5A575] transition-colors">
                  Drape Stories
                </a>
              </li>
              <li>
                <a href="#fabric-closeup-section" className="hover:text-[#C5A575] transition-colors">
                  Fabric Architecture
                </a>
              </li>
              <li>
                <a href="#journal-section" className="hover:text-[#C5A575] transition-colors">
                  The PALLUVO Journal
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#C5A575] transition-colors">
                  Instagram (@palluvo)
                </a>
              </li>
            </ul>
          </div>

          {/* HELP Column (3 cols) */}
          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A575] font-semibold mb-6">
              Help & Concierge
            </p>
            <ul className="space-y-3.5 text-xs text-[#FAF7F2]/75 font-light">
              <li>
                <a href="#newsletter" onClick={(e) => { e.preventDefault(); alert("PALLUVO Concierge Desk: concierge@palluvo.com | +91 98200 44021"); }} className="hover:text-[#C5A575] transition-colors">
                  Bespoke Consultation
                </a>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A575] transition-colors" onClick={() => alert("Complimentary worldwide express shipping via DHL Express on all saree orders.")}>
                  Shipping & Customs
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A575] transition-colors" onClick={() => alert("14-day white-glove return window for unstitched sarees in original heirloom packaging.")}>
                  Returns & Exchanges
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A575] transition-colors" onClick={() => alert("Silk Care: Dry clean only with petroleum-based solvents. Store wrapped in pure unbleached muslin.")}>
                  Silk Care & Preservation
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-[#C5A575] transition-colors" onClick={() => alert("PALLUVO FAQs: Saree lengths are 5.5 meters with an unstitched 0.8 meter blouse piece included.")}>
                  Frequently Asked Questions
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright, Socials, Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#FAF7F2]/50">
          
          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#FAF7F2]/70 hover:text-[#C5A575] transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon size={17} />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#FAF7F2]/70 hover:text-[#C5A575] transition-colors"
              aria-label="YouTube"
            >
              <YoutubeIcon size={18} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#FAF7F2]/70 hover:text-[#C5A575] transition-colors"
              aria-label="Twitter / X"
            >
              <TwitterIcon size={17} />
            </a>
          </div>

          <p className="text-center text-[11px] tracking-wider">
            © {new Date().getFullYear()} PALLUVO Luxury Fashion Pvt Ltd. All rights reserved. Crafted with timeless Indian artistry.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#FAF7F2]/70 hover:text-[#C5A575] transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp size={13} />
          </button>

        </div>

      </div>
    </footer>
  );
};
