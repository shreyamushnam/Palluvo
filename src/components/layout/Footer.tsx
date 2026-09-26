"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/icons/BrandIcons";
import { InfoModal, InfoModalTab } from "@/components/layout/InfoModal";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState<InfoModalTab>("contact");

  const openInfo = (tab: InfoModalTab) => {
    setInfoModalTab(tab);
    setInfoModalOpen(true);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <>
      <footer className="bg-[#1C1A18] text-[#FAF7F2] pt-16 pb-20 lg:pb-12 border-t border-[#3B0E14]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#FAF7F2]/10">
            
            {/* Brand Col */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block">
                <span className="font-serif-display text-3xl tracking-[0.2em] font-medium uppercase text-[#FAF7F2]">
                  PALLUVO
                </span>
                <p className="font-serif-display text-xs italic text-[#C5A575] mt-1">
                  Every drape, a little magic.
                </p>
              </Link>
              <p className="text-xs text-[#FAF7F2]/65 mt-4 max-w-sm leading-relaxed font-light">
                PALLUVO is a modern Indian ethnic fashion house bringing artisanal pure silk, organza, tussar, and handloom sarees directly to your doorstep.
              </p>

              {/* Newsletter Box */}
              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-[#C5A575] font-semibold mb-2">
                  Get the latest from PALLUVO
                </p>
                {subscribed ? (
                  <div className="flex items-center gap-2 text-xs text-[#A8D5BA] min-h-[44px]">
                    <Check size={16} /> Thank you for subscribing! Check your inbox for 10% off.
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="min-h-[44px] h-11 flex-1 px-3.5 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-xs text-[#FAF7F2] placeholder:text-[#FAF7F2]/40 focus:outline-none focus:border-[#C5A575]"
                    />
                    <button
                      type="submit"
                      className="min-h-[44px] h-11 px-4 bg-[#541920] hover:bg-[#7B1113] text-[#FAF7F2] text-xs uppercase tracking-wider font-medium transition-colors shrink-0 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* SHOP */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-2">
                Shop
              </p>
              <ul className="text-xs text-[#FAF7F2]/75 font-light">
                <li>
                  <Link href="/shop?category=New+Arrivals" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Sarees
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Silk" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Silk Sarees
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Handloom" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Handloom
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Festive" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Festive Edits
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Bridal" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Bridal Sarees
                  </Link>
                </li>
              </ul>
            </div>

            {/* HELP */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-2">
                Help & Contact
              </p>
              <ul className="text-xs text-[#FAF7F2]/75 font-light">
                <li>
                  <Link href="/account" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Track Order
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("contact")}
                    className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs cursor-pointer"
                  >
                    Concierge & Help Desk
                  </button>
                </li>
                <li>
                  <a href="mailto:contact@palluvo.com" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    contact@palluvo.com
                  </a>
                </li>
                <li>
                  <a href="tel:+918498854323" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    +91 84988 54323
                  </a>
                </li>
                <li>
                  <a href="tel:+918106789789" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    +91 81067 89789
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("shipping")}
                    className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs cursor-pointer"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("returns")}
                    className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs cursor-pointer"
                  >
                    Returns & Exchanges
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("faqs")}
                    className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs cursor-pointer"
                  >
                    FAQs
                  </button>
                </li>
              </ul>
            </div>

            {/* ABOUT & FOLLOW US */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-2">
                About
              </p>
              <ul className="text-xs text-[#FAF7F2]/75 font-light mb-4">
                <li>
                  <button
                    onClick={() => openInfo("story")}
                    className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs cursor-pointer"
                  >
                    Our Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("craftsmanship")}
                    className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs cursor-pointer"
                  >
                    Craftsmanship
                  </button>
                </li>
                <li>
                  <Link href="/shop" className="min-h-[44px] inline-flex items-center hover:text-[#C5A575] transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-2xs">
                    Journal & Drapes
                  </Link>
                </li>
              </ul>

              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-1">
                Follow Us
              </p>
              <div className="flex items-center gap-1 text-[#FAF7F2]/80 -ml-2">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center hover:text-[#C5A575] focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-xs" aria-label="Instagram">
                  <InstagramIcon size={18} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center hover:text-[#C5A575] text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-xs" aria-label="Facebook">
                  FB
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center hover:text-[#C5A575] text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none rounded-xs" aria-label="Pinterest">
                  PIN
                </a>
              </div>
            </div>

          </div>

          {/* Bottom copyright */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F2]/50 gap-3">
            <p>© {new Date().getFullYear()} PALLUVO Retail Pvt Ltd. All rights reserved.</p>
            <div className="flex gap-4">
              <span>100% Genuine Sarees</span>
              <span>•</span>
              <span>Silk Mark Certified</span>
              <span>•</span>
              <span>Secure 256-Bit SSL Checkout</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Interactive InfoModal */}
      <InfoModal
        isOpen={infoModalOpen}
        initialTab={infoModalTab}
        onClose={() => setInfoModalOpen(false)}
      />
    </>
  );
};
