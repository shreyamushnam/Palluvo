"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Package, 
  Sparkles, 
  Tag, 
  CheckCheck, 
  ArrowRight, 
  Clock, 
  Trash2,
  Calendar
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "order" | "drop" | "offer" | "consultation";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionText?: string;
  actionHref?: string;
  tag: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "order",
    title: "Order #PAL-8924 Dispatched",
    description: "Your handcrafted Wine Tissue Silk Saree has been dispatched from our Varanasi weaving studio with insured express delivery.",
    timestamp: "10 minutes ago",
    isRead: false,
    actionText: "Track Consignment",
    actionHref: "/account",
    tag: "Order Dispatch",
  },
  {
    id: "notif-2",
    type: "drop",
    title: "New Royal Kanjeevaram Collection Live",
    description: "Explore 12 heirloom bridal weaves crafted with certified 2G gold zari motifs, now open for bespoke reservations.",
    timestamp: "2 hours ago",
    isRead: false,
    actionText: "Explore Collection",
    actionHref: "/shop?category=Kanjeevaram",
    tag: "Atelier Drop",
  },
  {
    id: "notif-3",
    type: "offer",
    title: "Exclusive Private Privilege: 10% Off",
    description: "Use your celebration code PALLUVO10 on orders over ₹1,999 to enjoy complimentary insured courier and artisan care kit.",
    timestamp: "Yesterday",
    isRead: true,
    actionText: "Shop With Privilege",
    actionHref: "/shop",
    tag: "Private Offer",
  },
  {
    id: "notif-4",
    type: "consultation",
    title: "Bridal Draping & Styling Consultation Ready",
    description: "Your complimentary wedding ensemble curation notes and fabric swatches have been prepared by our senior sari draper.",
    timestamp: "3 days ago",
    isRead: true,
    actionText: "Contact Concierge",
    actionHref: "/contact",
    tag: "Styling Note",
  },
];

export const NotificationsClient: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "order":
        return <Package className="w-4 h-4 text-[#541920]" />;
      case "drop":
        return <Sparkles className="w-4 h-4 text-[#C5A575]" />;
      case "offer":
        return <Tag className="w-4 h-4 text-[#15803D]" />;
      case "consultation":
        return <Calendar className="w-4 h-4 text-[#541920]" />;
      default:
        return <Bell className="w-4 h-4 text-[#541920]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumbs & Title */}
        <div className="mb-6 sm:mb-8 pb-5 border-b border-[#E8E2D9]">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-neutral-600 font-sans">
              <li>
                <Link href="/" className="hover:text-[#541920] transition-colors">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">•</li>
              <li className="text-neutral-900 font-semibold" aria-current="page">
                Notifications
              </li>
            </ol>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-[#541920] font-semibold">
                  Atelier Updates & Alerts
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-[#541920] text-[#FAF7F2] rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-normal text-neutral-900 tracking-tight">
                Notifications
              </h1>
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="min-h-[44px] px-3.5 py-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#541920] hover:text-[#3D1217] hover:bg-[#F4EFE6] rounded-xs border border-[#DCD5C9] transition-colors self-start sm:self-auto cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-sm border border-[#E8E2D9] p-8 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center text-neutral-400">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-medium text-neutral-900 mb-2">
              All Caught Up
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto mb-6 leading-relaxed">
              You do not have any active alerts or announcements right now. New dispatch notices and heirloom collection drops will appear here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors"
            >
              <span>Explore Latest Sarees</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`relative rounded-sm p-4 sm:p-5 border transition-all duration-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.isRead
                    ? "bg-white/90 border-[#E8E2D9] opacity-90"
                    : "bg-white border-[#C5A575]/60 ring-1 ring-[#C5A575]/30"
                }`}
              >
                {/* Content Left */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#E8E2D9] flex items-center justify-center shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#541920]">
                        {item.tag}
                      </span>
                      {!item.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#541920]" aria-label="Unread" />
                      )}
                      <span className="text-[11px] text-neutral-600 flex items-center gap-1 ml-auto sm:ml-0 font-sans">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-serif font-medium text-neutral-900 leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-neutral-600 font-sans mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {item.actionHref && item.actionText && (
                      <div className="mt-3">
                        <Link
                          href={item.actionHref}
                          className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#541920] hover:text-[#3D1217] hover:underline focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none rounded-2xs"
                        >
                          <span>{item.actionText}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggles Right */}
                <div className="flex items-center gap-2 sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E8E2D9]">
                  <button
                    type="button"
                    onClick={() => toggleReadStatus(item.id)}
                    className="min-h-[44px] px-2.5 py-1.5 text-[11px] text-neutral-600 hover:text-neutral-900 border border-[#DCD5C9] hover:bg-[#FAF7F2] rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                    aria-label={item.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    {item.isRead ? "Mark unread" : "Mark read"}
                  </button>

                  <button
                    type="button"
                    onClick={() => clearNotification(item.id)}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                    aria-label={`Dismiss notification: ${item.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
