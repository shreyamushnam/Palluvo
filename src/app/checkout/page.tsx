import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Demo Checkout | PALLUVO",
  description: "Try the PALLUVO prototype checkout. This is a demo simulation: no live payment gateway is connected and no real charge is made.",
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
