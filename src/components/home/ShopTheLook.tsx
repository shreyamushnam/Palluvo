"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS, SHOP_THE_LOOK_ITEMS } from "@/data/products";

export const ShopTheLook: React.FC = () => {
  const { addToCart, setIsCartOpen, formatPrice, showToast } = useStore();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});

  const handleAddSingleItem = (item: typeof SHOP_THE_LOOK_ITEMS[0]) => {
    if (item.productId) {
      const prod = PRODUCTS.find((p) => p.id === item.productId) || PRODUCTS[0];
      addToCart(prod, 1, prod.colors?.[0]?.name || "Default", prod.hasBlousePiece ? "With Blouse" : "Standard");
    } else {
      showToast(`Added ${item.title || item.name} to bag!`);
    }
    setAddedItems((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [item.id]: false }));
    }, 2000);
    setIsCartOpen(true);
  };

  return (
    <section className="py-10 sm:py-14 bg-[#FAF7F2] border-t border-[#E8E2D9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-normal text-neutral-900 mb-6">
          Shop the Look
        </h2>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-white rounded-sm p-6 sm:p-8 border border-[#E8E2D9] shadow-xs">
          
          {/* Left: Styled Photo */}
          <div className="lg:col-span-6 relative">
            <Link
              href="/product/pal-001"
              className="group relative block aspect-[3/4] rounded-sm overflow-hidden bg-neutral-100 shadow-sm border border-[#E8E2D9] focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              aria-label="View featured Wine Tissue Silk Saree"
            >
              <Image
                src="/images/products/wine-tissue-silk.jpg"
                alt="Shop the look model in Wine Tissue Silk Saree"
                fill
                sizes="(max-width: 1024px) 100vw, 550px"
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="min-h-[44px] px-4 py-2 bg-white/95 text-neutral-900 text-xs uppercase tracking-wider font-semibold rounded-xs shadow-md flex items-center justify-center">
                  View Featured Saree →
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Complete the Look Items */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-serif text-lg font-medium text-neutral-900 border-b border-[#E8E2D9] pb-3">
              Complete the Look
            </h3>

            <div className="space-y-4">
              {SHOP_THE_LOOK_ITEMS.map((item) => {
                const isAdded = addedItems[item.id];
                const itemHref = item.productId ? `/product/${item.productId}` : "/product/pal-001";
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-sm border border-[#E8E2D9] bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Link
                        href={itemHref}
                        className="relative w-14 h-18 shrink-0 rounded-xs overflow-hidden bg-neutral-200 border border-[#DCD5C9] hover:opacity-85 focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                        aria-label={`View ${item.title || item.name}`}
                      >
                        <Image
                          src={item.image}
                          alt={item.title || item.name}
                          fill
                          sizes="60px"
                          className="object-cover object-top"
                        />
                      </Link>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#541920] tracking-wider">
                          {item.role || item.type}
                        </span>
                        <Link
                          href={itemHref}
                          className="block text-xs sm:text-sm font-serif font-medium text-neutral-900 truncate hover:text-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                        >
                          {item.title || item.name}
                        </Link>
                        <p className="text-xs font-bold text-neutral-900 mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSingleItem(item)}
                      className={`min-h-[44px] px-3.5 py-2 text-[10px] uppercase tracking-wider font-semibold rounded-xs shadow-2xs transition-colors shrink-0 flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none cursor-pointer ${
                        isAdded
                          ? "bg-[#15803D] text-white"
                          : "bg-[#541920] hover:bg-[#3D1217] text-white"
                      }`}
                      aria-label={isAdded ? `Added ${item.title || item.name} to bag` : `Add ${item.title || item.name} to bag`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
