"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Truck, CreditCard, ArrowLeft, ArrowRight, Lock, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { OrderRecord } from "@/data/mockOrders";

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    shippingFee,
    discountAmount,
    finalTotal,
    formatPrice,
    placeOrder,
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "Radhika Sharma",
    phone: "9876543210",
    email: "radhika.sharma@example.com",
    addressLine1: "Flat 402, Royal Palms Residency",
    landmark: "Near Lotus Temple Road",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110019",
  });

  // Delivery & Payment selection
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("radhika@okhdfcbank");

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = () => {
    const newOrder = placeOrder({
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        image: i.product.images[0],
        price: i.product.price,
        quantity: i.quantity,
        color: i.selectedColor || "Standard",
      })),
      totalAmount: finalTotal + (deliveryMethod === "express" ? 299 : 0),
      shippingAddress: `${shippingAddress.fullName}, ${shippingAddress.addressLine1}, ${shippingAddress.landmark}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode} (Ph: ${shippingAddress.phone})`,
      paymentMethod:
        paymentMethod === "upi"
          ? "UPI (Google Pay / PhonePe)"
          : paymentMethod === "card"
          ? "Credit / Debit Card"
          : paymentMethod === "netbanking"
          ? "Net Banking"
          : "Cash on Delivery",
      trackingNumber: `EXP${Math.floor(10000000 + Math.random() * 90000000)}`,
    });

    setCompletedOrder(newOrder);
  };

  // If order is completed, show confirmation screen
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-12 sm:py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white p-8 sm:p-10 rounded-sm border border-[#E8E2D9] text-center shadow-lg space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center text-[#15803D]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#541920] font-semibold">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-normal text-neutral-900 mt-1">
                Thank You For Your Order!
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans">
                Order ID: <strong className="text-neutral-900 font-mono">{completedOrder.orderNumber}</strong>
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-xs border border-[#E8E2D9] text-left text-xs space-y-2">
              <p className="text-neutral-600">
                A confirmation email with shipping updates has been sent to{" "}
                <strong className="text-neutral-900">{shippingAddress.email}</strong>.
              </p>
              <div className="pt-2 border-t border-[#E8E2D9] flex justify-between text-neutral-800">
                <span>Estimated Handloom Dispatch:</span>
                <strong className="text-[#541920]">{completedOrder.deliveryDate}</strong>
              </div>
              <div className="flex justify-between text-neutral-800">
                <span>Payment Method:</span>
                <strong>{completedOrder.paymentMethod}</strong>
              </div>
              <div className="flex justify-between text-neutral-800">
                <span>Total Amount Paid:</span>
                <strong className="text-[#541920]">{formatPrice(completedOrder.totalAmount)}</strong>
              </div>
              <div className="pt-2 border-t border-[#E8E2D9] text-neutral-600">
                <p className="font-semibold text-neutral-800 mb-0.5">Need help with your order?</p>
                <p>
                  Email: <a href="mailto:contact@palluvo.com" className="text-[#541920] font-medium hover:underline">contact@palluvo.com</a>
                </p>
                <p>
                  Call / WhatsApp: <a href="tel:+918498854323" className="text-[#541920] font-medium hover:underline">+91 84988 54323</a> / <a href="tel:+918106789789" className="text-[#541920] font-medium hover:underline">+91 81067 89789</a>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/account"
                className="flex-1 py-3 bg-[#541920] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs hover:bg-[#3D1217] transition-colors text-center"
              >
                Track In My Orders
              </Link>
              <Link
                href="/shop"
                className="flex-1 py-3 bg-white border border-[#DCD5C9] text-neutral-900 text-xs uppercase tracking-widest font-semibold rounded-xs hover:bg-[#FAF7F2] transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and no order completed
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-16 text-center">
        <h2 className="text-2xl font-serif">Your bag is empty</h2>
        <p className="text-xs text-neutral-500 mt-2">Add sarees to your bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block mt-4 px-6 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
        >
          Explore Sarees
        </Link>
      </div>
    );
  }

  const effectiveTotal = finalTotal + (deliveryMethod === "express" ? 299 : 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Top Checkout Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Bag</span>
            </Link>

            {/* Stepper */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-sans">
              <span className={`font-semibold ${step >= 1 ? "text-[#541920]" : "text-neutral-400"}`}>
                1. Address
              </span>
              <span className="text-neutral-300">→</span>
              <span className={`font-semibold ${step >= 2 ? "text-[#541920]" : "text-neutral-400"}`}>
                2. Delivery
              </span>
              <span className="text-neutral-300">→</span>
              <span className={`font-semibold ${step >= 3 ? "text-[#541920]" : "text-neutral-400"}`}>
                3. Payment
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#15803D] font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>256-bit Secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Multi-Step Forms */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Address */}
            <div className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8E2D9] bg-[#F4EFE6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#541920] text-white text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <h2 className="font-serif text-base font-medium text-neutral-900">
                    Shipping Address
                  </h2>
                </div>
                {step > 1 && (
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-[#541920] font-semibold hover:underline"
                  >
                    Edit Address
                  </button>
                )}
              </div>

              {step === 1 ? (
                <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fullName" className="block text-neutral-700 font-medium mb-1">
                        Full Name *
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-neutral-700 font-medium mb-1">
                        Phone Number (+91) *
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-neutral-700 font-medium mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                    />
                  </div>

                  <div>
                    <label htmlFor="addressLine1" className="block text-neutral-700 font-medium mb-1">
                      Flat / House / Street Address *
                    </label>
                    <input
                      id="addressLine1"
                      name="addressLine1"
                      type="text"
                      autoComplete="street-address"
                      required
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-neutral-700 font-medium mb-1">
                        City *
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        autoComplete="address-level2"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-neutral-700 font-medium mb-1">
                        State *
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        autoComplete="address-level1"
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="pincode" className="block text-neutral-700 font-medium mb-1">
                        PIN Code *
                      </label>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        autoComplete="postal-code"
                        required
                        maxLength={6}
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#541920] hover:bg-[#3D1217] text-white uppercase tracking-widest font-semibold rounded-xs shadow-xs"
                    >
                      Deliver to This Address →
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 text-xs text-neutral-600">
                  <p className="font-semibold text-neutral-900">{shippingAddress.fullName} ({shippingAddress.phone})</p>
                  <p>{shippingAddress.addressLine1}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                </div>
              )}
            </div>

            {/* Step 2: Delivery Method */}
            <div className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8E2D9] bg-[#F4EFE6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${
                    step >= 2 ? "bg-[#541920]" : "bg-neutral-300"
                  }`}>
                    2
                  </span>
                  <h2 className="font-serif text-base font-medium text-neutral-900">
                    Delivery Speed
                  </h2>
                </div>
                {step > 2 && (
                  <button
                    onClick={() => setStep(2)}
                    className="text-xs text-[#541920] font-semibold hover:underline"
                  >
                    Change Delivery
                  </button>
                )}
              </div>

              {step === 2 && (
                <form onSubmit={handleDeliverySubmit} className="p-6 space-y-3 text-xs">
                  <label
                    htmlFor="delivery-standard"
                    className={`flex items-center justify-between p-3.5 border rounded-xs cursor-pointer ${
                      deliveryMethod === "standard"
                        ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]"
                        : "border-[#E8E2D9]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id="delivery-standard"
                        name="deliveryMethod"
                        type="radio"
                        value="standard"
                        checked={deliveryMethod === "standard"}
                        onChange={() => setDeliveryMethod("standard")}
                        className="text-[#541920]"
                      />
                      <div>
                        <p className="font-semibold text-neutral-900">Standard Insured Delivery (3-5 Days)</p>
                        <p className="text-[11px] text-neutral-500">Tamper-proof rigid box with Silk Mark Certificate</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#15803D]">FREE</span>
                  </label>

                  <label
                    htmlFor="delivery-express"
                    className={`flex items-center justify-between p-3.5 border rounded-xs cursor-pointer ${
                      deliveryMethod === "express"
                        ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]"
                        : "border-[#E8E2D9]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        id="delivery-express"
                        name="deliveryMethod"
                        type="radio"
                        value="express"
                        checked={deliveryMethod === "express"}
                        onChange={() => setDeliveryMethod("express")}
                        className="text-[#541920]"
                      />
                      <div>
                        <p className="font-semibold text-neutral-900">Priority Air Express (1-2 Days)</p>
                        <p className="text-[11px] text-neutral-500">Next-flight priority courier with real-time SMS tracking</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">₹299</span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#541920] hover:bg-[#3D1217] text-white uppercase tracking-widest font-semibold rounded-xs shadow-xs"
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8E2D9] bg-[#F4EFE6] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${
                    step === 3 ? "bg-[#541920]" : "bg-neutral-300"
                  }`}>
                    3
                  </span>
                  <h2 className="font-serif text-base font-medium text-neutral-900">
                    Payment Method
                  </h2>
                </div>
              </div>

              {step === 3 && (
                <div className="p-6 space-y-4 text-xs">
                  <div className="space-y-2.5">
                    {/* UPI */}
                    <label
                      htmlFor="payment-upi"
                      className={`flex flex-col p-3.5 border rounded-xs cursor-pointer ${
                        paymentMethod === "upi" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            id="payment-upi"
                            name="paymentMethod"
                            value="upi"
                            type="radio"
                            checked={paymentMethod === "upi"}
                            onChange={() => setPaymentMethod("upi")}
                            className="text-[#541920]"
                          />
                          <span className="font-semibold text-neutral-900">Instant UPI (GPay, PhonePe, Paytm, QR)</span>
                        </div>
                        <span className="text-[10px] text-[#15803D] font-bold">Fastest</span>
                      </div>
                      {paymentMethod === "upi" && (
                        <div className="mt-3 pt-3 border-t border-[#E8E2D9] space-y-2">
                          <label htmlFor="upiId" className="block text-neutral-700 font-medium mb-1">
                            UPI ID *
                          </label>
                          <input
                            id="upiId"
                            name="upiId"
                            type="text"
                            placeholder="Enter UPI ID (e.g. mobile@upi)"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs"
                          />
                        </div>
                      )}
                    </label>

                    {/* Card */}
                    <label
                      htmlFor="payment-card"
                      className={`flex flex-col p-3.5 border rounded-xs cursor-pointer ${
                        paymentMethod === "card" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          id="payment-card"
                          name="paymentMethod"
                          value="card"
                          type="radio"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="text-[#541920]"
                        />
                        <span className="font-semibold text-neutral-900">Credit / Debit Card (Visa, MasterCard, RuPay)</span>
                      </div>
                    </label>

                    {/* Netbanking */}
                    <label
                      htmlFor="payment-netbanking"
                      className={`flex flex-col p-3.5 border rounded-xs cursor-pointer ${
                        paymentMethod === "netbanking" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          id="payment-netbanking"
                          name="paymentMethod"
                          value="netbanking"
                          type="radio"
                          checked={paymentMethod === "netbanking"}
                          onChange={() => setPaymentMethod("netbanking")}
                          className="text-[#541920]"
                        />
                        <span className="font-semibold text-neutral-900">Net Banking (HDFC, ICICI, SBI, Axis)</span>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      htmlFor="payment-cod"
                      className={`flex flex-col p-3.5 border rounded-xs cursor-pointer ${
                        paymentMethod === "cod" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            id="payment-cod"
                            name="paymentMethod"
                            value="cod"
                            type="radio"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="text-[#541920]"
                          />
                          <span className="font-semibold text-neutral-900">Cash on Delivery (COD)</span>
                        </div>
                        <span className="text-[10px] text-neutral-500">Pay when delivered</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <ShieldCheck className="w-4 h-4 text-green-300" />
                      <span>Place Order ({formatPrice(effectiveTotal)})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary In Checkout */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-sm border border-[#E8E2D9] space-y-4">
              <h3 className="font-serif text-base font-semibold text-neutral-900 border-b border-[#E8E2D9] pb-3">
                Items in Order ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto divide-y divide-[#EFEAE1]">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.selectedColor || 'def'}`} className="pt-3 first:pt-0 flex gap-3">
                    <div className="relative w-14 h-18 shrink-0 rounded-xs overflow-hidden bg-neutral-100">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        sizes="60px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-serif font-medium text-neutral-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Qty: {item.quantity} {item.selectedColor && `• ${item.selectedColor}`}
                      </p>
                      <p className="text-xs font-bold text-[#541920] mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-3 border-t border-[#E8E2D9]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-neutral-900">
                    {deliveryMethod === "express" ? "₹299" : "FREE"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-neutral-900 pt-2 border-t border-[#E8E2D9]">
                  <span>Total Amount</span>
                  <span className="text-[#541920]">{formatPrice(effectiveTotal)}</span>
                </div>
              </div>

              <div className="text-[11px] text-neutral-500 pt-2 border-t border-[#E8E2D9] space-y-1">
                <p>• 7-Day Hassle-Free Returns Guaranteed</p>
                <p>• 100% Pure Silk Mark Verified</p>
                <div className="pt-2 border-t border-[#E8E2D9] text-neutral-600">
                  <p className="font-semibold text-neutral-800 mb-0.5">Need Help with Checkout?</p>
                  <p>
                    Email: <a href="mailto:contact@palluvo.com" className="text-[#541920] hover:underline font-medium">contact@palluvo.com</a>
                  </p>
                  <p>
                    Call / WhatsApp: <a href="tel:+918498854323" className="text-[#541920] hover:underline font-medium">+91 84988 54323</a> / <a href="tel:+918106789789" className="text-[#541920] hover:underline font-medium">+91 81067 89789</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
