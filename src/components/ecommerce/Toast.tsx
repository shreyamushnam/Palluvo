"use client";

import React from "react";
import { CheckCircle2, Info } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#1C1A18] text-[#FAF7F2] px-4 py-3 shadow-2xl flex items-center gap-3 border-l-4 border-[#C5A575] max-w-sm">
        {toast.type === "info" ? (
          <Info size={18} className="text-[#C5A575] shrink-0" />
        ) : (
          <CheckCircle2 size={18} className="text-[#A8D5BA] shrink-0" />
        )}
        <p className="text-xs font-medium tracking-wide">
          {toast.message}
        </p>
      </div>
    </div>
  );
};
