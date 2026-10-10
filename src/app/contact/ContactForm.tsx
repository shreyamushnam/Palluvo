"use client";

import React, { useState } from "react";
import { Info, Send } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8E2D9] space-y-6">
      <div className="border-b border-[#E8E2D9] pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="font-serif text-xl text-neutral-900">Send an Inquiry</h2>
          <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
            Demo Control
          </span>
        </div>
        <p className="text-xs text-neutral-500 font-sans mt-0.5">
          Reach our dedicated saree stylists for bespoke orders, bridal trousseau curation, or shipment updates.
        </p>
      </div>

      <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xs flex items-start gap-2.5 text-xs">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="leading-relaxed">
          <strong className="font-medium">Demonstration Notice:</strong> This prototype inquiry form is for interface testing only and does not transmit or store messages. For real customer assistance, reach us directly at{" "}
          <a href="mailto:contact@palluvo.com" className="underline font-medium hover:text-[#541920]">
            contact@palluvo.com
          </a>
          , call{" "}
          <a href="tel:+918498854323" className="underline font-medium hover:text-[#541920]">
            +91 84988 54323
          </a>
          , or message on{" "}
          <a
            href="https://wa.me/918498854323"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium text-[#075E54] hover:text-[#054C44]"
          >
            WhatsApp
          </a>
          .
        </div>
      </div>

      {submitted ? (
        <div
          role="status"
          aria-live="polite"
          className="p-4 bg-[#F4EFE6] border border-[#C5A575]/40 text-neutral-900 rounded-xs space-y-3 text-xs"
        >
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#541920] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-neutral-900">Demo Inquiry Simulated</p>
              <p className="text-neutral-600">
                This is a demo store; no inquiry was transmitted or saved. For real support, please email us directly at{" "}
                <a href="mailto:contact@palluvo.com" className="underline text-[#541920] font-medium">
                  contact@palluvo.com
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
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-semibold text-[#541920] hover:underline uppercase tracking-wider cursor-pointer inline-block"
          >
            ← Send another demo inquiry
          </button>
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
                name="name"
                autoComplete="name"
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
                name="email"
                autoComplete="email"
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
                name="phone"
                autoComplete="tel"
                inputMode="tel"
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
