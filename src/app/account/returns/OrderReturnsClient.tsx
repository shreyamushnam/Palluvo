"use client";

import React, { useState, useEffect, useMemo } from "react";
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

export type ReturnEligibilityStatus = "Eligible" | "Window Expired" | "Delivery Pending";

export interface ReturnableSampleItem {
  orderId: string;
  orderDate: string;
  deliveredDate: string;
  productName: string;
  fabric: string;
  price: string;
  image: string;
  status: ReturnEligibilityStatus;
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
export const POLICY_TIMEZONE = "Asia/Kolkata";
export const DEFAULT_DEMO_REFERENCE_DATE = "2026-10-12";

export interface CalendarDateParts {
  year: number;
  month: number; // 1-12
  day: number;   // 1-31
}

export interface ReturnEligibility {
  daysLeft: number;
  status: ReturnEligibilityStatus;
  isEligible: boolean;
}

/**
 * Determines whether a given Gregorian year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the maximum number of days in a given Gregorian month (1-12) for a given year.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if (month === 4 || month === 6 || month === 9 || month === 11) {
    return 30;
  }
  return 31;
}

/**
 * Validates whether the year, month, and day represent a valid Gregorian calendar date.
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (year < 1 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInMonth(year, month);
  return day >= 1 && day <= maxDays;
}

/**
 * Extracts calendar date parts (year, month, day) from a Date instance
 * in the brand's policy timezone (Asia/Kolkata), avoiding local client DST / offset shifts.
 */
export function getCalendarPartsFromDate(
  date: Date,
  timeZone: string = POLICY_TIMEZONE
): CalendarDateParts {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.formatToParts(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    for (const part of parts) {
      if (part.type === "year") year = parseInt(part.value, 10);
      if (part.type === "month") month = parseInt(part.value, 10);
      if (part.type === "day") day = parseInt(part.value, 10);
    }
    return { year, month, day };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
}

/**
 * Parses calendar dates from date-only ISO strings (e.g. "2026-10-06"),
 * localized formats ("06 Oct 2026"), or Date objects into explicit calendar components.
 * Date-only ISO components are extracted directly to avoid JavaScript's default
 * UTC-midnight interpretation shifting the date in western timezones (e.g. Los Angeles).
 * Rejects impossible calendar dates (e.g. 2026-02-31) rather than letting Date.UTC normalize them.
 */
export function parseToCalendarDate(
  input: string | Date | null | undefined,
  timeZone: string = POLICY_TIMEZONE
): CalendarDateParts | null {
  if (!input) return null;
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    const parts = getCalendarPartsFromDate(input, timeZone);
    if (!isValidCalendarDate(parts.year, parts.month, parts.day)) return null;
    return parts;
  }

  const trimmed = String(input).trim();
  if (!trimmed) return null;

  // 1. Date-only ISO format: YYYY-MM-DD
  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoDateMatch) {
    const year = parseInt(isoDateMatch[1], 10);
    const month = parseInt(isoDateMatch[2], 10);
    const day = parseInt(isoDateMatch[3], 10);
    if (isValidCalendarDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  // 2. Formats like "06 Oct 2026" or "6 October 2026"
  const dmyMatch = trimmed.match(/^(\d{1,2})[\s-]+([A-Za-z]+)[\s-]+(\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const monthStr = dmyMatch[2].toLowerCase();
    const year = parseInt(dmyMatch[3], 10);
    const months: Record<string, number> = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
      january: 1, february: 2, march: 3, april: 4, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };
    const month = months[monthStr];
    if (month !== undefined && isValidCalendarDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  // 3. Formats like "Oct 12, 2026" or "October 12, 2026"
  const mdyMatch = trimmed.match(/^([A-Za-z]+)[\s-]+(\d{1,2}),?[\s-]+(\d{4})$/);
  if (mdyMatch) {
    const monthStr = mdyMatch[1].toLowerCase();
    const day = parseInt(mdyMatch[2], 10);
    const year = parseInt(mdyMatch[3], 10);
    const months: Record<string, number> = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
      january: 1, february: 2, march: 3, april: 4, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
    };
    const month = months[monthStr];
    if (month !== undefined && isValidCalendarDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  // 4. ISO prefix validation to reject impossible dates in timestamp strings (e.g. "2026-02-31T00:00:00Z")
  const isoPrefix = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoPrefix) {
    const y = parseInt(isoPrefix[1], 10);
    const m = parseInt(isoPrefix[2], 10);
    const d = parseInt(isoPrefix[3], 10);
    if (!isValidCalendarDate(y, m, d)) {
      return null;
    }
  }

  // 5. Fallback for strings containing ISO timestamp with time or other parseable formats
  const parsedInstant = new Date(trimmed);
  if (!isNaN(parsedInstant.getTime())) {
    const isoStart = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!trimmed.includes("T") && isoStart) {
      const y = parseInt(isoStart[1], 10);
      const m = parseInt(isoStart[2], 10);
      const d = parseInt(isoStart[3], 10);
      if (isValidCalendarDate(y, m, d)) {
        return { year: y, month: m, day: d };
      }
      return null;
    }
    const parts = getCalendarPartsFromDate(parsedInstant, timeZone);
    if (isValidCalendarDate(parts.year, parts.month, parts.day)) {
      return parts;
    }
  }

  return null;
}

/**
 * Converts calendar date parts to integer day number since Unix epoch (1970-01-01).
 * Completely immune to timezone offsets and DST transitions.
 * Returns NaN if parts do not represent a valid calendar date.
 */
export function calendarDateToOrdinal(parts: CalendarDateParts): number {
  if (!parts || !isValidCalendarDate(parts.year, parts.month, parts.day)) {
    return NaN;
  }
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / 86400000);
}

/**
 * Shifts a calendar date by integer offsetDays.
 */
export function shiftCalendarDate(base: CalendarDateParts, offsetDays: number): CalendarDateParts {
  const baseOrdinal = calendarDateToOrdinal(base);
  if (isNaN(baseOrdinal)) {
    return base;
  }
  const targetUtcMs = (baseOrdinal + offsetDays) * 86400000;
  const d = new Date(targetUtcMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

/**
 * Formats a calendar date as "DD MMM YYYY" (e.g. "06 Oct 2026").
 */
export function formatCalendarDate(parts: CalendarDateParts): string {
  if (!isValidCalendarDate(parts.year, parts.month, parts.day)) {
    return "";
  }
  const day = String(parts.day).padStart(2, "0");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = monthNames[parts.month - 1] || "Jan";
  return `${day} ${m} ${parts.year}`;
}

/**
 * Parses date input into a Date instance invariant across timezones (anchored to noon UTC).
 */
export function parseDeliveredDate(dateInput: string | Date): Date | null {
  const parts = parseToCalendarDate(dateInput);
  if (!parts) return null;
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
}

/**
 * Calculates milliseconds remaining until the next calendar day boundary (midnight)
 * in the brand's policy timezone (Asia/Kolkata).
 */
export function getMillisecondsUntilNextPolicyMidnight(
  now: Date = new Date(),
  timeZone: string = POLICY_TIMEZONE
): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      fractionalSecondDigits: 3,
    });
    const parts = formatter.formatToParts(now);
    let hour = 0;
    let minute = 0;
    let second = 0;
    let millisecond = 0;
    for (const p of parts) {
      if (p.type === "hour") hour = parseInt(p.value, 10);
      if (p.type === "minute") minute = parseInt(p.value, 10);
      if (p.type === "second") second = parseInt(p.value, 10);
      if (p.type === "fractionalSecond") millisecond = parseInt(p.value, 10);
    }
    const elapsedMs = ((hour * 3600) + (minute * 60) + second) * 1000 + millisecond;
    const remainingMs = 86400000 - elapsedMs;
    return Math.max(1000, remainingMs + 250);
  } catch {
    return 3600000;
  }
}

