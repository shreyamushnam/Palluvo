import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Phone, 
  HelpCircle,
  Clock,
  Sparkles
} from "lucide-react";

export const metadata: Metadata = {
  title: "Checkout Assistance & Payment Guide | PALLUVO",
  description: "Comprehensive assistance for payment security, insured shipping timelines, Silk Mark verification, and concierge support at PALLUVO.",
  alternates: {
    canonical: "/checkout/help",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const HELP_SECTIONS = [
  {
    icon: <CreditCard className="w-5 h-5 text-[#541920]" />,
    title: "Payment Security & Accepted Methods",
    items: [
      {
        question: "Which payment options are supported?",
        answer: "We support instant UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards (Visa, MasterCard, RuPay, Amex), Net Banking across 50+ Indian banks, and flexible zero-cost EMI plans on eligible cards."
      },
      {
        question: "Is my payment transaction secure?",
        answer: "All transactions are secured with 256-bit bank-grade TLS encryption and RBI-mandated two-factor authentication (2FA/OTP). PALLUVO never stores your complete card details or banking credentials."
      },
      {
        question: "What should I do if money was debited but the order shows pending?",
        answer: "If your bank debited the amount during network timeout, bank gateways auto-reconcile within 2 hours. If your order isn't confirmed, the debited sum reverses automatically to your source account within 2-4 business days."
      }
    ]
  },
  {
    icon: <Truck className="w-5 h-5 text-[#541920]" />,
    title: "Insured Delivery & Shipping Timelines",
    items: [
      {
        question: "How long does shipping take?",
        answer: "Standard Insured Delivery arrives in 3–5 business days across metros and 5–7 days across other Indian pin codes. Express shipments are dispatched directly from our regional atelier studios with real-time SMS and email tracking."
      },
      {
        question: "Is high-value bridal silk insured during transit?",
        answer: "Yes, every PALLUVO consignment is 100% transit-insured and packaged in tamper-evident, moisture-resistant luxury boxes with unique security void seals."
      },
      {
        question: "Do you offer complimentary shipping?",
        answer: "All domestic orders over ₹1,999 qualify for complimentary insured courier delivery."
      }
    ]
  },
  {
    icon: <Sparkles className="w-5 h-5 text-[#C5A575]" />,
    title: "Silk Mark & Authenticity Assurance",
    items: [
      {
        question: "How do I know my saree is authentic pure silk?",
        answer: "Each PALLUVO pure silk saree comes tagged with an official Silk Mark Organisation of India (SMOI) hologram and a unique QR code verifying weaver studio provenance and pure natural silk thread purity."
      },
      {
        question: "What is your return and exchange policy?",
        answer: "We provide a 7-day hassle-free return and exchange window. Sarees must remain unworn, unwashed, with all original security tags, Silk Mark labels, and packaging intact."
      }
    ]
  },
  {
    icon: <Phone className="w-5 h-5 text-[#541920]" />,
    title: "Stylist & Concierge Contact",
    items: [
      {
        question: "Can I receive live video styling or drape assistance?",
        answer: "Our senior sari concierge can guide you through weave selections, custom blouse styling, and matching jewelry via WhatsApp video consultation during atelier hours (10:00 AM – 8:00 PM IST)."
      },
      {
        question: "Direct Support Channels",
        answer: "Reach our concierge team directly at contact@palluvo.com or call / WhatsApp +91 84988 54323 / +91 81067 89789 for priority checkout help."
      }
    ]
  }
];

export default function CheckoutHelpPage() {
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
                <Link href="/checkout" className="hover:text-[#541920] transition-colors">
                  Checkout
                </Link>
              </li>
              <li aria-hidden="true">•</li>
              <li className="text-neutral-900 font-semibold" aria-current="page">
                Help & Assistance
              </li>
            </ol>
          </nav>

          <Link
            href="/checkout"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#541920] hover:text-[#3D1217] hover:underline transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Checkout</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 sm:mb-10 text-center sm:text-left">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#541920] font-semibold block mb-1">
            Customer Care & Guidance
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-neutral-900 tracking-tight">
            Checkout Assistance & FAQs
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-2xl font-sans leading-relaxed">
            Everything you need to know about completing your purchase, payment security, insured courier delivery, and atelier support.
          </p>
        </div>

        {/* Support Grid Sections */}
        <div className="space-y-6 sm:space-y-8">
          {HELP_SECTIONS.map((section, sIdx) => (
            <div
              key={sIdx}
              className="bg-white rounded-sm border border-[#E8E2D9] p-5 sm:p-7 shadow-xs"
            >
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#E8E2D9]">
                <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center shrink-0">
                  {section.icon}
                </div>
                <h2 className="text-base sm:text-lg font-serif font-medium text-neutral-900">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-4">
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 font-sans flex items-start gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-[#541920] mt-0.5 shrink-0" />
                      <span>{item.question}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 font-sans pl-5 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA to Resume Checkout */}
        <div className="mt-10 p-6 sm:p-8 bg-[#F4EFE6] border border-[#DCD5C9] rounded-sm text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#541920]">
            <Clock className="w-4 h-4" />
            <span>Ready to complete your order?</span>
          </div>
          <h2 className="text-lg sm:text-xl font-serif font-medium text-neutral-900">
            Your Cart Items Are Reserved
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
            Return to the checkout window to verify your address, select payment, and place your order.
          </p>
          <div className="pt-2">
            <Link
              href="/checkout"
              className="min-h-[44px] px-8 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
            >
              <span>Continue to Checkout</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
