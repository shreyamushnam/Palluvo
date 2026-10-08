"use client";

import React, { Suspense } from "react";
import { ShopContent } from "@/app/shop/page";

export default function SareesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-500 font-sans">Loading sarees…</div>}>
      <ShopContent />
    </Suspense>
  );
}
