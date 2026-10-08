import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopContent } from "./ShopClient";

export const metadata: Metadata = {
  title: "Handcrafted Luxury Sarees | Pure Silk, Banarasi, Kanjeevaram | PALLUVO",
  description:
    "Explore PALLUVO's curated collection of authentic Indian handloom sarees. Pure Kanjeevaram silk, Banarasi brocades, delicate organzas, and bridal heirlooms.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Handcrafted Luxury Sarees Collection | PALLUVO",
    description:
      "Explore PALLUVO's curated collection of authentic Indian handloom sarees. Pure Kanjeevaram silk, Banarasi brocades, delicate organzas, and bridal heirlooms.",
    url: "https://palluvo.com/shop",
    siteName: "PALLUVO",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Luxury Sarees Collection | PALLUVO",
    description:
      "Explore PALLUVO's curated collection of authentic Indian handloom sarees. Pure Kanjeevaram silk, Banarasi brocades, delicate organzas, and bridal heirlooms.",
  },
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-500 font-sans">Loading products…</div>}>
      <ShopContent />
    </Suspense>
  );
}
