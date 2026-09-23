"use client";

import React from "react";
import { Award, Users, ShieldCheck, Truck } from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: Award,
    title: "Silk Mark Certified",
    description: "Every silk saree bears government-authorized Silk Mark certification guaranteeing 100% pure silk warp and weft.",
  },
  {
    icon: Users,
    title: "Direct From Weavers",
    description: "Ethically sourced directly from 350+ master weaver families across Varanasi, Kanchipuram, and Bengal.",
  },
  {
    icon: Truck,
    title: "Free Express Shipping",
    description: "Complimentary insured delivery across all Indian pin codes for orders over ₹1,999 with tamper-proof packaging.",
  },
  {
    icon: ShieldCheck,
    title: "7-Day Easy Returns",
    description: "Complete peace of mind with doorstep reverse pickup, full refunds, and real-time order tracking.",
  },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#F4EFE6] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
            The PALLUVO Promise
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900 mt-1">
            Why Discerning Drape Lovers Choose Us
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-[#FAF7F2] p-6 rounded-sm border border-[#E8E2D9] text-center space-y-3 hover:border-[#541920] transition-colors"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-[#541920]/10 flex items-center justify-center text-[#541920]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-base font-medium text-neutral-900">
                  {pillar.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
