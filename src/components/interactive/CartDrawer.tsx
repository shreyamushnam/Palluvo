"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Gift } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    formatPrice,
    clearCart,
  } = useStore();

  const [bespokePackaging, setBespokePackaging] = useState(true);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setTimeout(() => {
      clearCart();
      setCheckoutComplete(false);
      setIsCartOpen(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#1C1A18]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl flex flex-col justify-between border-l border-[#C5A575]/30">
          
          {/* Header */}
          <div className="p-6 border-b border-[#1C1A18]/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#541920] font-semibold">
                Shopping Bag
              </span>
              <h3 className="font-serif-display text-2xl text-[#1C1A18]">
                Your Selection ({cart.length})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#1C1A18] hover:text-[#541920] transition-colors"
              aria-label="Close shopping bag"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {checkoutComplete ? (
              <div className="py-16 text-center space-y-4 animate-in fade-in zoom-in-95">
                <div className="w-14 h-14 rounded-full bg-[#541920] text-[#FAF7F2] flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck size={28} />
                </div>
                <h4 className="font-serif-display text-3xl text-[#1C1A18]">
                  Order Placed with Honor
                </h4>
                <p className="text-xs text-[#5E5A54] max-w-xs mx-auto leading-relaxed">
                  Thank you for welcoming PALLUVO into your wardrobe. Our textile archivist will hand-inspect and wrap your drape in unbleached muslin.
                </p>
                <p className="text-[10px] uppercase tracking-widest text-[#C5A575] font-semibold pt-2">
                  Dispatch Confirmation dispatched to your inbox
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <p className="font-serif-display text-2xl text-[#1C1A18]">
                  Your bag is currently empty.
                </p>
                <p className="text-xs text-[#8A857E] max-w-xs mx-auto leading-relaxed">
                  Discover our curated silk edits and artisanal drapes woven for unforgettable moments.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-[#1C1A18] text-[#FAF7F2] text-xs uppercase tracking-widest hover:bg-[#541920] transition-colors"
                >
                  Explore Weaves
                </button>
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-[#1C1A18]/10">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-6 first:pt-0 flex gap-4">
                    <div className="relative w-20 aspect-[3/4] bg-[#F5EFEB] shrink-0 overflow-hidden shadow-sm">
                      <Image
                        src={item.product.primaryImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-serif-display text-base text-[#1C1A18] font-medium leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-[#8A857E] hover:text-[#541920] transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-[#8A857E] mt-0.5 line-clamp-1">
                          {item.product.fabric}
                        </p>
                        <p className="text-xs font-serif-display text-[#541920] mt-1 font-medium">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-[#1C1A18]/20 bg-[#FAF7F2]">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:text-[#541920] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2.5 text-xs font-medium text-[#1C1A18]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:text-[#541920] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span className="text-xs font-serif-display font-medium text-[#1C1A18]">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Packaging Experience add-on */}
                <div className="pt-6">
                  <div
                    onClick={() => setBespokePackaging(!bespokePackaging)}
                    className="p-3 bg-[#F5EFEB] border border-[#C5A575]/30 flex items-start gap-3 cursor-pointer hover:border-[#C5A575] transition-colors"
                  >
                    <Gift size={16} className="text-[#541920] shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1C1A18]">
                          Complimentary Heirloom Box
                        </span>
                        <span className="text-[10px] text-[#541920] uppercase font-bold">Included</span>
                      </div>
                      <p className="text-[10px] text-[#5E5A54] mt-0.5 font-light">
                        Packed in signature ivory rigid box with acid-free tissue and custom brass pin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Checkout */}
          {cart.length > 0 && !checkoutComplete && (
            <div className="p-6 bg-[#F5EFEB] border-t border-[#1C1A18]/10 space-y-4">
              <div className="space-y-1.5 text-xs text-[#5E5A54]">
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-[#541920] font-medium">Complimentary Worldwide</span>
                </div>
                <div className="flex justify-between">
                  <span>Authenticity Guarantee:</span>
                  <span>Silk Mark Certified</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#1C1A18]/10 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-[#1C1A18] font-semibold">
                  Estimated Total:
                </span>
                <span className="font-serif-display text-2xl text-[#1C1A18] font-medium">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-[#1C1A18] hover:bg-[#541920] text-[#FAF7F2] text-xs uppercase tracking-[0.22em] font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Proceed to White-Glove Checkout</span>
                <ArrowRight size={14} className="text-[#C5A575]" />
              </button>

              <p className="text-[10px] text-center text-[#8A857E] tracking-wider">
                Taxes calculated at billing • Secure 256-bit Encrypted Checkout
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
