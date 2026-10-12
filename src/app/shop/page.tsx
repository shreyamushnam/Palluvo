import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopContent } from "./ShopClient";

export const metadata: Metadata = {
  title: "Handcrafted Luxury Sarees, Blouses & Jewelry | PALLUVO",
  description:
    "Explore PALLUVO's curated collection of authentic Indian handcrafted products. Pure silk & handloom sarees, embroidered designer blouses, and temple jewelry.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Handcrafted Luxury Sarees, Blouses & Jewelry | PALLUVO",
    description:
      "Explore PALLUVO's curated collection of authentic Indian handcrafted products. Pure silk & handloom sarees, embroidered designer blouses, and temple jewelry.",
    url: "https://palluvo.com/shop",
    siteName: "PALLUVO",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Luxury Sarees, Blouses & Jewelry | PALLUVO",
    description:
      "Explore PALLUVO's curated collection of authentic Indian handcrafted products. Pure silk & handloom sarees, embroidered designer blouses, and temple jewelry.",
  },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-500 font-sans">Loading products…</div>}>
      <ShopContent />
    </Suspense>
  );
}
