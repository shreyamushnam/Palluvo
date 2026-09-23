"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Heart, Eye, ShoppingBag, Check } from "lucide-react";
import { PRODUCTS, CATEGORIES, Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";

export const ShopSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [addedId, setAddedId] = useState<string | null>(null);

  const {
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setQuickViewProduct,
  } = useStore();

  const filteredProducts =
    selectedCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section id="shop-section" className="py-24 md:py-36 bg-[#F5EFEB] relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 md:mb-16">
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#541920] font-semibold">
            Product Discovery
          </span>
          <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light mt-2 mb-4">
            Find your drape.
          </h2>
          <p className="text-sm text-[#5E5A54] font-light leading-relaxed">
            Curated weaves crafted from pure Mulberry silks, raw tussar, and fine metallic tissues. Each yardage is woven with quiet, unpretentious elegance.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 sm:gap-3 pb-4 mb-12 sm:mb-16">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all duration-300 font-medium ${
                  isActive
                    ? "bg-[#1C1A18] text-[#FAF7F2] shadow-sm"
                    : "bg-transparent text-[#5E5A54] hover:text-[#1C1A18] hover:bg-[#FAF7F2]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 sm:gap-y-16">
          {filteredProducts.map((product) => {
            const isWish = isInWishlist(product.id);
            const isJustAdded = addedId === product.id;

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between"
              >
                {/* Product Card Image Container */}
                <div
                  className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF7F2] cursor-pointer"
                  onClick={() => setQuickViewProduct(product)}
                >
                  {/* Primary Image */}
                  <Image
                    src={product.primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover object-top transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Hover Image */}
                  <Image
                    src={product.hoverImage}
                    alt={`${product.name} alternate angle`}
                    fill
                    className="object-cover object-top transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Corner Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isNewArrival && (
                      <span className="px-2 py-0.5 bg-[#FAF7F2]/90 text-[#1C1A18] text-[9px] uppercase tracking-widest font-semibold backdrop-blur-sm">
                        New Edition
                      </span>
                    )}
                    {product.isBestseller && (
                      <span className="px-2 py-0.5 bg-[#541920] text-[#FAF7F2] text-[9px] uppercase tracking-widest font-semibold">
                        Collector&apos;s Pick
                      </span>
                    )}
                  </div>

                  {/* Wishlist Button (Always accessible) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
                      isWish
                        ? "bg-[#541920] text-[#FAF7F2]"
                        : "bg-[#FAF7F2]/80 text-[#1C1A18] hover:text-[#541920] hover:bg-white"
                    }`}
                    aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      size={15}
                      strokeWidth={1.8}
                      className={isWish ? "fill-current" : ""}
                    />
                  </button>

                  {/* Quick Action Overlay on Desktop Hover */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#1C1A18]/80 via-[#1C1A18]/30 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickViewProduct(product);
                      }}
                      className="flex-1 py-2 bg-[#FAF7F2] text-[#1C1A18] hover:bg-white text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye size={12} />
                      <span>Quick View</span>
                    </button>
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`px-3 py-2 text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1 transition-colors ${
                        isJustAdded
                          ? "bg-[#BF6A54] text-white"
                          : "bg-[#541920] hover:bg-[#3B0E14] text-[#FAF7F2]"
                      }`}
                    >
                      {isJustAdded ? <Check size={12} /> : <ShoppingBag size={12} />}
                      <span>{isJustAdded ? "Added" : "Add"}</span>
                    </button>
                  </div>
                </div>

                {/* Minimal Editorial Product Details */}
                <div className="pt-4 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      onClick={() => setQuickViewProduct(product)}
                      className="font-serif-display text-lg text-[#1C1A18] group-hover:text-[#541920] transition-colors cursor-pointer font-medium"
                    >
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-[#8A857E] mt-1 font-light tracking-wide truncate">
                    {product.fabric}
                  </p>

                  <div className="mt-2.5 flex items-baseline justify-between pt-2 border-t border-[#1C1A18]/5">
                    <span className="text-xs uppercase tracking-widest text-[#5E5A54] font-medium">
                      {product.colorName}
                    </span>
                    <span className="font-serif-display text-base text-[#1C1A18] font-medium tracking-wide">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
