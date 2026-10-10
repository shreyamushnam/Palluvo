"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, X, Copy, Check, ArrowRight, Gift } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";

export const OfferWelcomeModal: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Greet the member once per session upon signing in
  useEffect(() => {
    if (isLoggedIn) {
      const hasSeen = typeof window !== "undefined" ? sessionStorage.getItem("palluvo_welcome_offer_seen") : null;
      if (!hasSeen) {
        setIsOpen(true);
      }
    }
  }, [isLoggedIn]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("palluvo_welcome_offer_seen", "true");
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen,
    onClose: handleClose,
  });

  const handleCopyAndShop = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText("PALLUVO10");
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
    setCopied(true);
    showToast("Promotional code PALLUVO10 copied! Enjoy 10% off.");
    handleClose();
    router.push("/shop");
  };

  const handleManualCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText("PALLUVO10");
      }
    } catch {
      // Fallback
    }
    setCopied(true);
    showToast("Promotional code PALLUVO10 copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-offer-title"
      aria-describedby="welcome-offer-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto outline-none animate-in fade-in duration-200"
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-[#1C1A18] text-[#FAF7F2] rounded-md border border-[#C5A575]/40 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Subtle Decorative Golden Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C5A575]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#541920]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Header Strip & Close Button */}
        <div className="relative px-6 pt-5 pb-0 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C5A575]/15 border border-[#C5A575]/30 text-[#C5A575] text-[10px] sm:text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3 h-3 text-[#C5A575] shrink-0" aria-hidden="true" />
            <span>Member Privilege</span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close welcome offer"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 -mt-1 inline-flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative p-6 sm:p-8 space-y-5">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#541920]/40 border border-[#C5A575]/30 flex items-center justify-center text-[#C5A575] mb-3">
              <Gift className="w-6 h-6 text-[#C5A575]" aria-hidden="true" />
            </div>

            <h2
              id="welcome-offer-title"
              className="text-2xl sm:text-3xl font-serif font-medium text-[#FAF7F2] tracking-tight"
            >
              Welcome to PALLUVO
            </h2>

            <p
              id="welcome-offer-description"
              className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto font-sans leading-relaxed"
            >
              Enjoy an exclusive <strong className="text-[#C5A575] font-semibold">10% discount</strong> and complimentary express delivery on your first order of handwoven luxury sarees.
            </p>
          </div>

          {/* Coupon Code Presentation Box */}
          <div className="bg-[#24211D] border border-[#C5A575]/35 rounded-sm p-4 sm:p-5 text-center space-y-3">
            <div className="text-[11px] uppercase tracking-wider text-neutral-300 font-medium">
              Promotional Coupon Code
            </div>

            <div className="flex items-center justify-between gap-3 bg-[#161412] border border-[#C5A575]/50 px-4 py-2.5 rounded-xs">
              <span className="font-mono text-base sm:text-lg tracking-widest text-[#C5A575] font-bold select-all">
                PALLUVO10
              </span>

              <button
                type="button"
                onClick={handleManualCopy}
                className="min-h-[36px] px-3 py-1 bg-[#C5A575]/15 hover:bg-[#C5A575]/30 text-[#C5A575] text-xs font-semibold rounded-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-[#C5A575]/40 focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none"
                aria-label="Copy code PALLUVO10"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" aria-hidden="true" />
                    <span className="text-green-400 font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="font-sans">Copy</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-neutral-400 font-sans">
              10% OFF + Free Express Shipping on orders above ₹1,999
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyAndShop}
              className="w-full min-h-[48px] px-6 py-3.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#C5A575] focus-visible:outline-none"
            >
              <span>Copy Code & Shop Now</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleClose}
                className="min-h-[44px] px-4 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer inline-flex items-center justify-center underline-offset-4 hover:underline"
              >
                Continue browsing
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
