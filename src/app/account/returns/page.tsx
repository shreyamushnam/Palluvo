import type { Metadata } from "next";
import { OrderReturnsClient } from "./OrderReturnsClient";

export const metadata: Metadata = {
  title: "Order Returns & Exchanges | PALLUVO Luxury Sarees",
  description: "Initiate hassle-free 7-day returns or exchanges for your handcrafted sarees with complimentary doorstep pickup.",
};

export default function OrderReturnsPage() {
  return <OrderReturnsClient />;
}
