import type { Metadata } from "next";
import { ShopContent } from "./ShopClient";
import { SITE_URL } from "@/data/site";

export const metadata: Metadata = {
  title: "Handcrafted Sarees, Blouses & Jewelry (Prototype Demo) | PALLUVO",
  description:
    "Explore PALLUVO's curated collection of Indian handcrafted products on this prototype storefront. Pure silk & handloom sarees, designer blouses, and temple jewelry with simulated checkout.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Handcrafted Sarees, Blouses & Jewelry (Prototype Demo) | PALLUVO",
    description:
      "Explore PALLUVO's curated collection of Indian handcrafted products on this prototype storefront. Pure silk & handloom sarees, designer blouses, and temple jewelry with simulated checkout.",
    url: `${SITE_URL}/shop`,
    siteName: "PALLUVO",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Handcrafted Sarees, Blouses & Jewelry (Prototype Demo) | PALLUVO",
    description:
      "Explore PALLUVO's curated collection of Indian handcrafted products on this prototype storefront. Pure silk & handloom sarees, designer blouses, and temple jewelry with simulated checkout.",
  },
};

export default function ShopPage() {
  return <ShopContent />;
}
