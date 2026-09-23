"use client";

import React, { useState } from "react";
import { Check, ArrowRight } from "lucide-react";

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 700);
  };

  return (
    <section className="py-24 md:py-32 bg-[#F5EFEB] border-t border-[#1C1A18]/10 text-center relative">
      <div className="max-w-3xl mx-auto px-6 md:px-10">
        
        <span className="text-[11px] uppercase tracking-[0.3em] text-[#541920] font-semibold">
          The Private Registry
        </span>

        <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#1C1A18] font-light mt-2 mb-4">
          Stay in the fold.
        </h2>

        <p className="font-serif-display text-lg sm:text-xl text-[#5E5A54] italic max-w-xl mx-auto font-light leading-relaxed mb-10">
          “New collections, drape stories and little moments of magic — delivered occasionally.”
        </p>

        {isSubmitted ? (
          <div className="p-6 bg-[#FAF7F2] border border-[#C5A575]/40 max-w-md mx-auto animate-in fade-in duration-300">
            <div className="w-10 h-10 rounded-full bg-[#541920] text-[#FAF7F2] flex items-center justify-center mx-auto mb-3">
              <Check size={20} />
            </div>
            <p className="font-serif-display text-xl text-[#1C1A18]">
              Welcome to the PALLUVO fold.
            </p>
            <p className="text-xs text-[#5E5A54] mt-1 font-light">
              You will receive our seasonal lookbook and private salon invitations.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center justify-center max-w-md mx-auto gap-3"
          >
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full px-5 py-3.5 bg-[#FAF7F2] border border-[#1C1A18]/20 text-[#1C1A18] text-xs placeholder:text-[#8A857E] focus:outline-none focus:border-[#541920] transition-colors rounded-none tracking-wide"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto whitespace-nowrap px-8 py-3.5 bg-[#1C1A18] hover:bg-[#541920] text-[#FAF7F2] text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? "Enfolding..." : "Join PALLUVO"}</span>
              {!isLoading && <ArrowRight size={14} className="text-[#C5A575]" />}
            </button>
          </form>
        )}

        <p className="text-[10px] text-[#8A857E] uppercase tracking-widest mt-6">
          Zero clutter • Intimate quarterly correspondences only • Unsubscribe anytime
        </p>
      </div>
    </section>
  );
};
