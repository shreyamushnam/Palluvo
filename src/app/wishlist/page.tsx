"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ecommerce/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useStore();

  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-600 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">My Wishlist</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-normal text-neutral-900 flex flex-wrap items-center gap-2 sm:gap-3">
                <span>My Wishlist</span>
                <span className="text-xs sm:text-sm font-sans font-medium text-neutral-600 bg-white border border-[#DCD5C9] px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {wishlistProducts.length} {wishlistProducts.length === 1 ? "Item" : "Items"}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans">
                Keep track of your favourite handcrafted pieces and celebratory drapes.
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 text-xs uppercase tracking-widest text-[#541920] font-semibold hover:underline rounded-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {wishlistProducts.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-4 bg-white p-8 rounded-sm border border-[#E8E2D9]">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F4EFE6] flex items-center justify-center text-neutral-400">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-neutral-900">Your wishlist is empty</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Tap the heart icon on any product to save it to your personal collection.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
            >
              Discover Handcrafted Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
