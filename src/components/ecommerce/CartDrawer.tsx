"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingFee,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    finalTotal,
    freeShippingThreshold,
    formatPrice,
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const freeShippingLeft = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setInputCoupon("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] text-[#1C1A18] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E8E2D9] flex items-center justify-between bg-[#F4EFE6]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#541920]" />
              <h2 className="text-lg font-serif tracking-wide font-medium">
                Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#FAF7F2] px-6 py-3 border-b border-[#E8E2D9]">
            <div className="text-xs text-neutral-600 mb-1.5 flex justify-between font-sans">
              {freeShippingLeft === 0 ? (
                <span className="text-[#15803D] font-medium flex items-center gap-1">
                  🎉 You have unlocked FREE Express Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-[#541920]">{formatPrice(freeShippingLeft)}</strong> more to get{" "}
                  <strong>FREE Shipping</strong>
                </span>
              )}
              <span className="font-semibold text-neutral-700">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E5DFD5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#541920] h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-[#EFEAE1]">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F4EFE6] flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-neutral-800">Your bag is empty</h3>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                    Explore our handpicked collection of royal weaves and artisanal sarees.
                  </p>
                </div>
                <Link
                  href="/shop"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block px-6 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#3D1217] transition-colors rounded-sm"
                >
                  Explore Sarees
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor || 'def'}`} className="pt-4 first:pt-0 flex gap-3.5">
                  {/* Thumbnail */}
                  <Link
                    href={`/product/${item.product.id}`}
                    onClick={() => setIsCartOpen(false)}
                    className="relative w-20 h-26 shrink-0 rounded-sm overflow-hidden bg-neutral-200"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <Link
                          href={`/product/${item.product.id}`}
                          onClick={() => setIsCartOpen(false)}
                          className="text-xs font-serif font-medium text-neutral-900 line-clamp-1 hover:text-[#541920]"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                          aria-label={`Remove ${item.product.name} from cart`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-neutral-500 mt-0.5 space-x-2">
                        {item.selectedColor && (
                          <span>Color: <strong className="text-neutral-700">{item.selectedColor}</strong></span>
                        )}
                        {item.blouseOption && (
                          <span>• Blouse: <strong className="text-neutral-700">{item.blouseOption.split(" ")[0]}</strong></span>
                        )}
                      </div>

                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-[#541920]">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.originalPrice && (
                          <span className="text-[10px] text-neutral-400 line-through">
                            {formatPrice(item.product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#DCD5C9] rounded-sm bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                          className="p-1 px-2 text-neutral-600 hover:text-black hover:bg-neutral-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium min-w-[20px] text-center" aria-label={`Quantity: ${item.quantity}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                          className="p-1 px-2 text-neutral-600 hover:text-black hover:bg-neutral-100"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-medium text-neutral-800">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Breakdown */}
          {cart.length > 0 && (
            <div className="p-6 bg-[#F4EFE6] border-t border-[#E8E2D9] space-y-3">
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-[#EAE2D5] px-3 py-2 rounded-sm text-xs">
                  <div className="flex items-center gap-1.5 text-[#541920]">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon <strong>{appliedCoupon}</strong> applied (-{formatPrice(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-neutral-500 hover:text-black font-semibold text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (use PALLUVO10)"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD5C9] rounded-sm focus:outline-none focus:border-[#541920]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-neutral-900 text-white text-xs uppercase tracking-wider font-medium hover:bg-black rounded-sm"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                </form>
              )}

              {/* Subtotals */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-neutral-900 font-medium">
                    {shippingFee === 0 ? <span className="text-[#15803D]">FREE</span> : formatPrice(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-neutral-900 pt-2 border-t border-[#E8E2D9]">
                  <span>Total Amount</span>
                  <span className="text-[#541920]">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#541920] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#3D1217] transition-all rounded-sm shadow-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full block text-center py-2 text-xs text-neutral-600 hover:text-black uppercase tracking-wider underline font-sans"
                >
                  View Full Cart Details
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                <span>100% Authentic Handcrafted Sarees • Easy 7-Day Returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
