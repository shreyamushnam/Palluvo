"use client";

import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ecommerce/ProductCard";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    setIsCartOpen,
    showToast,
  } = useStore();

  const product = PRODUCTS.find((p) => p.id === resolvedParams.id) || PRODUCTS[0];

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || "");
  const [blouseOption, setBlouseOption] = useState<string>("With Blouse");
  const [quantity, setQuantity] = useState(1);
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    shipping: false,
    returns: false,
    care: false,
  });

  const isFav = isInWishlist(product.id);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, blouseOption);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, blouseOption);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard!");
    }
  };

  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Breadcrumb Navigation */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 flex items-center gap-1.5 font-sans overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">Shop Sarees</Link>
            <span>/</span>
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Vertical Thumbnails + Main Photo */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
            
            {/* Vertical Thumbnail Strip */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 w-full sm:w-20">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-16 sm:w-20 aspect-[3/4] rounded-xs overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIdx === idx
                      ? "border-[#541920] ring-1 ring-[#541920]"
                      : "border-[#E8E2D9] opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover object-top"
                  />
                </button>
              ))}
            </div>

            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] flex-1 w-full rounded-sm overflow-hidden bg-neutral-100 shadow-md border border-[#E8E2D9]">
              <Image
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover object-top transition-all duration-300"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-[#15803D] text-white text-xs font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-xs">
                  {product.discountPercent}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
                  {product.category} Sarees
                </span>
                <button
                  onClick={handleShare}
                  className="text-neutral-400 hover:text-black p-1 transition-colors"
                  title="Share product link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 mt-1">
                {product.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-[#C5A575]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-bold text-neutral-900 ml-1">{product.rating}</span>
                </div>
                <span className="text-xs text-neutral-500 font-sans">
                  ({product.reviewsCount || 120} Reviews)
                </span>
              </div>
            </div>

            {/* Price block */}
            <div className="pt-2 border-t border-[#E8E2D9]">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-[#541920]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-base text-neutral-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-xs font-bold text-[#15803D]">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-2">
                  Color: <span className="font-normal text-neutral-600">{selectedColor}</span>
                </label>
                <div className="flex gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full transition-all border-2 ${
                        selectedColor === c.name
                          ? "border-[#541920] ring-2 ring-[#541920]/30 scale-110"
                          : "border-transparent opacity-80 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Blouse Option */}
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-2">
                Select Blouse Option:
              </label>
              <div className="flex gap-3">
                {["With Blouse", "Without Blouse"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setBlouseOption(opt)}
                    className={`px-4 py-2 text-xs rounded-xs border transition-all font-medium ${
                      blouseOption === opt
                        ? "border-[#541920] bg-[#FAF7F2] text-[#541920] ring-1 ring-[#541920]"
                        : "border-[#DCD5C9] bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Heart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#DCD5C9] rounded-xs bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  -
                </button>
                <span className="px-3 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 border rounded-xs transition-colors ${
                  isFav
                    ? "border-[#541920] bg-[#541920]/10 text-[#541920]"
                    : "border-[#DCD5C9] bg-white text-neutral-600 hover:text-black"
                }`}
                title={isFav ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isFav ? "fill-[#541920]" : ""}`} />
              </button>
            </div>

            {/* Action Buttons: ADD TO BAG & BUY NOW */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 bg-white border border-[#541920] hover:bg-[#FAF7F2] text-[#541920] text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors text-center"
              >
                Buy Now
              </button>
            </div>

            {/* Product Details Table */}
            <div className="pt-4 border-t border-[#E8E2D9] space-y-2">
              <h3 className="font-serif text-sm font-semibold text-neutral-900">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-y-1.5 text-xs text-neutral-600 font-sans">
                <div>Fabric: <strong className="text-neutral-900 font-medium">{product.fabric}</strong></div>
                <div>Length: <strong className="text-neutral-900 font-medium">{product.details.length}</strong></div>
                <div>Blouse Piece: <strong className="text-neutral-900 font-medium">{product.details.blousePiece}</strong></div>
                <div>Work: <strong className="text-neutral-900 font-medium">{product.details.work}</strong></div>
                <div>Occasion: <strong className="text-neutral-900 font-medium">{product.details.occasion}</strong></div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#E8E2D9] divide-y divide-[#E8E2D9] text-xs">
              {/* Description */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion("description")}
                  className="w-full flex items-center justify-between font-semibold text-neutral-900 text-left"
                >
                  <span>Description</span>
                  {openAccordions.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.description && (
                  <p className="mt-2 text-neutral-600 leading-relaxed font-sans">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Shipping & Delivery */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex items-center justify-between font-semibold text-neutral-900 text-left"
                >
                  <span>Shipping & Delivery</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.shipping && (
                  <p className="mt-2 text-neutral-600 leading-relaxed font-sans">
                    Free express shipping on all orders above ₹1,999. Dispatches within 24-48 hours. Delivered safely in a tamper-proof luxury keepsake box.
                  </p>
                )}
              </div>

              {/* Returns */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion("returns")}
                  className="w-full flex items-center justify-between font-semibold text-neutral-900 text-left"
                >
                  <span>Returns</span>
                  {openAccordions.returns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.returns && (
                  <p className="mt-2 text-neutral-600 leading-relaxed font-sans">
                    7-day hassle-free return and exchange policy. Doorstep reverse pickup available across India.
                  </p>
                )}
              </div>

              {/* Care Guide */}
              <div className="py-3">
                <button
                  onClick={() => toggleAccordion("care")}
                  className="w-full flex items-center justify-between font-semibold text-neutral-900 text-left"
                >
                  <span>Care Guide</span>
                  {openAccordions.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.care && (
                  <p className="mt-2 text-neutral-600 leading-relaxed font-sans">
                    {product.details.careInstructions} Store folded in breathable pure cotton muslin cloth. Avoid direct perfume spray.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-16 pt-12 border-t border-[#E8E2D9]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-neutral-900">
              You May Also Like
            </h2>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-wider text-[#541920] font-semibold hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
