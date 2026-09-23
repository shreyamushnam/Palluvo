"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { ProductCard } from "@/components/ecommerce/ProductCard";

export default function WishlistPage() {
  const { wishlist, formatPrice } = useStore();

  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">My Wishlist</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900">
                My Saved Sarees ({wishlistProducts.length})
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans">
                Keep track of your dream weaves and celebratory drapes.
              </p>
            </div>
            {wishlistProducts.length > 0 && (
              <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#541920] font-semibold hover:underline"
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
                Tap the heart icon on any saree to save it to your personal collection.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors shadow-xs"
            >
              Discover Handcrafted Sarees
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
