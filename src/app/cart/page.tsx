"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Heart, ShoppingBag, ArrowRight, ShieldCheck, Tag, Plus, Minus } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    toggleWishlist,
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

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const freeShippingLeft = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput("");
    }
  };

  const handleMoveToWishlist = (productId: string, selectedColor?: string) => {
    toggleWishlist(productId);
    removeFromCart(productId, selectedColor);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Breadcrumb Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Shopping Bag</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900">
            Shopping Bag ({cart.reduce((sum, item) => sum + item.quantity, 0)} Items)
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {cart.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-4 bg-white p-8 rounded-sm border border-[#E8E2D9]">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F4EFE6] flex items-center justify-center text-neutral-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-neutral-900">Your shopping bag is empty</h2>
              <p className="text-xs text-neutral-500 mt-1">
                Explore our handloom silks, bridal masterpieces, and festive drapes.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors shadow-xs"
            >
              Explore Sarees Catalogue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Items List */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Free shipping banner */}
              <div className="bg-white p-4 rounded-sm border border-[#E8E2D9]">
                <div className="text-xs text-neutral-700 flex justify-between font-sans mb-1.5">
                  {freeShippingLeft === 0 ? (
                    <span className="text-[#15803D] font-medium">
                      🎉 Congratulations! You qualify for FREE Express Shipping.
                    </span>
                  ) : (
                    <span>
                      Add <strong>{formatPrice(freeShippingLeft)}</strong> more to get <strong>FREE Express Shipping</strong>!
                    </span>
                  )}
                  <span className="font-semibold text-neutral-900">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#EFEAE1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#541920] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-sm border border-[#E8E2D9] divide-y divide-[#EFEAE1]">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedColor || 'def'}`} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                    {/* Image */}
                    <Link
                      href={`/product/${item.product.id}`}
                      className="relative w-24 h-32 shrink-0 rounded-xs overflow-hidden bg-neutral-200"
                    >
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="96px"
                        className="object-cover object-top"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#541920] tracking-wider">
                              {item.product.category}
                            </span>
                            <Link
                              href={`/product/${item.product.id}`}
                              className="text-base font-serif font-medium text-neutral-900 hover:text-[#541920] block"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Fabric: {item.product.fabric}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-serif font-bold text-[#541920]">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            {item.product.originalPrice && (
                              <p className="text-xs text-neutral-400 line-through">
                                {formatPrice(item.product.originalPrice * item.quantity)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Selected options */}
                        <div className="flex flex-wrap gap-3 text-xs text-neutral-600 mt-2">
                          {item.selectedColor && (
                            <span className="bg-[#FAF7F2] px-2 py-0.5 rounded-xs border border-[#E8E2D9]">
                              Color: <strong>{item.selectedColor}</strong>
                            </span>
                          )}
                          {item.blouseOption && (
                            <span className="bg-[#FAF7F2] px-2 py-0.5 rounded-xs border border-[#E8E2D9]">
                              Blouse: <strong>{item.blouseOption}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F4EFE6]">
                        {/* Stepper */}
                        <div className="flex items-center border border-[#DCD5C9] rounded-xs bg-white">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedColor)}
                            className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-semibold" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedColor)}
                            className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-4 text-xs font-medium">
                          <button
                            onClick={() => handleMoveToWishlist(item.product.id, item.selectedColor)}
                            className="text-neutral-500 hover:text-[#541920] flex items-center gap-1"
                            aria-label={`Save ${item.product.name} to Wishlist`}
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Save to Wishlist</span>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                            className="text-neutral-400 hover:text-red-600 flex items-center gap-1"
                            aria-label={`Remove ${item.product.name} from cart`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white p-6 rounded-sm border border-[#E8E2D9] space-y-4">
                <h3 className="font-serif text-lg font-medium text-neutral-900 border-b border-[#E8E2D9] pb-3">
                  Order Summary
                </h3>

                {/* Promo Code Form */}
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-[#F4EFE6] px-3.5 py-2.5 rounded-xs text-xs border border-[#E8E2D9]">
                    <div className="flex items-center gap-1.5 text-[#541920]">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code <strong>{appliedCoupon}</strong> (-{formatPrice(discountAmount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-neutral-500 hover:text-black font-semibold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-neutral-900 text-white text-xs uppercase font-semibold rounded-xs hover:bg-black"
                      >
                        Apply
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-500">
                      Use code <strong className="text-[#541920]">PALLUVO10</strong> for 10% instant discount
                    </p>
                    {couponError && <p className="text-xs text-red-600">{couponError}</p>}
                  </form>
                )}

                {/* Subtotals */}
                <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-[#E8E2D9]">
                  <div className="flex justify-between">
                    <span>Bag Subtotal</span>
                    <span className="text-neutral-900 font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#15803D]">
                      <span>Coupon Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-neutral-900 font-medium">
                      {shippingFee === 0 ? <span className="text-[#15803D]">FREE</span> : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-serif font-bold text-neutral-900 pt-3 border-t border-[#E8E2D9]">
                    <span>Total Payable</span>
                    <span className="text-[#541920]">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  <span>Secure 256-Bit SSL Checkout</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
