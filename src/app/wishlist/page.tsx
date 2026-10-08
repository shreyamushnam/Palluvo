import type { Metadata } from "next";
import { WishlistClient } from "./WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist | Saved Handcrafted Heirlooms | PALLUVO",
  description: "View and manage your saved handcrafted sarees and bridal heirlooms.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}
