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
  Truck,
  RotateCcw,
  Check,
  ChevronRight,
  Share2,
  MapPin,
  Clock,
  Sparkles,
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
  const [blouseOption, setBlouseOption] = useState(product.blouseOptions?.[0] || "Unstitched (Included)");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "care" | "shipping">("specs");

  const isFav = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, blouseOption);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor, blouseOption);
    router.push("/checkout");
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim() || pincode.length < 6) {
      setPincodeStatus("Please enter a valid 6-digit PIN code.");
      return;
    }
    setPincodeStatus(`Available! Free Express delivery to ${pincode} by 28 Sep.`);
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard!");
    }
  };

  // Related products from same category or random
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
          
          {/* Left Column: Multi-Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden bg-neutral-100 shadow-md border border-[#E8E2D9]">
              <Image
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover object-top transition-all duration-300"
              />
              {product.discountPercent && (
                <div className="absolute top-4 left-4 bg-[#15803D] text-white text-xs font-bold px-2.5 py-1 rounded-xs uppercase tracking-wider shadow-xs">
                  {product.discountPercent}% OFF
                </div>
              )}
              {product.isSilkMark && (
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#DCD5C9] text-[10px] font-bold text-[#541920] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Silk Mark Pure</span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-26 rounded-xs overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx
                        ? "border-[#541920] ring-2 ring-[#541920]/20"
                        : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} angle ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
                  {product.category} • {product.fabric}
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
              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center gap-1 bg-[#15803D] text-white px-2 py-0.5 rounded-xs text-xs font-bold">
                  <span>{product.rating}</span>
                  <Star className="w-3 h-3 fill-current" />
                </div>
                <span className="text-xs text-neutral-600 font-sans">
                  {product.reviewsCount || product.reviewCount || 140} Verified Customer Ratings
                </span>
              </div>
            </div>

            {/* Price block */}
            <div className="pt-2 border-t border-[#E8E2D9]">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-serif font-bold text-[#541920]">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-neutral-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.discountPercent && (
                  <span className="text-xs font-bold text-[#15803D] bg-green-50 px-2 py-0.5 rounded-xs border border-green-200">
                    Save {formatPrice(product.originalPrice! - product.price)} ({product.discountPercent}%)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">
                Inclusive of all taxes. Free Express Shipping on this order.
              </p>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  Color: <strong className="text-neutral-900">{selectedColor}</strong>
                </label>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`px-4 py-2 text-xs rounded-xs border transition-colors ${
                        selectedColor === c.name
                          ? "border-[#541920] bg-[#541920] text-white font-medium shadow-xs"
                          : "border-[#DCD5C9] bg-white text-neutral-800 hover:border-neutral-400"
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Blouse Option */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                Blouse Piece Option:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(product.blouseOptions || ["Unstitched (Included)", "Custom Stitched (+₹1,499)"]).map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => setBlouseOption(opt)}
                    className={`p-3 text-xs text-left rounded-xs border transition-all flex items-center justify-between ${
                      blouseOption === opt
                        ? "border-[#541920] bg-white ring-1 ring-[#541920] text-neutral-900 shadow-xs"
                        : "border-[#DCD5C9] bg-white/70 text-neutral-600 hover:border-neutral-400"
                    }`}
                  >
                    <span className="font-medium text-xs">{opt}</span>
                    {blouseOption === opt && <Check className="w-4 h-4 text-[#541920]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                Quantity:
              </label>
              <div className="flex items-center w-32 border border-[#DCD5C9] rounded-xs bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  -
                </button>
                <span className="flex-1 text-center text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs: Add to Bag & Buy Now */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3.5 border rounded-xs transition-colors ${
                    isFav
                      ? "border-[#541920] bg-[#541920]/10 text-[#541920]"
                      : "border-[#DCD5C9] bg-white text-neutral-600 hover:text-black"
                  }`}
                  title={isFav ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isFav ? "fill-[#541920]" : ""}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-neutral-900 hover:bg-black text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors"
              >
                Buy Now — Instant Checkout
              </button>
            </div>

            {/* Pincode Availability Checker */}
            <div className="p-4 bg-[#F4EFE6] rounded-xs border border-[#E8E2D9] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                <MapPin className="w-3.5 h-3.5 text-[#541920]" />
                <span>Check Delivery & Cash on Delivery Availability</span>
              </div>
              <form onSubmit={handleCheckPincode} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit PIN code"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-xs hover:bg-black uppercase"
                >
                  Check
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-xs text-[#15803D] font-medium pt-1">{pincodeStatus}</p>
              )}
            </div>

            {/* Specification Tabs */}
            <div className="pt-4 border-t border-[#E8E2D9]">
              <div className="flex border-b border-[#E8E2D9] text-xs font-semibold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-2 mr-6 transition-colors border-b-2 ${
                    activeTab === "specs"
                      ? "border-[#541920] text-[#541920]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Product Details
                </button>
                <button
                  onClick={() => setActiveTab("care")}
                  className={`pb-2 mr-6 transition-colors border-b-2 ${
                    activeTab === "care"
                      ? "border-[#541920] text-[#541920]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Wash & Care
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-2 transition-colors border-b-2 ${
                    activeTab === "shipping"
                      ? "border-[#541920] text-[#541920]"
                      : "border-transparent text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  Shipping & Returns
                </button>
              </div>

              <div className="py-4 text-xs text-neutral-700 leading-relaxed font-sans space-y-2">
                {activeTab === "specs" && (
                  <div className="space-y-2">
                    <p>{product.description}</p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-[#E8E2D9]">
                      <div>
                        <span className="text-neutral-400">Saree Length:</span>{" "}
                        <strong className="text-neutral-800">{product.details?.length || product.length || "5.5 meters"}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400">Blouse Length:</span>{" "}
                        <strong className="text-neutral-800">{product.details?.blousePiece || product.blouseLength || "0.8 meters (Unstitched)"}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400">Weave Origin:</span>{" "}
                        <strong className="text-neutral-800">{product.origin || "Varanasi, India"}</strong>
                      </div>
                      <div>
                        <span className="text-neutral-400">Zari Material:</span>{" "}
                        <strong className="text-neutral-800">{product.details?.work || product.zari || "Tested Silver/Gold Zari"}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "care" && (
                  <div className="space-y-1.5">
                    <p>• <strong>Care Instructions:</strong> {product.details?.careInstructions || product.careInstructions || "Strictly dry clean only to maintain silk sheen and zari luster."}</p>
                    <p>• Store folded inside a breathable pure cotton or muslin bag.</p>
                    <p>• Avoid spraying perfume directly onto the saree or zari borders.</p>
                    <p>• Iron on low temperature on the reverse side using a protective cotton cloth.</p>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-1.5">
                    <p>• <strong>Express Delivery:</strong> Dispatches within 24-48 hours. Delivered in 3-5 business days.</p>
                    <p>• <strong>Returns:</strong> 7-day hassle-free return or exchange from the date of delivery.</p>
                    <p>• <strong>COD Available:</strong> Cash on delivery available on orders up to ₹25,000.</p>
                    <p>• <strong>Tamper-Proof Luxury Box:</strong> Delivered in protective keepsake packaging.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* You May Also Love (Related Sarees) */}
        <div className="mt-16 pt-12 border-t border-[#E8E2D9]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
                Curated Recommendations
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 mt-1">
                You May Also Love
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs uppercase tracking-widest text-[#541920] font-semibold hover:underline"
            >
              View All →
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
