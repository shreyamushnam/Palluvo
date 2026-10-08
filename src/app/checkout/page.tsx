"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, ChevronRight, Lock, CreditCard, Building2 } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { OrderRecord } from "@/data/mockOrders";

const POPULAR_BANKS = [
  { id: "hdfc", name: "HDFC Bank" },
  { id: "sbi", name: "State Bank of India" },
  { id: "icici", name: "ICICI Bank" },
  { id: "axis", name: "Axis Bank" },
  { id: "kotak", name: "Kotak Mahindra Bank" },
];

const OTHER_BANKS = [
  { id: "pnb", name: "Punjab National Bank" },
  { id: "bob", name: "Bank of Baroda" },
  { id: "canara", name: "Canara Bank" },
  { id: "union", name: "Union Bank of India" },
  { id: "idbi", name: "IDBI Bank" },
  { id: "indusind", name: "IndusInd Bank" },
  { id: "yes", name: "Yes Bank" },
  { id: "federal", name: "Federal Bank" },
];

export default function CheckoutPage() {
  const {
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal,
    formatPrice,
    placeOrder,
    showToast,
    addresses,
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const targetRef = step === 1 ? step1Ref : step === 2 ? step2Ref : step3Ref;
      if (targetRef.current) {
        targetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [step]);

  const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddr ? defaultAddr.id : "");

  // Address Form State
  const [shippingAddress, setShippingAddress] = useState({
    fullName: defaultAddr ? defaultAddr.name : "Radhika Sharma",
    phone: defaultAddr ? defaultAddr.phone.replace("+91 ", "").replace(/\s/g, "") : "9876543210",
    email: "radhika.sharma@example.com",
    addressLine1: defaultAddr ? defaultAddr.addressLine : "Flat 402, Royal Palms Residency",
    landmark: "Near Lotus Temple Road",
    city: defaultAddr ? defaultAddr.city : "New Delhi",
    state: defaultAddr ? defaultAddr.state : "Delhi",
    pincode: defaultAddr ? defaultAddr.pincode : "110019",
  });

  // Keep form synchronized with StoreContext saved addresses
  useEffect(() => {
    if (addresses.length > 0) {
      const active = addresses.find((a) => a.id === selectedAddressId) || addresses.find((a) => a.isDefault) || addresses[0];
      if (active) {
        if (selectedAddressId !== active.id) {
          setSelectedAddressId(active.id);
        }
        setShippingAddress((prev) => ({
          ...prev,
          fullName: active.name,
          phone: active.phone.replace("+91 ", "").replace(/\s/g, ""),
          addressLine1: active.addressLine,
          city: active.city,
          state: active.state,
          pincode: active.pincode,
        }));
      }
    }
  }, [addresses, selectedAddressId]);

  // Delivery & Payment selection
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [upiId, setUpiId] = useState("radhika@okhdfcbank");
  const [upiError, setUpiError] = useState("");

  // Card details state & validation
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardholderName: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({
    cardNumber: "",
    cardholderName: "",
    expiry: "",
    cvv: "",
  });

  // Net Banking state
  const [selectedBank, setSelectedBank] = useState("hdfc");

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleDeliverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === "upi" && !upiId.trim()) {
      setUpiError("Please enter a valid UPI ID (e.g. mobile@upi).");
      showToast("Please enter a valid UPI ID before placing your order.", "info");
      const input = document.getElementById("upiId");
      if (input) {
        input.focus();
      }
      return;
    }
    setUpiError("");

    if (paymentMethod === "card") {
      const rawNum = cardDetails.cardNumber.replace(/\s/g, "");
      const rawExp = cardDetails.expiry.replace(/\D/g, "");
      const newErrors = {
        cardNumber: rawNum.length < 15 ? "Please enter a valid 16-digit card number." : "",
        cardholderName: !cardDetails.cardholderName.trim() ? "Please enter the cardholder name." : "",
        expiry: rawExp.length < 4 ? "Please enter a valid expiry date (MM/YY)." : "",
        cvv: cardDetails.cvv.length < 3 ? "Please enter a valid CVV." : "",
      };

      if (newErrors.cardNumber || newErrors.cardholderName || newErrors.expiry || newErrors.cvv) {
        setCardErrors(newErrors);
        showToast("Please complete the required card details.", "info");
        const firstErrField = newErrors.cardholderName
          ? "cardholderName"
          : newErrors.cardNumber
          ? "cardNumber"
          : newErrors.expiry
          ? "cardExpiry"
          : "cardCvv";
        const input = document.getElementById(firstErrField);
        if (input) input.focus();
        return;
      }
      setCardErrors({ cardNumber: "", cardholderName: "", expiry: "", cvv: "" });
    }

    const allBanks = [...POPULAR_BANKS, ...OTHER_BANKS];
    const bankName = allBanks.find((b) => b.id === selectedBank)?.name || "Bank";

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
      shippingAddress: `${shippingAddress.fullName}, ${shippingAddress.addressLine1}${shippingAddress.landmark ? `, ${shippingAddress.landmark}` : ""}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode} (Ph: ${shippingAddress.phone})`,
      paymentMethod:
        paymentMethod === "upi"
          ? "UPI (Google Pay / PhonePe)"
          : paymentMethod === "card"
          ? `Credit / Debit Card (ending in ${cardDetails.cardNumber.replace(/\s/g, "").slice(-4) || "XXXX"})`
          : paymentMethod === "netbanking"
          ? `Net Banking (${bankName})`
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
                <span>
                  {completedOrder.paymentMethod.toLowerCase().includes("cash on delivery") ||
                  completedOrder.paymentMethod.toLowerCase().includes("cod")
                    ? "Total Amount to Pay on Delivery:"
                    : "Total Amount Paid:"}
                </span>
                <strong className="text-[#541920] tabular-nums">{formatPrice(completedOrder.totalAmount)}</strong>
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
        <p className="text-xs text-neutral-600 mt-2">Add products to your bag before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block mt-4 px-6 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  const totalShippingFee = shippingFee + (deliveryMethod === "express" ? 299 : 0);
  const effectiveTotal = finalTotal + (deliveryMethod === "express" ? 299 : 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Top Checkout Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-3 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <Link
                href="/cart"
                className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black whitespace-nowrap font-medium focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back to Bag</span>
              </Link>

              <div className="sm:hidden flex items-center gap-1 text-[11px] text-[#15803D] font-medium shrink-0">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>256-bit Secure</span>
              </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-sans overflow-x-auto py-1 sm:py-0">
              <span className={`whitespace-nowrap font-semibold ${step >= 1 ? "text-[#541920]" : "text-neutral-600"}`}>
                1. Address
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
              <span className={`whitespace-nowrap font-semibold ${step >= 2 ? "text-[#541920]" : "text-neutral-600"}`}>
                2. Delivery
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
              <span className={`whitespace-nowrap font-semibold ${step >= 3 ? "text-[#541920]" : "text-neutral-600"}`}>
                3. Payment
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#15803D] font-medium shrink-0">
              <Lock className="w-3.5 h-3.5 shrink-0" />
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
            <div ref={step1Ref} className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden scroll-mt-4 sm:scroll-mt-6">
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
                    type="button"
                    onClick={() => setStep(1)}
                    className="min-h-[44px] px-2 -mr-2 text-xs text-[#541920] font-semibold hover:underline inline-flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
                    aria-label="Edit shipping address"
                  >
                    Edit Address
                  </button>
                )}
              </div>

              {step === 1 ? (
                <form onSubmit={handleAddressSubmit} className="p-6 space-y-4 text-xs">
                  {/* Saved addresses selector */}
                  {addresses && addresses.length > 0 && (
                    <div className="space-y-2 pb-3 border-b border-[#E8E2D9]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800 text-xs">
                          Deliver to Saved Address:
                        </span>
                        <Link
                          href="/account"
                          className="text-[11px] text-[#541920] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <span>Manage Addresses</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr.id;
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => {
                                setSelectedAddressId(addr.id);
                                setShippingAddress((prev) => ({
                                  ...prev,
                                  fullName: addr.name,
                                  phone: addr.phone.replace("+91 ", "").replace(/\s/g, ""),
                                  addressLine1: addr.addressLine,
                                  city: addr.city,
                                  state: addr.state,
                                  pincode: addr.pincode,
                                }));
                              }}
                              className={`p-3 text-left rounded-xs border transition-colors cursor-pointer text-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                                isSelected
                                  ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]"
                                  : "border-[#DCD5C9] bg-white hover:border-neutral-400"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                                  {addr.name}
                                  <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-600 font-normal">
                                    {addr.type}
                                  </span>
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] text-[#541920] font-semibold">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-neutral-600 line-clamp-1">{addr.addressLine}</p>
                              <p className="text-neutral-500 text-[11px] mt-0.5">
                                {addr.city}, {addr.state} - {addr.pincode}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

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
                        className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="tel"
                        maxLength={10}
                        required
                        value={shippingAddress.phone}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setShippingAddress({ ...shippingAddress, phone: digitsOnly });
                        }}
                        className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                      className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                      className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                    />
                  </div>

                  <div>
                    <label htmlFor="landmark" className="block text-neutral-700 font-medium mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      id="landmark"
                      name="landmark"
                      type="text"
                      placeholder="e.g. Near Lotus Temple Road"
                      value={shippingAddress.landmark}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="postal-code"
                        required
                        maxLength={6}
                        value={shippingAddress.pincode}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setShippingAddress({ ...shippingAddress, pincode: digitsOnly });
                        }}
                        className="w-full min-h-[44px] px-3 py-2.5 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[44px] py-3 bg-[#541920] hover:bg-[#3D1217] text-white uppercase tracking-widest font-semibold rounded-xs shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none inline-flex items-center justify-center gap-2"
                    >
                      <span>Deliver to This Address</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 text-xs text-neutral-600">
                  <p className="font-semibold text-neutral-900">{shippingAddress.fullName} ({shippingAddress.phone})</p>
                  <p>{shippingAddress.addressLine1}{shippingAddress.landmark ? `, ${shippingAddress.landmark}` : ""}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                </div>
              )}
            </div>

            {/* Step 2: Delivery Method */}
            <div ref={step2Ref} className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden scroll-mt-4 sm:scroll-mt-6">
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
                    type="button"
                    onClick={() => setStep(2)}
                    className="min-h-[44px] px-2 -mr-2 text-xs text-[#541920] font-semibold hover:underline inline-flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-xs"
                    aria-label="Change delivery method"
                  >
                    Change Delivery
                  </button>
                )}
              </div>

              {step === 2 && (
                <form onSubmit={handleDeliverySubmit} className="p-6 space-y-3 text-xs">
                  <label
                    htmlFor="delivery-standard"
                    className={`flex items-center justify-between p-3.5 min-h-[44px] border rounded-xs cursor-pointer ${
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
                        <p className="font-semibold text-neutral-900">Standard Insured Delivery (3-5 Business Days)</p>
                        <p className="text-[11px] text-neutral-600">Tamper-proof rigid box with Silk Mark Certificate</p>
                      </div>
                    </div>
                    {shippingFee === 0 ? (
                      <span className="font-bold text-[#15803D]">FREE</span>
                    ) : (
                      <span className="font-bold text-neutral-900 tabular-nums">{formatPrice(shippingFee)}</span>
                    )}
                  </label>

                  <label
                    htmlFor="delivery-express"
                    className={`flex items-center justify-between p-3.5 min-h-[44px] border rounded-xs cursor-pointer ${
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
                        <p className="font-semibold text-neutral-900">Priority Air Express (1-2 Business Days)</p>
                        <p className="text-[11px] text-neutral-600">Next-flight priority courier with real-time SMS tracking</p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900 tabular-nums">₹299</span>
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[44px] py-3 bg-[#541920] hover:bg-[#3D1217] text-white uppercase tracking-widest font-semibold rounded-xs shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none inline-flex items-center justify-center gap-2"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 3: Payment Method */}
            <div ref={step3Ref} className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden scroll-mt-4 sm:scroll-mt-6">
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
                    <div
                      className={`flex flex-col p-3.5 min-h-[44px] border rounded-xs transition-colors ${
                        paymentMethod === "upi" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <label htmlFor="payment-upi" className="flex items-center justify-between cursor-pointer">
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
                      </label>
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
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              if (upiError && e.target.value.trim()) {
                                setUpiError("");
                              }
                            }}
                            className={`w-full min-h-[44px] px-3 py-2.5 bg-white border rounded-xs focus:outline-none transition-colors ${
                              upiError
                                ? "border-red-600 focus:border-red-600 ring-1 ring-red-600 focus-visible:ring-2 focus-visible:ring-red-600"
                                : "border-[#DCD5C9] focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                            }`}
                            aria-invalid={!!upiError}
                            aria-describedby={upiError ? "upi-error-msg" : undefined}
                          />
                          {upiError && (
                            <p id="upi-error-msg" className="text-xs text-red-600 font-medium mt-1">
                              {upiError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card */}
                    <div
                      className={`flex flex-col p-3.5 min-h-[44px] border rounded-xs transition-colors ${
                        paymentMethod === "card" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <label htmlFor="payment-card" className="flex items-center justify-between cursor-pointer">
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
                        <CreditCard className="w-4 h-4 text-neutral-500" />
                      </label>
                      {paymentMethod === "card" && (
                        <div className="mt-3 pt-3 border-t border-[#E8E2D9] space-y-3">
                          <div>
                            <label htmlFor="cardholderName" className="block text-neutral-700 font-medium mb-1">
                              Cardholder Name *
                            </label>
                            <input
                              id="cardholderName"
                              name="cardholderName"
                              type="text"
                              autoComplete="cc-name"
                              placeholder="e.g. Radhika Sharma"
                              value={cardDetails.cardholderName}
                              onChange={(e) => {
                                setCardDetails({ ...cardDetails, cardholderName: e.target.value });
                                if (cardErrors.cardholderName && e.target.value.trim()) {
                                  setCardErrors((prev) => ({ ...prev, cardholderName: "" }));
                                }
                              }}
                              className={`w-full min-h-[44px] px-3 py-2.5 bg-white border rounded-xs focus:outline-none transition-colors ${
                                cardErrors.cardholderName
                                  ? "border-red-600 focus:border-red-600 ring-1 ring-red-600 focus-visible:ring-2 focus-visible:ring-red-600"
                                  : "border-[#DCD5C9] focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                              }`}
                              aria-invalid={!!cardErrors.cardholderName}
                              aria-describedby={cardErrors.cardholderName ? "cardholder-error" : undefined}
                            />
                            {cardErrors.cardholderName && (
                              <p id="cardholder-error" className="text-xs text-red-600 font-medium mt-1">
                                {cardErrors.cardholderName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="cardNumber" className="block text-neutral-700 font-medium mb-1">
                              Card Number *
                            </label>
                            <input
                              id="cardNumber"
                              name="cardNumber"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9 ]*"
                              autoComplete="cc-number"
                              maxLength={19}
                              placeholder="4123 4567 8901 2345"
                              value={cardDetails.cardNumber}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                                const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
                                setCardDetails({ ...cardDetails, cardNumber: formatted });
                                if (cardErrors.cardNumber && digits.length >= 15) {
                                  setCardErrors((prev) => ({ ...prev, cardNumber: "" }));
                                }
                              }}
                              className={`w-full min-h-[44px] px-3 py-2.5 bg-white border rounded-xs focus:outline-none transition-colors ${
                                cardErrors.cardNumber
                                  ? "border-red-600 focus:border-red-600 ring-1 ring-red-600 focus-visible:ring-2 focus-visible:ring-red-600"
                                  : "border-[#DCD5C9] focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                              }`}
                              aria-invalid={!!cardErrors.cardNumber}
                              aria-describedby={cardErrors.cardNumber ? "cardnumber-error" : undefined}
                            />
                            {cardErrors.cardNumber && (
                              <p id="cardnumber-error" className="text-xs text-red-600 font-medium mt-1">
                                {cardErrors.cardNumber}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor="cardExpiry" className="block text-neutral-700 font-medium mb-1">
                                Expiry (MM/YY) *
                              </label>
                              <input
                                id="cardExpiry"
                                name="cardExpiry"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9/]*"
                                autoComplete="cc-exp"
                                maxLength={5}
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                                  const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                                  setCardDetails({ ...cardDetails, expiry: formatted });
                                  if (cardErrors.expiry && digits.length === 4) {
                                    setCardErrors((prev) => ({ ...prev, expiry: "" }));
                                  }
                                }}
                                className={`w-full min-h-[44px] px-3 py-2.5 bg-white border rounded-xs focus:outline-none transition-colors ${
                                  cardErrors.expiry
                                    ? "border-red-600 focus:border-red-600 ring-1 ring-red-600 focus-visible:ring-2 focus-visible:ring-red-600"
                                    : "border-[#DCD5C9] focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                                }`}
                                aria-invalid={!!cardErrors.expiry}
                                aria-describedby={cardErrors.expiry ? "expiry-error" : undefined}
                              />
                              {cardErrors.expiry && (
                                <p id="expiry-error" className="text-xs text-red-600 font-medium mt-1">
                                  {cardErrors.expiry}
                                </p>
                              )}
                            </div>
                            <div>
                              <label htmlFor="cardCvv" className="block text-neutral-700 font-medium mb-1">
                                CVV *
                              </label>
                              <input
                                id="cardCvv"
                                name="cardCvv"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="cc-csc"
                                maxLength={4}
                                placeholder="•••"
                                value={cardDetails.cvv}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                                  setCardDetails({ ...cardDetails, cvv: digits });
                                  if (cardErrors.cvv && digits.length >= 3) {
                                    setCardErrors((prev) => ({ ...prev, cvv: "" }));
                                  }
                                }}
                                className={`w-full min-h-[44px] px-3 py-2.5 bg-white border rounded-xs focus:outline-none transition-colors ${
                                  cardErrors.cvv
                                    ? "border-red-600 focus:border-red-600 ring-1 ring-red-600 focus-visible:ring-2 focus-visible:ring-red-600"
                                    : "border-[#DCD5C9] focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                                }`}
                                aria-invalid={!!cardErrors.cvv}
                                aria-describedby={cardErrors.cvv ? "cvv-error" : undefined}
                              />
                              {cardErrors.cvv && (
                                <p id="cvv-error" className="text-xs text-red-600 font-medium mt-1">
                                  {cardErrors.cvv}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 text-[11px] text-neutral-600">
                            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
                            <span>128-bit SSL encrypted. Supports Visa, MasterCard, RuPay &amp; Maestro.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Netbanking */}
                    <div
                      className={`flex flex-col p-3.5 min-h-[44px] border rounded-xs transition-colors ${
                        paymentMethod === "netbanking" ? "border-[#541920] bg-[#FAF7F2] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                      }`}
                    >
                      <label htmlFor="payment-netbanking" className="flex items-center justify-between cursor-pointer">
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
                          <span className="font-semibold text-neutral-900">Net Banking (All Indian Banks)</span>
                        </div>
                        <Building2 className="w-4 h-4 text-neutral-500" />
                      </label>
                      {paymentMethod === "netbanking" && (
                        <div className="mt-3 pt-3 border-t border-[#E8E2D9] space-y-3">
                          <div>
                            <span className="block text-neutral-700 font-medium mb-1.5">
                              Popular Banks:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {POPULAR_BANKS.map((b) => {
                                const isSelected = selectedBank === b.id;
                                return (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => setSelectedBank(b.id)}
                                    className={`min-h-[44px] px-3 py-2 text-xs rounded-xs border text-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                                      isSelected
                                        ? "bg-[#541920] text-white border-[#541920] font-semibold"
                                        : "bg-white text-neutral-800 border-[#DCD5C9] hover:border-[#541920]"
                                    }`}
                                  >
                                    {b.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label htmlFor="other-bank-select" className="block text-neutral-700 font-medium mb-1">
                              Or Choose Other Bank:
                            </label>
                            <select
                              id="other-bank-select"
                              name="otherBank"
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2.5 bg-white border border-[#DCD5C9] rounded-xs text-xs text-neutral-800 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                            >
                              <optgroup label="Popular Banks">
                                {POPULAR_BANKS.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </optgroup>
                              <optgroup label="Other Banks">
                                {OTHER_BANKS.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </optgroup>
                            </select>
                          </div>

                          <div className="p-3 bg-white border border-[#E8E2D9] rounded-xs flex items-start gap-2.5 text-neutral-700">
                            <Lock className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed">
                              <strong>Secure Gateway Redirect:</strong> Clicking &ldquo;Place Order&rdquo; will securely redirect you to your bank&rsquo;s official portal to authorize payment via NetBanking or OTP credentials.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery */}
                    <label
                      htmlFor="payment-cod"
                      className={`flex flex-col p-3.5 min-h-[44px] justify-center border rounded-xs cursor-pointer ${
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
                        <span className="text-[10px] text-neutral-600">Pay when delivered</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handlePlaceOrder}
                      className="w-full min-h-[44px] py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none tabular-nums"
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
              <h3 className="font-serif text-base font-semibold text-neutral-900 border-b border-[#E8E2D9] pb-3 tabular-nums">
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
                      <p className="text-xs font-serif font-medium text-neutral-900 line-clamp-2 leading-snug break-words">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 tabular-nums">
                        Qty: {item.quantity} {item.selectedColor && `• ${item.selectedColor}`}
                      </p>
                      <p className="text-xs font-bold text-[#541920] mt-1 tabular-nums">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-3 border-t border-[#E8E2D9] tabular-nums">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-medium text-neutral-900 tabular-nums">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-neutral-900 tabular-nums">
                    {totalShippingFee === 0 ? (
                      <span className="font-bold text-[#15803D]">FREE</span>
                    ) : (
                      formatPrice(totalShippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-bold text-neutral-900 pt-2 border-t border-[#E8E2D9]">
                  <span>Total Amount</span>
                  <span className="text-[#541920] tabular-nums">{formatPrice(effectiveTotal)}</span>
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
