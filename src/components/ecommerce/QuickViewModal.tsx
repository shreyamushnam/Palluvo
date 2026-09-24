"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, Heart, ShoppingBag, ShieldCheck, Truck, RotateCcw, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    setIsCartOpen,
  } = useStore();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [blouseOption, setBlouseOption] = useState<string>("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIdx(0);
      setSelectedColor(quickViewProduct.colors[0]?.name || "");
      setBlouseOption(quickViewProduct.blouseOptions?.[0] || "Unstitched (Included)");
      setQuantity(1);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const isFav = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, selectedColor, blouseOption);
    setQuickViewProduct(null);
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-md shadow-2xl overflow-hidden border border-[#E5DFD5] animate-in fade-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={() => setQuickViewProduct(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white text-neutral-600 hover:text-black rounded-full shadow-sm transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Gallery Column */}
            <div className="p-6 bg-[#F4EFE6] flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#E8E2D9]">
              <div className="relative w-full max-w-sm aspect-[3/4] rounded-sm overflow-hidden bg-neutral-200 shadow-sm">
                <Image
                  src={quickViewProduct.images[activeImageIdx] || quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover object-top"
                  priority
                />
                {quickViewProduct.discountPercent && (
                  <span className="absolute top-3 left-3 bg-[#15803D] text-white text-[11px] font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider">
                    {quickViewProduct.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {quickViewProduct.images.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto max-w-full pb-1">
                  {quickViewProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`relative w-14 h-18 rounded-xs overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIdx === idx ? "border-[#541920] ring-1 ring-[#541920]" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
                      {quickViewProduct.category}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="text-xs text-neutral-500">{quickViewProduct.fabric}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-serif font-medium text-neutral-900 mt-1">
                    {quickViewProduct.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 bg-[#15803D] text-white px-1.5 py-0.5 rounded-xs text-xs font-bold">
                      <span>{quickViewProduct.rating}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                    <span className="text-xs text-neutral-500">
                      ({quickViewProduct.reviewsCount || quickViewProduct.reviewCount || 120} verified reviews)
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 pt-1 border-t border-[#E8E2D9]">
                  <span className="text-2xl font-serif font-bold text-[#541920]">
                    {formatPrice(quickViewProduct.price)}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(quickViewProduct.originalPrice)}
                    </span>
                  )}
                  {quickViewProduct.discountPercent && (
                    <span className="text-xs font-bold text-[#15803D]">
                      Save {formatPrice(quickViewProduct.originalPrice! - quickViewProduct.price)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed font-sans line-clamp-3">
                  {quickViewProduct.description}
                </p>

                {/* Color Selection */}
                {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                      Color: <span className="font-normal text-neutral-900">{selectedColor}</span>
                    </label>
                    <div className="flex gap-2">
                      {quickViewProduct.colors.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setSelectedColor(color.name)}
                          className={`px-3 py-1.5 text-xs rounded-xs border transition-colors ${
                            selectedColor === color.name
                              ? "border-[#541920] bg-[#541920] text-white font-medium"
                              : "border-[#DCD5C9] bg-white text-neutral-800 hover:border-neutral-400"
                          }`}
                        >
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blouse Option */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Blouse Option:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(quickViewProduct.blouseOptions || ["Unstitched (Included)", "Custom Stitched (+₹1,499)"]).map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => setBlouseOption(opt)}
                        className={`p-2 text-xs text-left rounded-xs border transition-colors flex items-center justify-between ${
                          blouseOption === opt
                            ? "border-[#541920] bg-white ring-1 ring-[#541920] text-neutral-900"
                            : "border-[#DCD5C9] bg-white/70 text-neutral-600 hover:border-neutral-400"
                        }`}
                      >
                        <span className="font-medium text-[11px]">{opt}</span>
                        {blouseOption === opt && <Check className="w-3.5 h-3.5 text-[#541920]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                    Quantity:
                  </label>
                  <div className="flex items-center w-28 border border-[#DCD5C9] rounded-xs bg-white">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-6 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-sm transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className={`p-3 border rounded-xs transition-colors ${
                      isFav
                        ? "border-[#541920] bg-[#541920]/10 text-[#541920]"
                        : "border-[#DCD5C9] bg-white text-neutral-600 hover:text-black"
                    }`}
                    title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-[#541920]" : ""}`} />
                  </button>
                </div>

                <Link
                  href={`/product/${quickViewProduct.id}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="block text-center text-xs font-medium text-neutral-600 hover:text-[#541920] underline tracking-wider uppercase"
                >
                  View Full Product Details & Saree Specs →
                </Link>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E8E2D9] text-[11px] text-neutral-600 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-[#541920]" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                    <span>Silk Mark Certified</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-4 h-4 text-[#C5A575]" />
                    <span>7-Day Return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
