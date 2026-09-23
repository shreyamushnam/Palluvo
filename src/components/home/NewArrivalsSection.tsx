"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ecommerce/ProductCard";

const TABS = ["All", "Pure Silk", "Handloom", "Organza"];

export const NewArrivalsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState("All");

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeTab === "All") return true;
    if (activeTab === "Pure Silk") return p.category.toLowerCase().includes("silk") || p.fabric.toLowerCase().includes("silk");
    if (activeTab === "Handloom") return p.category.toLowerCase().includes("handloom") || p.fabric.toLowerCase().includes("handloom") || (p.tags?.includes("handloom") ?? false);
    if (activeTab === "Organza") return p.fabric.toLowerCase().includes("organza");
    return true;
  }).slice(0, 8);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#541920] font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
              <span>Fresh Off The Loom</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900">
              New Arrivals
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#541920] text-white shadow-xs"
                    : "bg-[#F4EFE6] text-neutral-700 hover:bg-[#EFEAE1] border border-[#E8E2D9]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white hover:bg-[#541920] text-neutral-900 hover:text-white border border-[#DCD5C9] hover:border-[#541920] text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-all duration-200"
          >
            <span>View All New Arrivals</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
