"use client";

import React, { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 4000);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E2D9] space-y-6">
      <div className="border-b border-[#E8E2D9] pb-3">
        <h2 className="font-serif text-xl text-neutral-900">Send an Inquiry</h2>
        <p className="text-xs text-neutral-500 font-sans mt-0.5">
          Reach our dedicated saree stylists for bespoke orders, bridal trousseau curation, or shipment updates.
        </p>
      </div>

      {submitted ? (
        <div
          role="status"
          aria-live="polite"
          className="p-4 bg-[#F4EFE6] border border-[#C5A575]/40 text-neutral-900 rounded-xs flex items-center gap-2.5 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-[#541920] shrink-0" />
          <span>Thank you! Your message has been received. Our concierge will get back to you shortly.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Radhika Sharma"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. radhika@example.com"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
                Phone Number
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210…"
                className="w-full min-h-[44px] px-3.5 py-2.5 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contact-message" className="block text-[11px] font-semibold text-neutral-700 uppercase mb-1">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about saree fabrics, bridal curation, or delivery timelines…"
              className="w-full px-3.5 py-2.5 text-xs border border-[#DCD5C9] rounded-xs bg-[#FAF7F2] focus:bg-white focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
            />
          </div>

          <button
            type="submit"
            className="min-h-[44px] px-8 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Message</span>
          </button>
        </form>
      )}
    </div>
  );
}
