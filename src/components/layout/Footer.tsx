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
                  <div className="flex items-center gap-2 text-xs text-[#A8D5BA]">
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
                      className="flex-1 px-3.5 py-2.5 bg-[#FAF7F2]/10 border border-[#FAF7F2]/20 text-xs text-[#FAF7F2] placeholder:text-[#FAF7F2]/40 focus:outline-none focus:border-[#C5A575]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#541920] hover:bg-[#7B1113] text-[#FAF7F2] text-xs uppercase tracking-wider font-medium transition-colors shrink-0"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* SHOP */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-4">
                Shop
              </p>
              <ul className="space-y-2.5 text-xs text-[#FAF7F2]/75 font-light">
                <li>
                  <Link href="/shop?category=New+Arrivals" className="hover:text-[#C5A575] transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#C5A575] transition-colors">
                    Sarees
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Silk" className="hover:text-[#C5A575] transition-colors">
                    Silk Sarees
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Handloom" className="hover:text-[#C5A575] transition-colors">
                    Handloom
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Festive" className="hover:text-[#C5A575] transition-colors">
                    Festive Edits
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Bridal" className="hover:text-[#C5A575] transition-colors">
                    Bridal Sarees
                  </Link>
                </li>
              </ul>
            </div>

            {/* HELP */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-4">
                Help
              </p>
              <ul className="space-y-2.5 text-xs text-[#FAF7F2]/75 font-light">
                <li>
                  <Link href="/account" className="hover:text-[#C5A575] transition-colors">
                    Track Order
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("contact")}
                    className="hover:text-[#C5A575] transition-colors text-left"
                  >
                    Contact Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("shipping")}
                    className="hover:text-[#C5A575] transition-colors text-left"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("returns")}
                    className="hover:text-[#C5A575] transition-colors text-left"
                  >
                    Returns & Exchanges
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("faqs")}
                    className="hover:text-[#C5A575] transition-colors text-left"
                  >
                    FAQs
                  </button>
                </li>
              </ul>
            </div>

            {/* ABOUT & FOLLOW US */}
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-4">
                About
              </p>
              <ul className="space-y-2.5 text-xs text-[#FAF7F2]/75 font-light mb-6">
                <li>
                  <button
                    onClick={() => openInfo("story")}
                    className="hover:text-[#C5A575] transition-colors text-left"
                  >
                    Our Story
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfo("craftsmanship")}
                    className="hover:text-[#C5A575] transition-colors text-left"
                  >
                    Craftsmanship
                  </button>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-[#C5A575] transition-colors">
                    Journal & Drapes
                  </Link>
                </li>
              </ul>

              <p className="text-xs uppercase tracking-[0.2em] text-[#C5A575] font-semibold mb-3">
                Follow Us
              </p>
              <div className="flex items-center gap-4 text-[#FAF7F2]/80">
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#C5A575]" aria-label="Instagram">
                  <InstagramIcon size={18} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#C5A575] text-xs font-semibold" aria-label="Facebook">
                  FB
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="hover:text-[#C5A575] text-xs font-semibold" aria-label="Pinterest">
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
