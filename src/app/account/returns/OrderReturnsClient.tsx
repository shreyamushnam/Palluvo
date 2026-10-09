"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  RotateCcw, 
  ShieldCheck, 
  Truck, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  HelpCircle,
  PackageCheck,
  AlertCircle
} from "lucide-react";

interface ReturnableSampleItem {
  orderId: string;
  orderDate: string;
  deliveredDate: string;
  productName: string;
  fabric: string;
  price: string;
  image: string;
  status: "Eligible" | "Window Expired";
  daysLeft: number;
}

const SAMPLE_RETURNABLE_ITEMS: ReturnableSampleItem[] = [
  {
    orderId: "PAL-2026-8912",
    orderDate: "03 Oct 2026",
    deliveredDate: "06 Oct 2026",
    productName: "Wine Tissue Silk Saree",
    fabric: "Pure Tissue Silk with Zari Work",
    price: "₹3,999",
    image: "/images/products/wine-tissue-silk.jpg",
    status: "Eligible",
    daysLeft: 4,
  },
  {
    orderId: "PAL-2026-8745",
    orderDate: "28 Sep 2026",
    deliveredDate: "01 Oct 2026",
    productName: "Mustard Cotton Silk Saree",
    fabric: "Chanderi Cotton Silk Weave",
    price: "₹2,899",
    image: "/images/products/mustard-cotton-saree.jpg",
    status: "Window Expired",
    daysLeft: 0,
  },
];

const RETURN_STEPS = [
  {
    step: "01",
    title: "Initiate Request",
    description: "Select the delivered saree and tell us if you prefer a size/color exchange or full refund to source account.",
    icon: <RotateCcw className="w-5 h-5 text-[#541920]" />,
  },
  {
    step: "02",
    title: "Free Doorstep Pickup",
    description: "Our dedicated courier partner collects the package from your address with tamper-proof reverse packaging.",
    icon: <Truck className="w-5 h-5 text-[#541920]" />,
  },
  {
    step: "03",
    title: "Instant Refund / Dispatch",
    description: "Upon atelier quality check (unworn, intact Silk Mark tags), replacement is dispatched or refund is credited within 24 hours.",
    icon: <PackageCheck className="w-5 h-5 text-[#C5A575]" />,
  },
];

export const OrderReturnsClient: React.FC = () => {
  const [requestedOrders, setRequestedOrders] = useState<string[]>([]);

  const handleRequestReturn = (orderId: string, productName: string) => {
    setRequestedOrders((prev) => [...prev, orderId]);
    alert(`Return request submitted for Order #${orderId} (${productName}). A concierge agent will confirm pickup details via SMS & WhatsApp.`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 pb-4 border-b border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-neutral-600 font-sans">
              <li>
                <Link href="/" className="hover:text-[#541920] transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">•</li>
              <li>
                <Link href="/account" className="hover:text-[#541920] transition-colors">
                  My Account
                </Link>
              </li>
              <li aria-hidden="true">•</li>
              <li className="text-neutral-900 font-semibold" aria-current="page">
                Order Returns & Exchanges
              </li>
            </ol>
          </nav>

          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#541920] hover:text-[#3D1217] hover:underline transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Account</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#541920] font-semibold block mb-1">
            Hassle-Free Care & Guarantees
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-neutral-900 tracking-tight">
            Order Returns & Exchanges
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl font-sans leading-relaxed">
            Every PALLUVO drape is backed by our 7-day complimentary reverse pickup policy. We ensure your return or exchange is seamless and transparent.
          </p>
        </div>

        {/* 3-Step Journey Cards */}
        <div className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-neutral-700 font-semibold mb-4">
            How The Return Process Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RETURN_STEPS.map((s, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-sm border border-[#E8E2D9] shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center">
                      {s.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      STEP {s.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-serif font-medium text-neutral-900 mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Returnable Items Section */}
        <div className="space-y-4 mb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-neutral-700 font-semibold">
              Recent Delivered Orders Eligible for Return
            </h2>
            <span className="text-[11px] text-neutral-500 font-sans">
              Showing recent shipments
            </span>
          </div>

          <div className="space-y-3.5">
            {SAMPLE_RETURNABLE_ITEMS.map((item, idx) => {
              const isRequested = requestedOrders.includes(item.orderId);
              return (
                <div
                  key={idx}
                  className="bg-white rounded-sm border border-[#E8E2D9] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xs overflow-hidden bg-neutral-100 shrink-0 border border-[#E8E2D9]">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover object-top"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-semibold text-neutral-600 bg-[#FAF7F2] px-2 py-0.5 rounded-2xs border border-[#E8E2D9]">
                          Order #{item.orderId}
                        </span>
                        {item.status === "Eligible" ? (
                          <span className="text-[10px] font-semibold text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-2xs inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.daysLeft} days left to return</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-2xs inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>7-day window closed</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-serif font-medium text-neutral-900 leading-snug">
                        {item.productName}
                      </h3>
                      <p className="text-xs text-neutral-600 font-sans mt-0.5">
                        {item.fabric} • Delivered on {item.deliveredDate}
                      </p>
                      <p className="text-xs font-bold text-[#541920] mt-1 tabular-nums">
                        {item.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8E2D9] shrink-0">
                    {item.status === "Eligible" ? (
                      isRequested ? (
                        <div className="min-h-[44px] px-4 py-2 bg-[#15803D]/10 text-[#15803D] text-xs uppercase tracking-wider font-semibold rounded-xs inline-flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Request In Review</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRequestReturn(item.orderId, item.productName)}
                          className="min-h-[44px] px-4 py-2 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                        >
                          Request Return / Exchange
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="min-h-[44px] px-4 py-2 bg-neutral-100 text-neutral-400 text-xs uppercase tracking-wider font-semibold rounded-xs cursor-not-allowed"
                      >
                        Return Closed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quality & Policy Requirements */}
        <div className="bg-[#FAF7F2] rounded-sm border border-[#E8E2D9] p-5 sm:p-6 mb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#541920]">
            <ShieldCheck className="w-4 h-4" />
            <span>Important Condition Requirements</span>
          </div>
          <ul className="text-xs text-neutral-600 font-sans space-y-1.5 list-disc pl-5 leading-relaxed">
            <li>Sarees must be unworn, undamaged, unwashed, and in original folded condition.</li>
            <li>All original Silk Mark Organisation tags, security loops, and blouse pieces must remain attached.</li>
            <li>Original wooden keepsake box or luxury packaging must be returned during reverse pickup.</li>
            <li>Refunds are credited to original payment source (UPI / Cards / Bank) within 24–48 hours of quality inspection.</li>
          </ul>
        </div>

        {/* Concierge Help Callout */}
        <div className="p-5 sm:p-6 bg-white border border-[#E8E2D9] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-serif font-medium text-neutral-900">
              Need personalized return or exchange help?
            </h3>
            <p className="text-xs text-neutral-600">
              Our concierge team is available via WhatsApp or Phone to arrange custom pickup times.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/contact"
              className="min-h-[44px] px-4 py-2 inline-flex items-center justify-center border border-[#DCD5C9] hover:bg-[#FAF7F2] text-xs uppercase tracking-wider font-semibold text-neutral-800 rounded-xs transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/account"
              className="min-h-[44px] px-4 py-2 inline-flex items-center justify-center bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors"
            >
              My Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
