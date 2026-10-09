import type { Metadata } from "next";
import { NotificationsClient } from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications & Atelier Updates | PALLUVO",
  description: "Stay updated on your handcrafted saree orders, exclusive handloom drops, and private atelier styling notes from PALLUVO.",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
