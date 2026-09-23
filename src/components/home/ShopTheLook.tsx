"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Check, ShoppingBag, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS, SHOP_THE_LOOK_ITEMS } from "@/data/products";

export const ShopTheLook: React.FC = () => {
  const { addToCart, setIsCartOpen, formatPrice, showToast } = useStore();
  const [selectedIds, setSelectedIds] = useState<string[]>(SHOP_THE_LOOK_ITEMS.map((item) => item.id));

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedItems = SHOP_THE_LOOK_ITEMS.filter((item) => selectedIds.includes(item.id));
  const bundleTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);

  const handleAddLook = () => {
    // Add primary saree to cart
    const primarySaree = PRODUCTS[0];
    addToCart(primarySaree, 1, "Wine", "Unstitched (Included)");
    showToast(`Added Complete Look (${selectedItems.length} items) to your bag!`);
    setIsCartOpen(true);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#F4EFE6] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#541920] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
            <span>Stylist Curated Ensemble</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-neutral-900">
            Shop The Royal Look
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-sans">
            A bridal celebration drape paired with hand-embellished accessories for effortless elegance.
          </p>
        </div>

        {/* Look Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF7F2] rounded-md p-6 sm:p-8 border border-[#E8E2D9] shadow-sm">
          
          {/* Main Styled Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden shadow-md bg-neutral-200">
              <Image
                src="/images/hero-saree.jpg"
                alt="Styled festive saree ensemble"
                fill
                sizes="(max-width: 1024px) 100vw, 450px"
                className="object-cover object-top"
              />
              <div className="absolute top-3 left-3 bg-[#541920] text-white text-[11px] font-bold px-2.5 py-1 rounded-xs uppercase tracking-widest">
                Stylist Pick
              </div>
            </div>
          </div>

          {/* Bundle Items List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              {SHOP_THE_LOOK_ITEMS.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-center gap-4 p-3 rounded-sm border cursor-pointer transition-all ${
                      isChecked
                        ? "border-[#541920] bg-white shadow-xs"
                        : "border-[#E8E2D9] bg-[#F4EFE6]/50 opacity-70"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded-xs flex items-center justify-center shrink-0 transition-colors ${
                        isChecked ? "bg-[#541920] text-white" : "border border-neutral-400 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>

                    {/* Thumbnail */}
                    <div className="relative w-14 h-18 shrink-0 rounded-xs overflow-hidden bg-neutral-100">
                      <Image
                        src={item.image}
                        alt={item.title || item.name}
                        fill
                        sizes="60px"
                        className="object-cover object-top"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                        {item.role || item.type}
                      </p>
                      <h4 className="text-xs sm:text-sm font-serif font-medium text-neutral-900 truncate">
                        {item.title || item.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#541920] mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total and Action */}
            <div className="p-4 bg-[#F4EFE6] rounded-sm border border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs text-neutral-500">
                  Total for {selectedItems.length} Selected items:
                </p>
                <p className="text-xl font-serif font-bold text-[#541920]">
                  {formatPrice(bundleTotal)}
                </p>
              </div>

              <button
                onClick={handleAddLook}
                className="w-full sm:w-auto px-6 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Complete Look to Bag</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
