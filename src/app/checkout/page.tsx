import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Secure Checkout | PALLUVO",
  description: "Complete your order with 256-bit SSL encrypted checkout, verified Indian payment options, and insured luxury doorstep delivery.",
  alternates: {
    canonical: "/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
