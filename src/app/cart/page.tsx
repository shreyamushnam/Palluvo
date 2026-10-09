import type { Metadata } from "next";
import CartClient from "./CartClient";

export const metadata: Metadata = {
  title: "Shopping Bag | PALLUVO",
  description: "Review your selected luxury sarees, complimentary heirloom gift packaging, and order totals.",
  alternates: {
    canonical: "/cart",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartClient />;
}
