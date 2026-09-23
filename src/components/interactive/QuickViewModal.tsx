"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Heart, ShoppingBag, Check, ShieldCheck, MapPin, Sparkles } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    formatPrice,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useStore();

  const [activeImage, setActiveImage] = useState<"primary" | "hover">("primary");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!quickViewProduct) return null;

  const isWish = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#1C1A18]/80 backdrop-blur-md p-4 sm:p-6 md:p-10 flex items-center justify-center animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FAF7F2] shadow-2xl border border-[#C5A575]/40 overflow-hidden text-left my-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-[#FAF7F2]/80 hover:bg-[#1C1A18] hover:text-[#FAF7F2] text-[#1C1A18] transition-colors"
          aria-label="Close product view"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto md:max-h-none">
          
          {/* Left: Product Images (6 cols) */}
          <div className="md:col-span-6 bg-[#F5EFEB] p-6 sm:p-8 flex flex-col justify-between">
            <div className="relative aspect-[3/4] w-full overflow-hidden shadow-lg bg-[#FAF7F2]">
              <Image
                src={
                  activeImage === "primary"
                    ? quickViewProduct.primaryImage
                    : quickViewProduct.hoverImage
                }
                alt={quickViewProduct.name}
                fill
                className="object-cover object-top transition-all duration-500"
              />
            </div>

            {/* Thumbnail switcher */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setActiveImage("primary")}
                className={`relative w-16 aspect-[3/4] overflow-hidden border-2 transition-all ${
                  activeImage === "primary"
                    ? "border-[#541920]"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={quickViewProduct.primaryImage}
                  alt="Front Angle"
                  fill
                  className="object-cover"
                />
              </button>
              <button
                onClick={() => setActiveImage("hover")}
                className={`relative w-16 aspect-[3/4] overflow-hidden border-2 transition-all ${
                  activeImage === "hover"
                    ? "border-[#541920]"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={quickViewProduct.hoverImage}
                  alt="Drape Details"
                  fill
                  className="object-cover"
                />
              </button>
            </div>
          </div>

          {/* Right: Product Specifications & Add to Bag (6 cols) */}
          <div className="md:col-span-6 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Category & Origin */}
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#8A857E] mb-2">
                <span className="text-[#541920] font-semibold">
                  {quickViewProduct.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {quickViewProduct.origin}
                </span>
              </div>

              {/* Title & Price */}
              <h3 className="font-serif-display text-2xl sm:text-3xl text-[#1C1A18] leading-tight">
                {quickViewProduct.name}
              </h3>
              <p className="font-serif-display text-2xl text-[#541920] mt-2 font-medium">
                {formatPrice(quickViewProduct.price)}
              </p>

              {/* Fabric Specs */}
              <div className="mt-4 p-3.5 bg-[#F5EFEB] border-l-2 border-[#C5A575] space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-[#1C1A18] font-semibold">
                  Textile Composition
                </p>
                <p className="text-xs text-[#5E5A54] font-light">
                  {quickViewProduct.fabric}
                </p>
                <p className="text-[11px] text-[#8A857E]">
                  Color: <strong>{quickViewProduct.colorName}</strong>
                </p>
              </div>

              {/* Weave & Drape Notes */}
              <div className="mt-4 space-y-3 text-xs text-[#5E5A54] leading-relaxed font-light">
                <p>
                  <strong className="text-[#1C1A18] font-normal">Description: </strong>
                  {quickViewProduct.description}
                </p>
                <p>
                  <strong className="text-[#1C1A18] font-normal">Weaving Heritage: </strong>
                  {quickViewProduct.weaveDetail}
                </p>
                <p className="flex items-start gap-1.5 text-[#541920]">
                  <Sparkles size={14} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>Drape Recommendation: </strong>
                    {quickViewProduct.drapeRecommendation}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions: Quantity + Add to Bag + Wishlist */}
            <div className="mt-8 pt-6 border-t border-[#1C1A18]/10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#1C1A18]/20 bg-[#FAF7F2]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-xs hover:text-[#541920]"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-medium text-[#1C1A18]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-xs hover:text-[#541920]"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isAdded}
                  className={`flex-1 py-3 text-xs uppercase tracking-[0.2em] font-medium transition-colors flex items-center justify-center gap-2 ${
                    isAdded
                      ? "bg-[#BF6A54] text-white"
                      : "bg-[#1C1A18] hover:bg-[#541920] text-[#FAF7F2]"
                  }`}
                >
                  {isAdded ? <Check size={14} /> : <ShoppingBag size={14} />}
                  <span>{isAdded ? "Added to Bag" : "Add to Bag"}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-3 border transition-colors ${
                    isWish
                      ? "bg-[#541920] text-[#FAF7F2] border-[#541920]"
                      : "border-[#1C1A18]/20 text-[#1C1A18] hover:text-[#541920]"
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <Heart size={16} className={isWish ? "fill-current" : ""} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-between text-[10px] text-[#8A857E] pt-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#C5A575]" /> Silk Mark Certified
                </span>
                <span>Includes 0.8m Blouse Fabric</span>
                <span>Complimentary Delivery</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
