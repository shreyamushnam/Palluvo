"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye, Star, Check } from "lucide-react";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist, addToCart, setQuickViewProduct, formatPrice } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div
      className="group relative flex flex-col justify-between bg-[#FAF7F2] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5EFEB]">
        <Link
          href={`/product/${product.id}`}
          className="relative block w-full h-full"
          aria-label={`View ${product.name}`}
        >
          {/* Primary Image */}
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-top transition-all duration-500 ease-out ${
              isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100"
            }`}
          />

          {/* Hover / Secondary Image */}
          <Image
            src={product.hoverImage}
            alt={`${product.name} alternate view`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-top transition-all duration-500 ease-out ${
              isHovered ? "scale-105 opacity-100" : "scale-100 opacity-0"
            }`}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isBestseller && (
            <span className="px-2 py-0.5 bg-[#541920] text-[#FAF7F2] text-[9px] uppercase tracking-wider font-semibold">
              Bestseller
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="px-2 py-0.5 bg-[#15803D] text-[#FAF7F2] text-[9px] uppercase tracking-wider font-semibold">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isSaved
              ? "bg-[#541920] text-[#FAF7F2]"
              : "bg-[#FAF7F2]/80 text-[#1C1A18] hover:text-[#541920] hover:bg-white"
          }`}
          aria-label={isSaved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        >
          <Heart size={15} className={isSaved ? "fill-current" : ""} />
        </button>

        {/* Quick View Button (Desktop Hover) */}
        <div className="absolute inset-x-2 bottom-2 z-10 hidden sm:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handleQuickView}
            className="flex-1 py-2.5 bg-[#FAF7F2]/95 hover:bg-white text-[#1C1A18] text-[11px] uppercase tracking-wider font-semibold shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye size={13} /> Quick View
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="pt-3.5 pb-2 flex flex-col flex-1 justify-between">
        <div>
          {/* Ratings & Reviews */}
          <div className="flex items-center gap-1.5 text-xs mb-1">
            <div className="flex items-center text-[#C5A575]">
              <Star size={12} className="fill-current" />
              <span className="text-[11px] font-semibold text-[#1C1A18] ml-0.5">{product.rating}</span>
            </div>
            <span className="text-[10px] text-[#8A857E]">({product.reviewsCount})</span>
          </div>

          {/* Product Name */}
          <Link href={`/product/${product.id}`} className="group-hover:text-[#541920] transition-colors">
            <h3 className="font-serif-display text-sm sm:text-base font-medium text-[#1C1A18] leading-snug line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Fabric / Type */}
          <p className="text-xs text-[#8A857E] mt-0.5 line-clamp-1 font-light">
            {product.fabric}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="mt-2.5 pt-2 border-t border-[#1C1A18]/6 flex flex-col">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-serif-display text-lg font-semibold text-[#1C1A18]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#8A857E] line-through font-light">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="text-[11px] text-[#15803D] font-semibold whitespace-nowrap">
                {product.discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Add to Bag Button */}
          <button
            onClick={handleQuickAdd}
            className={`w-full mt-3 min-h-[44px] py-2.5 text-[11px] uppercase tracking-[0.16em] font-semibold flex items-center justify-center gap-1.5 transition-colors rounded-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none cursor-pointer ${
              justAdded
                ? "bg-[#15803D] text-[#FAF7F2]"
                : "bg-[#541920] hover:bg-[#3D1217] text-white shadow-xs"
            }`}
          >
            {justAdded ? (
              <>
                <Check size={13} /> ADDED
              </>
            ) : (
              <>
                <ShoppingBag size={13} /> ADD TO BAG
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
