"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  RotateCcw, 
  ShieldCheck, 
  Truck, 
  CheckCircle, 
  Clock, 
  PackageCheck,
  AlertCircle,
  Info
} from "lucide-react";

export interface ReturnableSampleItem {
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

export interface RawReturnableSampleItem {
  orderId: string;
  orderDate: string;
  deliveredDate: string;
  productName: string;
  fabric: string;
  price: string;
  image: string;
}

export const RETURN_WINDOW_DAYS = 7;

export interface ReturnEligibility {
  daysLeft: number;
  status: "Eligible" | "Window Expired";
  isEligible: boolean;
}

/**
 * Parses date string in "DD MMM YYYY" (e.g. "06 Oct 2026") or standard ISO format.
 */
export function parseDeliveredDate(dateInput: string | Date): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  const trimmed = dateInput.trim();
  const dmyMatch = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s-]+(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthStr = dmyMatch[2].toLowerCase();
    const year = parseInt(dmyMatch[3], 10);
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      january: 0, february: 1, march: 2, april: 3, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
    };
    const month = months[monthStr];
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Computes return eligibility and remaining calendar days from the delivery date.
 * Based on the policy of 7 calendar days from delivery date.
 */
export function computeReturnEligibility(
  deliveredDateInput: string | Date,
  referenceDateInput: Date | string = new Date(),
  windowDays: number = RETURN_WINDOW_DAYS
): ReturnEligibility {
  const delivered = parseDeliveredDate(deliveredDateInput);
  if (!delivered) {
    return { daysLeft: 0, status: "Window Expired", isEligible: false };
  }

  const referenceDate =
    typeof referenceDateInput === "string"
      ? parseDeliveredDate(referenceDateInput) || new Date()
      : referenceDateInput;

  // Normalize both dates to midnight local calendar day
  const deliveredMidnight = new Date(
    delivered.getFullYear(),
    delivered.getMonth(),
    delivered.getDate()
  ).getTime();

  const referenceMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  ).getTime();

  const diffMs = referenceMidnight - deliveredMidnight;
  const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingDays = windowDays - elapsedDays;

  if (remainingDays > 0) {
    return {
      daysLeft: remainingDays,
      status: "Eligible",
      isEligible: true,
    };
  }

  return {
    daysLeft: 0,
    status: "Window Expired",
    isEligible: false,
  };
}

export const SAMPLE_RAW_ITEMS: RawReturnableSampleItem[] = [
  {
    orderId: "PAL-2026-8912",
    orderDate: "03 Oct 2026",
    deliveredDate: "06 Oct 2026",
    productName: "Wine Tissue Silk Saree",
    fabric: "Pure Tissue Silk with Zari Work",
    price: "₹3,999",
    image: "/images/products/wine-tissue-silk.jpg",
  },
  {
    orderId: "PAL-2026-8745",
    orderDate: "28 Sep 2026",
    deliveredDate: "01 Oct 2026",
    productName: "Mustard Cotton Silk Saree",
    fabric: "Chanderi Cotton Silk Weave",
    price: "₹2,899",
    image: "/images/products/mustard-cotton-saree.jpg",
  },
];

export function getSampleReturnableItems(
  referenceDate?: Date | string,
  rawItems: RawReturnableSampleItem[] = SAMPLE_RAW_ITEMS
): ReturnableSampleItem[] {
  return rawItems.map((item) => {
    const { status, daysLeft } = computeReturnEligibility(item.deliveredDate, referenceDate);
    return {
      ...item,
      status,
      daysLeft,
    };
  });
}

export const SAMPLE_RETURNABLE_ITEMS: ReturnableSampleItem[] = getSampleReturnableItems();

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
    title: "Quality Check & Refund / Dispatch",
    description: "Upon atelier quality check (unworn, intact Silk Mark tags), replacement is dispatched or refund is credited within 24–48 hours.",
    icon: <PackageCheck className="w-5 h-5 text-[#C5A575]" />,
  },
];

export interface OrderReturnsClientProps {
  currentDate?: Date | string;
  initialItems?: ReturnableSampleItem[];
}

export const OrderReturnsClient: React.FC<OrderReturnsClientProps> = ({
  currentDate,
  initialItems,
}) => {
  const [requestedOrders, setRequestedOrders] = useState<string[]>([]);

  const returnableItems = useMemo(() => {
    if (initialItems) return initialItems;
    return getSampleReturnableItems(currentDate);
  }, [currentDate, initialItems]);

  const handleRequestReturn = (orderId: string) => {
    setRequestedOrders((prev) => (prev.includes(orderId) ? prev : [...prev, orderId]));
  };

  const handleResetReturn = (orderId: string) => {
    setRequestedOrders((prev) => prev.filter((id) => id !== orderId));
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <h2 className="text-xs uppercase tracking-widest text-neutral-700 font-semibold">
              Recent Delivered Orders Eligible for Return
            </h2>
            <span className="text-[11px] text-neutral-500 font-sans">
              Showing recent shipments (Demo workflow)
            </span>
          </div>

          <div className="p-3.5 bg-[#F4EFE6] border border-[#C5A575]/40 rounded-xs text-xs text-neutral-800 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-semibold text-neutral-900 block">Demonstration Workflow</span>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                The sample orders below demonstrate the return request experience. Actions here are local simulations and are not submitted to a live returns queue. To process a real return or exchange, contact our concierge team directly.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {returnableItems.map((item, idx) => {
              const isRequested = requestedOrders.includes(item.orderId);
              return (
                <div
                  key={idx}
                  className="bg-white rounded-sm border border-[#E8E2D9] p-4 sm:p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                              <span>
                                {item.daysLeft} {item.daysLeft === 1 ? "day" : "days"} left to return
                              </span>
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

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#E8E2D9] shrink-0 gap-2">
                      {item.status === "Eligible" ? (
                        isRequested ? (
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="min-h-[44px] px-3.5 py-2 bg-[#541920]/10 text-[#541920] text-xs uppercase tracking-wider font-semibold rounded-xs inline-flex items-center gap-1.5">
                              <CheckCircle className="w-4 h-4 text-[#541920]" aria-hidden="true" />
                              <span>Demo Simulated</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleResetReturn(item.orderId)}
                              className="min-h-[44px] px-2 py-1 text-[11px] font-semibold text-[#541920] hover:underline uppercase tracking-wider cursor-pointer inline-flex items-center focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-2xs"
                            >
                              Reset Demo
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRequestReturn(item.orderId)}
                            className="min-h-[44px] px-4 py-2 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                          >
                            Simulate Return Request
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

                  {isRequested && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="mt-3 p-3 bg-[#FAF7F2] border border-[#E8E2D9] rounded-xs text-xs text-neutral-900 space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-semibold text-[#541920]">
                        <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span>Demo Return Simulation for Order #{item.orderId}</span>
                      </div>
                      <p className="text-neutral-600 text-[11px] leading-relaxed">
                        This is a demo store; no return request was transmitted or saved. For genuine return or exchange assistance, please email{" "}
                        <a href="mailto:info@palluvo.store" className="underline text-[#541920] font-medium">
                          info@palluvo.store
                        </a>
                        , call{" "}
                        <a href="tel:+918498854323" className="underline text-[#541920] font-medium">
                          +91 84988 54323
                        </a>
                        , or message on{" "}
                        <a
                          href="https://wa.me/918498854323"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#075E54] hover:text-[#054C44] font-medium"
                        >
                          WhatsApp
                        </a>
                        .
                      </p>
                    </div>
                  )}
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
