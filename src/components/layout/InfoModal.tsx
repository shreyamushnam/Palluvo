"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Phone, MapPin, Truck, RotateCcw, HelpCircle, BookOpen, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

export type InfoModalTab = "contact" | "shipping" | "returns" | "faqs" | "story" | "craftsmanship";

interface InfoModalProps {
  isOpen: boolean;
  initialTab?: InfoModalTab;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  initialTab = "contact",
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<InfoModalTab>(initialTab);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "Are all PALLUVO sarees authentic and Silk Mark certified?",
      a: "Yes. Every pure silk saree in our collection carries the official Silk Mark Organisation of India certification, verifying 100% natural pure silk fibers and tested zari threading.",
    },
    {
      q: "Does the saree come with a matching blouse piece?",
      a: "Yes, all our sarees include an unstitched 0.8-meter matching blouse fabric attached to the drape, woven with complementary borders or brocade work.",
    },
    {
      q: "How long does shipping take across India?",
      a: "Orders dispatch within 24 to 48 hours from our fulfillment ateliers. Delivery typically takes 2-4 business days for metro cities and 4-6 business days for rest of India.",
    },
    {
      q: "What is your return & exchange policy?",
      a: "We offer a hassle-free 7-day return and exchange policy from the delivery date. We provide doorstep reverse pickup across all serviced pin codes in India.",
    },
    {
      q: "How should I wash and store my luxury pure silk sarees?",
      a: "Always dry-clean your pure silk, tissue, and organza sarees. Store them wrapped in a breathable pure cotton or muslin bag, and refold periodically along original pleat lines.",
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactFormSubmitted(true);
    setTimeout(() => {
      setContactFormSubmitted(false);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-screen flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-4xl bg-[#FAF7F2] text-[#1C1A18] rounded-md shadow-2xl overflow-hidden border border-[#E8E2D9] animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Bar */}
          <div className="px-6 py-4 bg-[#F4EFE6] border-b border-[#E8E2D9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif-display text-xl font-medium tracking-[0.16em] uppercase text-[#541920]">
                PALLUVO
              </span>
              <span className="text-xs text-neutral-400">|</span>
              <span className="text-xs uppercase tracking-wider text-neutral-600 font-medium">
                Customer Concierge & Heritage
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-black hover:bg-neutral-200/60 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
            {/* Sidebar Tabs */}
            <div className="md:col-span-4 bg-[#EFEAE1]/60 p-4 border-b md:border-b-0 md:border-r border-[#E8E2D9] space-y-1">
              {[
                { id: "contact", label: "Contact Us", icon: Phone },
                { id: "shipping", label: "Shipping Policy", icon: Truck },
                { id: "returns", label: "Returns & Exchanges", icon: RotateCcw },
                { id: "faqs", label: "Frequently Asked Questions", icon: HelpCircle },
                { id: "story", label: "Our Story & Heritage", icon: BookOpen },
                { id: "craftsmanship", label: "Artisan Craftsmanship", icon: Sparkles },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as InfoModalTab)}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xs transition-colors text-left ${
                      isActive
                        ? "bg-[#541920] text-white shadow-xs"
                        : "text-neutral-700 hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="md:col-span-8 p-6 sm:p-8 max-h-[70vh] overflow-y-auto">
              
              {/* CONTACT US */}
              {activeTab === "contact" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-2xl text-neutral-900">Get in Touch with Us</h3>
                    <p className="text-xs text-neutral-600 mt-1 font-sans">
                      Our saree stylists and client concierge are delighted to assist with draping advice, weave queries, or order tracking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3.5 bg-white border border-[#E8E2D9] rounded-xs flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-neutral-900">Email Concierge</strong>
                        <a href="mailto:care@palluvo.com" className="text-[#541920] hover:underline">
                          care@palluvo.com
                        </a>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Response within 4 hours</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-white border border-[#E8E2D9] rounded-xs flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-neutral-900">WhatsApp & Phone</strong>
                        <a href="tel:+919820044021" className="text-[#541920] hover:underline">
                          +91 98200 44021
                        </a>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Mon–Sat, 10 AM – 7 PM IST</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick message form */}
                  <div className="bg-white p-5 rounded-xs border border-[#E8E2D9]">
                    <h4 className="font-serif text-sm font-semibold text-neutral-900 mb-3">
                      Send Us a Message
                    </h4>
                    {contactFormSubmitted ? (
                      <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xs flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>Thank you! Your message has been received. Our concierge will get back to you shortly.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                              Your Name
                            </label>
                            <input
                              type="text"
                              required
                              value={contactName}
                              onChange={(e) => setContactName(e.target.value)}
                              placeholder="e.g. Radhika Sharma"
                              className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#541920]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                              placeholder="e.g. radhika@example.com"
                              className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#541920]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                            How Can We Help You?
                          </label>
                          <textarea
                            required
                            rows={3}
                            value={contactMessage}
                            onChange={(e) => setContactMessage(e.target.value)}
                            placeholder="Ask about saree fabrics, bridal curation, or delivery timelines..."
                            className="w-full px-3 py-2 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#541920]"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors"
                        >
                          Submit Inquiry
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* SHIPPING POLICY */}
              {activeTab === "shipping" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl text-neutral-900">Shipping & Delivery Policy</h3>
                    <p className="text-xs text-neutral-600 mt-1 font-sans">
                      Safely delivering artisanal heirlooms in tamper-proof luxury keepsake boxes.
                    </p>
                  </div>

                  <div className="space-y-3.5 text-xs text-neutral-700 leading-relaxed font-sans">
                    <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        🚚 Free Express Shipping
                      </strong>
                      <p>
                        We offer 100% complimentary insured express shipping across India on all orders above <strong>₹1,999</strong>. For orders under ₹1,999, a flat nominal fee of ₹150 applies.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        ⏱️ Dispatch & Delivery Timelines
                      </strong>
                      <p>• <strong>Dispatch:</strong> Ready-to-ship sarees dispatch within 24 to 48 hours.</p>
                      <p>• <strong>Metro Cities:</strong> Delivered in 2–4 business days (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata).</p>
                      <p>• <strong>Tier 2 & 3 Cities:</strong> Delivered in 4–6 business days via BlueDart, Delhivery, or DTDC.</p>
                    </div>

                    <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        🎁 Keepsake Packaging
                      </strong>
                      <p>
                        Every drape is layered in archival butter paper, enveloped in breathable pure cotton muslin, and encased in our signature PALLUVO gold-embossed keepsake hard box.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RETURNS & EXCHANGES */}
              {activeTab === "returns" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl text-neutral-900">7-Day Return & Exchange</h3>
                    <p className="text-xs text-neutral-600 mt-1 font-sans">
                      Complete peace of mind with doorstep reverse pickup across India.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs text-neutral-700 leading-relaxed font-sans">
                    <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] space-y-2">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        ✨ Easy Return Window
                      </strong>
                      <p>
                        You can initiate a return or exchange within <strong>7 days of delivery</strong> directly from your account or by emailing us at <strong>care@palluvo.com</strong>.
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] space-y-2">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        📋 Return Conditions
                      </strong>
                      <p>• Saree must be unused, unwashed, and folded with all original tags & Silk Mark tags intact.</p>
                      <p>• Attached unstitched blouse piece must remain intact and uncut.</p>
                      <p>• Return in original PALLUVO luxury box with protective wrap.</p>
                    </div>

                    <div className="p-4 bg-white rounded-xs border border-[#E8E2D9] space-y-2">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        💳 Refund Processing
                      </strong>
                      <p>
                        Once our quality check team receives and inspects the drape, refunds are credited back to your original payment method (or UPI/Bank Account for COD orders) within 24 to 48 hours.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQS */}
              {activeTab === "faqs" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="font-serif text-2xl text-neutral-900">Frequently Asked Questions</h3>
                    <p className="text-xs text-neutral-600 mt-1 font-sans">
                      Common questions about our drapes, purity certificates, and services.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xs border border-[#E8E2D9] overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                          className="w-full p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-neutral-900 hover:text-[#541920] transition-colors"
                        >
                          <span>{faq.q}</span>
                          {openFaqIndex === idx ? (
                            <ChevronUp className="w-4 h-4 text-[#541920] shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                        </button>
                        {openFaqIndex === idx && (
                          <div className="px-4 pb-4 pt-1 text-xs text-neutral-600 leading-relaxed font-sans border-t border-[#FAF7F2]">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OUR STORY */}
              {activeTab === "story" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A575] block">
                      The Philosophy
                    </span>
                    <h3 className="font-serif text-2xl text-neutral-900 mt-0.5">Every Drape, A Little Magic</h3>
                  </div>

                  <div className="space-y-3.5 text-xs text-neutral-700 leading-relaxed font-sans">
                    <p>
                      PALLUVO was born from a reverent celebration of the Indian saree — a six-yard tapestry of generational wisdom, cultural legacy, and effortless femininity.
                    </p>
                    <p>
                      In an era of fleeting fast fashion, PALLUVO anchors itself in the enduring poetry of slow textiles. We bridge the world between revered artisan handloom clusters and the contemporary woman who wears her heritage with modern grace.
                    </p>
                    <div className="p-4 bg-[#F4EFE6] border-l-2 border-[#541920] rounded-r-xs italic font-serif text-neutral-800">
                      &ldquo;When a woman drapes a PALLUVO weave, she doesn&apos;t just wear a garment; she carries centuries of artisan devotion, golden threads, and celebratory memories.&rdquo;
                    </div>
                  </div>
                </div>
              )}

              {/* CRAFTSMANSHIP */}
              {activeTab === "craftsmanship" && (
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A575] block">
                      Loom To Wardrobe
                    </span>
                    <h3 className="font-serif text-2xl text-neutral-900 mt-0.5">Artisan Clusters & Weaving Purity</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-4 bg-white border border-[#E8E2D9] rounded-xs space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        Varanasi Katan & Kadwa
                      </strong>
                      <p className="text-neutral-600 leading-relaxed">
                        Master weavers spend upwards of 25 days threading individual zari motifs into pure silk mulberry warps using the ancient Kadwa hand-shuttle technique.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-[#E8E2D9] rounded-xs space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        Kanchipuram Temple Weaves
                      </strong>
                      <p className="text-neutral-600 leading-relaxed">
                        Interlocked korvai borders woven with three-ply mulberry silk and tested silver-gold zari, renowned for lustrous drape and heirloom longevity.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-[#E8E2D9] rounded-xs space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        Chanderi & Mulmul
                      </strong>
                      <p className="text-neutral-600 leading-relaxed">
                        Gossamer-light organic cotton interwoven with silk filaments, creating breathable drapes suited for joyous daytime rituals and celebrations.
                      </p>
                    </div>

                    <div className="p-4 bg-white border border-[#E8E2D9] rounded-xs space-y-1.5">
                      <strong className="text-neutral-900 font-semibold block text-sm">
                        Silk Mark Purity
                      </strong>
                      <p className="text-neutral-600 leading-relaxed">
                        Each individual batch undergoes stringent laboratory testing for filament authenticity, ensuring zero synthetic blends or compromised zari.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-[#F4EFE6] border-t border-[#E8E2D9] flex items-center justify-between text-xs text-neutral-500">
            <span>PALLUVO Client Concierge • Available 7 Days a Week</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#541920] hover:bg-[#3D1217] text-white text-[11px] uppercase tracking-wider font-semibold rounded-xs transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
