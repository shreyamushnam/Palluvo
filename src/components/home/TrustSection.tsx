"use client";

import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, RotateCcw } from "lucide-react";

const TRUST_PILLARS = [
  {
    icon: Sparkles,
    title: "Premium Fabrics",
    description: "Thoughtfully selected textiles",
  },
  {
    icon: CheckCircle2,
    title: "Quality Checked",
    description: "Every piece inspected before dispatch",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Safe and secure checkout",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Simple return experience",
  },
];

export const TrustSection: React.FC = () => {
  return (
    <section className="py-10 sm:py-12 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-serif font-normal text-neutral-900 mb-8 text-center sm:text-left">
          Why PALLUVO
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white p-5 rounded-sm border border-[#E8E2D9] text-left space-y-2 hover:border-[#541920] transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#541920] border border-[#E8E2D9]">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-sm font-semibold text-neutral-900">
                  {pillar.title}
                </h3>
                <p className="text-xs text-neutral-500 font-sans">
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