/**
 * Computes return eligibility and remaining calendar days from the delivery date.
 * Compares pure calendar-day ordinals in the policy timezone, avoiding fixed 24h divisions across DST boundaries.
 * Defaults referenceDateInput to current Date() so standard runtime callers evaluate live eligibility.
 * Fails closed (isEligible: false) if either date is invalid or impossible.
 */
export function computeReturnEligibility(
  deliveredDateInput: string | Date,
  referenceDateInput: Date | string = new Date(),
  windowDays: number = RETURN_WINDOW_DAYS
): ReturnEligibility {
  const deliveredParts = parseToCalendarDate(deliveredDateInput);
  if (!deliveredParts) {
    return { daysLeft: 0, status: "Window Expired", isEligible: false };
  }

  const referenceParts = parseToCalendarDate(referenceDateInput);
  if (!referenceParts) {
    return { daysLeft: 0, status: "Window Expired", isEligible: false };
  }

  const deliveredOrdinal = calendarDateToOrdinal(deliveredParts);
  const referenceOrdinal = calendarDateToOrdinal(referenceParts);

  if (isNaN(deliveredOrdinal) || isNaN(referenceOrdinal)) {
    return { daysLeft: 0, status: "Window Expired", isEligible: false };
  }

  const elapsedDays = referenceOrdinal - deliveredOrdinal;

  // An order scheduled for a future delivery date is pending delivery and cannot yet be returned
  if (elapsedDays < 0) {
    return {
      daysLeft: 0,
      status: "Delivery Pending",
      isEligible: false,
    };
  }

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

/**
 * Creates demonstration orders dynamically relative to the reference date.
 * Keeps an eligible order (delivered 3 days ago, 4 days remaining) and an expired order
 * (delivered 11 days ago, window closed) so that demo return workflows are always exerciseable.
 * Defaults to current Date() for live evaluation, or accepts an explicit fixture date.
 */
export function createSampleRawItems(
  referenceDateInput: Date | string = new Date()
): RawReturnableSampleItem[] {
  const refParts =
    parseToCalendarDate(referenceDateInput) ||
    getCalendarPartsFromDate(new Date());

  // Eligible order: delivered 3 calendar days ago, ordered 6 days ago (4 days left in 7-day window)
  const deliveredEligible = shiftCalendarDate(refParts, -3);
  const orderedEligible = shiftCalendarDate(refParts, -6);

  // Expired order: delivered 11 calendar days ago, ordered 15 days ago (window closed)
  const deliveredExpired = shiftCalendarDate(refParts, -11);
  const orderedExpired = shiftCalendarDate(refParts, -15);

  return [
    {
      orderId: "PAL-2026-8912",
      orderDate: formatCalendarDate(orderedEligible),
      deliveredDate: formatCalendarDate(deliveredEligible),
      productName: "Wine Tissue Silk Saree",
      fabric: "Pure Tissue Silk with Zari Work",
      price: "₹3,999",
      image: "/images/products/wine-tissue-silk.jpg",
    },
    {
      orderId: "PAL-2026-8745",
      orderDate: formatCalendarDate(orderedExpired),
      deliveredDate: formatCalendarDate(deliveredExpired),
      productName: "Mustard Cotton Silk Saree",
      fabric: "Chanderi Cotton Silk Weave",
      price: "₹2,899",
      image: "/images/products/mustard-cotton-saree.jpg",
    },
  ];
}

export const SAMPLE_RAW_ITEMS: RawReturnableSampleItem[] = createSampleRawItems(DEFAULT_DEMO_REFERENCE_DATE);

export function getSampleReturnableItems(
  referenceDate: Date | string = new Date(),
  rawItems?: RawReturnableSampleItem[]
): ReturnableSampleItem[] {
  const effectiveRaw =
    rawItems && rawItems.length > 0
      ? rawItems
      : createSampleRawItems(referenceDate);

  return effectiveRaw.map((item) => {
    const { status, daysLeft } = computeReturnEligibility(item.deliveredDate, referenceDate);
    return {
      ...item,
      status,
      daysLeft,
    };
  });
}

export const SAMPLE_RETURNABLE_ITEMS: ReturnableSampleItem[] = getSampleReturnableItems(DEFAULT_DEMO_REFERENCE_DATE);

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

  // Keep server HTML and first client hydration render identical by using
  // the deterministic reference date when currentDate is omitted.
  const [activeDate, setActiveDate] = useState<Date | string>(
    currentDate ?? DEFAULT_DEMO_REFERENCE_DATE
  );

  // Synchronize and refresh activeDate:
  // 1. If currentDate prop is provided, keep synced to it.
  // 2. If currentDate is omitted, refresh to live date upon hydration,
  //    and keep refreshed at:
  //    - Policy-timezone day boundaries (midnight in Asia/Kolkata)
  //    - Document visibility change (when customer switches back to this tab)
  //    - Window focus
  //    - Periodic safety interval (every 30 seconds) to guard against backgrounded tabs
  useEffect(() => {
    if (currentDate) {
      setActiveDate(currentDate);
      return;
    }

    const refreshLiveDate = () => {
      const now = new Date();
      setActiveDate((prev) => {
        if (!prev) return now;
        const prevParts = parseToCalendarDate(prev, POLICY_TIMEZONE);
        const nextParts = parseToCalendarDate(now, POLICY_TIMEZONE);
        if (
          prevParts &&
          nextParts &&
          prevParts.year === nextParts.year &&
          prevParts.month === nextParts.month &&
          prevParts.day === nextParts.day
        ) {
          return prev;
        }
        return now;
      });
    };

    // Immediate refresh on hydration
    refreshLiveDate();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshLiveDate();
      }
    };

    const handleFocus = () => {
      refreshLiveDate();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    let midnightTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const scheduleMidnightTimer = () => {
      const delay = getMillisecondsUntilNextPolicyMidnight(new Date(), POLICY_TIMEZONE);
      midnightTimeoutId = setTimeout(() => {
        refreshLiveDate();
        scheduleMidnightTimer();
      }, delay);
    };
    scheduleMidnightTimer();

    const intervalId = setInterval(() => {
      refreshLiveDate();
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      if (midnightTimeoutId) clearTimeout(midnightTimeoutId);
      clearInterval(intervalId);
    };
  }, [currentDate]);

  const returnableItems = useMemo(() => {
    if (initialItems) {
      return initialItems.map((item) => {
        const { status, daysLeft } = computeReturnEligibility(item.deliveredDate, activeDate);
        return {
          ...item,
          status,
          daysLeft,
        };
      });
    }
    return getSampleReturnableItems(activeDate);
  }, [activeDate, initialItems]);

  const handleRequestReturn = (orderId: string) => {
    const liveDate = currentDate ?? new Date();
    const item = returnableItems.find((i) => i.orderId === orderId);
    if (!item) return;

    // Revalidate eligibility immediately before enabling / simulating the action
    const currentEligibility = computeReturnEligibility(item.deliveredDate, liveDate);
    if (!currentEligibility.isEligible) {
      if (!currentDate) {
        setActiveDate(liveDate);
      }
      return;
    }

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
            Every PALLUVO drape and handcrafted accessory is backed by our 7-day complimentary reverse pickup policy. We ensure your return or exchange is seamless and transparent.
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
                    <span className="text-xs font-mono font-bold text-neutral-600">
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

          {returnableItems.length > 0 && returnableItems.every((item) => item.status !== "Eligible") && (
            <div
              role="status"
              className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xs text-xs text-neutral-800 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <span className="font-semibold text-neutral-900 block">
                  {returnableItems.every((item) => item.status === "Delivery Pending")
                    ? "All Listed Shipments Are Pending Delivery"
                    : returnableItems.every((item) => item.status === "Window Expired")
                    ? "All Listed Shipments Have Passed the 7-Day Return Window"
                    : "No Listed Shipments Currently Eligible for Return"}
                </span>
                <p className="text-neutral-600 text-[11px] leading-relaxed font-sans">
                  {returnableItems.every((item) => item.status === "Delivery Pending")
                    ? "The listed shipments have not yet been delivered. Orders can be returned within 7 days once delivery is completed."
                    : "The stated 7-day return period has elapsed or shipments are awaiting delivery for the current orders. In this demonstration, contact our concierge team directly or supply a recent delivered shipment date to simulate an eligible return."}
                </p>
              </div>
            </div>
          )}

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
                          ) : item.status === "Delivery Pending" ? (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-2xs inline-flex items-center gap-1 border border-amber-200/60">
                              <Clock className="w-3 h-3" />
                              <span>Delivery Pending</span>
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
                          {item.fabric} • {item.status === "Delivery Pending" ? `Expected on ${item.deliveredDate}` : `Delivered on ${item.deliveredDate}`}
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
                          {item.status === "Delivery Pending" ? "Delivery Pending" : "Return Closed"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Always-mounted live region for screen readers */}
                  <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                    <span>
                      {isRequested
                        ? `Demo Return Simulation for Order #${item.orderId}. This is a demo store; no return request was transmitted or saved.`
                        : ""}
                    </span>
                  </div>

                  {isRequested && (
                    <div
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
        <section aria-labelledby="conditions-heading" className="bg-[#FAF7F2] rounded-sm border border-[#E8E2D9] p-5 sm:p-6 mb-8 space-y-3">
          <h2 id="conditions-heading" className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#541920]">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            <span>Important Condition Requirements by Product Type</span>
          </h2>
          <ul className="text-xs text-neutral-600 font-sans space-y-1.5 list-disc pl-5 leading-relaxed">
            <li><strong>Sarees:</strong> Must be unworn, undamaged, unwashed, and in original folded condition with all Silk Mark Organisation tags, security loops, and attached blouse pieces intact.</li>
            <li><strong>Separate Blouse Pieces:</strong> Must remain unstitched, uncut, unwashed, and in original protective wrap with tags intact.</li>
            <li><strong>Jewelry & Accessories:</strong> Must remain unworn with tamper-evident security seals, hygiene tags, and original protective keepsake pouch intact.</li>
            <li>Original wooden keepsake box or luxury packaging must be returned during reverse pickup.</li>
            <li>Refunds are credited to original payment source (UPI / Cards / Bank) within 24–48 hours of quality inspection.</li>
          </ul>
        </section>

        {/* Concierge Help Callout */}
        <section aria-labelledby="concierge-heading" className="p-5 sm:p-6 bg-white border border-[#E8E2D9] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h2 id="concierge-heading" className="text-sm font-serif font-medium text-neutral-900">
              Need personalized return or exchange help?
            </h2>
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
        </section>

      </div>
    </div>
  );
};
