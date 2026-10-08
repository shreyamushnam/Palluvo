"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useStore } from "@/context/StoreContext";

const QuickViewModalContent = dynamic(
  () => import("./QuickViewModalContent").then((mod) => mod.QuickViewModalContent),
  { ssr: false }
);

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct } = useStore();

  useEffect(() => {
    if (quickViewProduct) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  return (
    <QuickViewModalContent
      key={quickViewProduct.id}
      product={quickViewProduct}
      onClose={() => setQuickViewProduct(null)}
    />
  );
};
