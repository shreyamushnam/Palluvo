"use client";

import React from "react";
import Image from "next/image";
import { X, Trash2, ShoppingBag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS } from "@/data/products";

export const WishlistDrawer: React.FC = () => {
  const {
    wishlist,
    isWishlistOpen,
    setIsWishlistOpen,
    toggleWishlist,
    addToCart,
    formatPrice,
    setQuickViewProduct,
  } = useStore();

  if (!isWishlistOpen) return null;

  const wishlistProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1C1A18]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#C5A575]/30">
          
          {/* Header */}
          <div className="p-6 border-b border-[#1C1A18]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#541920] font-semibold">
                Personal Sanctuary
              </span>
              <h3 className="font-serif-display text-2xl text-[#1C1A18]">
                Your Wishlist ({wishlistProducts.length})
              </h3>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
              aria-label="Close wishlist"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {wishlistProducts.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <p className="font-serif-display text-2xl text-[#1C1A18]">
                  No drapes saved yet.
                </p>
                <p className="text-xs text-[#8A857E] max-w-xs mx-auto leading-relaxed">
                  Click the heart icon on any saree to curate your personal collection of favorites.
                </p>
                <button
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-[#1C1A18] text-[#FAF7F2] text-xs uppercase tracking-widest hover:bg-[#541920] transition-colors"
                >
                  Browse Catalogue
                </button>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-[#1C1A18]/10">
                {wishlistProducts.map((product) => (
                  <div key={product.id} className="pt-6 first:pt-0 flex gap-4">
                    <div
                      onClick={() => {
                        setIsWishlistOpen(false);
                        setQuickViewProduct(product);
                      }}
                      className="relative w-20 aspect-[3/4] bg-[#F5EFEB] shrink-0 overflow-hidden shadow-sm cursor-pointer group"
                    >
                      <Image
                        src={product.primaryImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4
                            onClick={() => {
                              setIsWishlistOpen(false);
                              setQuickViewProduct(product);
                            }}
                            className="font-serif-display text-base text-[#1C1A18] font-medium leading-snug cursor-pointer hover:text-[#541920]"
                          >
                            {product.name}
                          </h4>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="text-[#8A857E] hover:text-[#541920] transition-colors p-1"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#8A857E] mt-0.5 line-clamp-1">
                          {product.fabric}
                        </p>
                        <p className="text-xs font-serif-display text-[#541920] mt-1 font-medium">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <div className="pt-3">
                        <button
                          onClick={() => {
                            addToCart(product, 1);
                            toggleWishlist(product.id);
                          }}
                          className="w-full py-2 bg-[#1C1A18] hover:bg-[#541920] text-[#FAF7F2] text-[10px] uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShoppingBag size={12} />
                          <span>Move to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="p-4 bg-[#F5EFEB] border-t border-[#1C1A18]/10 text-center">
            <p className="text-[10px] text-[#8A857E] uppercase tracking-wider">
              Saved items are preserved in your private browser drawer
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
