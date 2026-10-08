"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Share2,
  ArrowRight,
} from "lucide-react";
import { Product, PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ecommerce/ProductCard";

interface ProductDetailViewProps {
  product: Product;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
}) => {
  const router = useRouter();
  const {
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    setIsCartOpen,
    showToast,
  } = useStore();

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

  const optionsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [optionsPassed, setOptionsPassed] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    let cachedCtaHeight = ctaRef.current?.offsetHeight || 52;

    const measureCtaHeight = () => {
      if (ctaRef.current) {
        cachedCtaHeight = ctaRef.current.offsetHeight;
      }
    };

    const updateStickyState = () => {
      if (!optionsRef.current) return;
      const rect = optionsRef.current.getBoundingClientRect();
      // Pinned when options have scrolled above the sticky CTA's docked position (bottom: 54px)
      const threshold = window.innerHeight - 54 - cachedCtaHeight;
      const passed = rect.bottom <= threshold;
      setOptionsPassed((prev) => (prev !== passed ? passed : prev));
      rafId = null;
    };

    const onScrollOrResize = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateStickyState);
      }
    };

    const onResize = () => {
      measureCtaHeight();
      onScrollOrResize();
    };

    measureCtaHeight();
    updateStickyState();

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
    <div className="min-h-screen bg-[#FAF7F2] pb-24 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <div className="hidden sm:block bg-[#F4EFE6] border-b border-[#E8E2D9] py-0.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-[11px] sm:text-xs text-neutral-600 flex items-center gap-1.5 font-sans overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-black">Shop</Link>
            <span>/</span>
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium truncate max-w-xs">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-1 sm:gap-6 lg:gap-12">
          
          {/* Left Column: Vertical Thumbnails + Main Photo */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row gap-1.5 sm:gap-4 items-center sm:items-start w-full">
            
            {/* Desktop Vertical Thumbnail Strip */}
            <div className="hidden sm:flex sm:flex-col gap-3 overflow-y-auto shrink-0 w-20">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative w-20 aspect-[3/4] rounded-xs overflow-hidden border-2 transition-all shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                    activeImageIdx === idx
                      ? "border-[#541920] ring-1 ring-[#541920]"
                      : "border-[#E8E2D9] opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`View image ${idx + 1} of ${product.images.length} for ${product.name}`}
                  aria-pressed={activeImageIdx === idx}
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
            <div className="relative aspect-[3/4] w-full max-w-[220px] sm:max-w-none flex-1 rounded-sm overflow-hidden bg-neutral-100 shadow-md border border-[#E8E2D9]">
              <Image
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover object-top transition-all duration-300"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-2.5 left-2.5 bg-[#15803D] text-white text-xs font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-xs">
                  {product.discountPercent}% OFF
                </div>
              )}
              {product.id === "pal-010" && activeImageIdx === 1 && (
                <div className="absolute bottom-2 left-2 right-auto sm:inset-x-3 bg-black/85 backdrop-blur-xs text-white text-[10px] sm:text-[11px] px-2 py-1 sm:py-1.5 rounded-xs text-center font-sans tracking-wide z-10 max-w-[155px] sm:max-w-none">
                  Styling Reference: Shown styled with Wine Tissue Silk Saree
                </div>
              )}

              {/* Mobile Floating Thumbnail Switcher */}
              <div className="absolute bottom-2 right-2 z-20 flex sm:hidden gap-1.5 bg-black/40 backdrop-blur-xs p-1 rounded-xs">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-11 h-11 rounded-xs overflow-hidden border-2 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                      activeImageIdx === idx
                        ? "border-white ring-1 ring-white"
                        : "border-white/50 opacity-75 hover:opacity-100"
                    }`}
                    aria-label={`View image ${idx + 1} of ${product.images.length} for ${product.name}`}
                    aria-pressed={activeImageIdx === idx}
                  >
                    <Image
                      src={img}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="lg:col-span-5 space-y-1 sm:space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
                  {product.tags?.includes("blouse")
                    ? "Designer Blouse Piece"
                    : product.tags?.includes("jewelry")
                    ? "Heritage Jewellery"
                    : `${product.category} ${product.hasBlousePiece ? "Sarees" : "Collection"}`}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-[#C5A575]">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold text-neutral-900 ml-1">{product.rating}</span>
                    <span className="text-[11px] text-neutral-600 font-sans ml-0.5">
                      ({product.reviewsCount || 120})
                    </span>
                  </div>
                  <button
                    onClick={handleShare}
                    className="text-neutral-700 hover:text-black p-1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none cursor-pointer -my-2 sm:my-0"
                    title="Share product link"
                    aria-label="Share product link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h1 className="text-base sm:text-3xl font-serif font-medium text-neutral-900 mt-0 sm:mt-1 leading-tight sm:leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price & Quantity Stepper */}
            <div className="pt-0.5 sm:pt-1.5 border-t border-[#E8E2D9] flex items-center justify-between gap-1 sm:gap-2 tabular-nums">
              <div className="flex items-baseline gap-1 sm:gap-3 shrink-0 tabular-nums">
                <span className="text-xl sm:text-3xl font-serif font-bold text-[#541920] tabular-nums">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs sm:text-base text-neutral-600 line-through tabular-nums">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.discountPercent > 0 && (
                  <span className="text-[11px] sm:text-xs font-bold text-[#15803D] tabular-nums">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#DCD5C9] rounded-xs bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="min-w-[32px] px-1 text-center text-xs font-semibold text-neutral-900 select-none tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Variant Options Container (Color & Blouse) */}
            <div ref={optionsRef} className="space-y-0.5 sm:space-y-1">
              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-0.5">
                  <span className="text-xs font-semibold text-neutral-800 shrink-0">
                    Color: <span className="font-normal text-neutral-600">{selectedColor}</span>
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {product.colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none -my-1 sm:my-0 shrink-0"
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full transition-all border-2 block ${
                            selectedColor === c.name
                              ? "border-[#541920] ring-2 ring-[#541920]/30 scale-110"
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Blouse Option */}
              {product.hasBlousePiece && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs font-semibold text-neutral-800 shrink-0">
                    Blouse:
                  </span>
                  <div className="flex gap-2">
                    {["With Blouse", "Without Blouse"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setBlouseOption(opt)}
                        className={`min-h-[44px] px-2.5 sm:px-4 py-2 text-xs rounded-xs border transition-all font-medium focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none cursor-pointer ${
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
              )}
            </div>

            {/* Action Buttons: ADD TO BAG & BUY NOW & WISHLIST */}
            <div
              ref={ctaRef}
              className={`flex items-center gap-2 pt-0.5 sm:pt-1 z-30 sm:static ${
                optionsPassed
                  ? "sticky bottom-[54px] bg-[#FAF7F2]/95 backdrop-blur-xs py-1 border-t border-[#1C1A18]/6 shadow-xs -mx-4 px-4"
                  : "static bg-transparent py-0 border-0 shadow-none mx-0 px-0"
              } sm:bg-transparent sm:backdrop-blur-none sm:py-0 sm:border-0 sm:shadow-none sm:mx-0 sm:px-0`}
            >
              <button
                onClick={handleAddToCart}
                className="flex-1 min-h-[44px] py-2.5 sm:py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider sm:tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="flex-1 min-h-[44px] py-2.5 sm:py-3 bg-white border border-[#541920] hover:bg-[#FAF7F2] text-[#541920] text-xs uppercase tracking-wider sm:tracking-widest font-semibold rounded-xs transition-colors text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              >
                Buy Now
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`w-11 h-11 min-w-[44px] min-h-[44px] border rounded-xs transition-colors flex items-center justify-center cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                  isFav
                    ? "border-[#541920] bg-[#541920]/10 text-[#541920]"
                    : "border-[#DCD5C9] bg-white text-neutral-600 hover:text-black"
                }`}
                title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                aria-label={isFav ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`w-4 h-4 ${isFav ? "fill-[#541920]" : ""}`} />
              </button>
            </div>

            {/* Product Details Table */}
            <div className="pt-4 border-t border-[#E8E2D9] space-y-2">
              <h2 className="font-serif text-sm font-semibold text-neutral-900">
                Product Details
              </h2>
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
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => toggleAccordion("description")}
                  className="w-full min-h-[44px] flex items-center justify-between font-semibold text-neutral-900 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                >
                  <span>Description</span>
                  {openAccordions.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.description && (
                  <p className="pb-3 text-neutral-600 leading-relaxed font-sans">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Shipping & Delivery */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full min-h-[44px] flex items-center justify-between font-semibold text-neutral-900 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                >
                  <span>Shipping & Delivery</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.shipping && (
                  <p className="pb-3 text-neutral-600 leading-relaxed font-sans">
                    Free express shipping on all orders above ₹1,999. Dispatches within 24-48 hours. Delivered safely in a tamper-proof luxury keepsake box.
                  </p>
                )}
              </div>

              {/* Returns */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => toggleAccordion("returns")}
                  className="w-full min-h-[44px] flex items-center justify-between font-semibold text-neutral-900 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                >
                  <span>Returns</span>
                  {openAccordions.returns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.returns && (
                  <p className="pb-3 text-neutral-600 leading-relaxed font-sans">
                    7-day hassle-free return and exchange policy. Doorstep reverse pickup available across India.
                  </p>
                )}
              </div>

              {/* Care Guide */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => toggleAccordion("care")}
                  className="w-full min-h-[44px] flex items-center justify-between font-semibold text-neutral-900 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
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
        <div className="mt-6 pt-6 sm:mt-16 sm:pt-12 border-t border-[#E8E2D9]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-neutral-900">
              You May Also Like
            </h2>
            <Link
              href="/shop"
              className="min-h-[44px] min-w-[44px] px-2 -mr-2 inline-flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-[#541920] font-semibold hover:underline focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
};
