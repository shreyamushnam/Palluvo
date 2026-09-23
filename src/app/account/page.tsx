"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, MapPin, User, ChevronRight, Truck, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { MOCK_ADDRESSES } from "@/data/mockOrders";

export default function AccountPage() {
  const { orders, formatPrice } = useStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">My Account</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900">
                Welcome, Radhika
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans">
                radhika.sharma@example.com • Member since 2024
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8E2D9] rounded-full text-xs font-semibold text-[#541920]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C5A575]" />
              <span>PALLUVO Royal Drape Club</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Tabs */}
          <div className="lg:col-span-3 bg-white p-3 rounded-sm border border-[#E8E2D9] space-y-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xs transition-colors text-left ${
                activeTab === "orders"
                  ? "bg-[#541920] text-white shadow-xs"
                  : "text-neutral-700 hover:bg-[#F4EFE6]"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xs transition-colors text-left ${
                activeTab === "addresses"
                  ? "bg-[#541920] text-white shadow-xs"
                  : "text-neutral-700 hover:bg-[#F4EFE6]"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xs transition-colors text-left ${
                activeTab === "profile"
                  ? "bg-[#541920] text-white shadow-xs"
                  : "text-neutral-700 hover:bg-[#F4EFE6]"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile & Settings</span>
            </button>
          </div>

          {/* Right Content Body */}
          <div className="lg:col-span-9">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl text-neutral-900">Order History</h2>
                  <span className="text-xs text-neutral-500 font-sans">{orders.length} Total orders</span>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-sm border border-[#E8E2D9]">
                    <p className="font-serif text-neutral-700">No orders placed yet.</p>
                    <Link
                      href="/shop"
                      className="inline-block mt-3 px-6 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
                    >
                      Shop Sarees
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-sm border border-[#E8E2D9] overflow-hidden shadow-2xs"
                      >
                        {/* Order Header */}
                        <div className="p-4 sm:p-5 bg-[#F4EFE6] border-b border-[#E8E2D9] flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-neutral-500">Order Placed: </span>
                            <span className="font-semibold text-neutral-900">{order.date}</span>
                            <span className="text-neutral-300 mx-2">•</span>
                            <span className="text-neutral-500">Order #: </span>
                            <span className="font-mono font-semibold text-neutral-900">{order.orderNumber}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span className="font-serif font-bold text-neutral-900 text-sm">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 sm:p-5 divide-y divide-[#EFEAE1]">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="pt-3 first:pt-0 flex gap-4 items-center">
                              <div className="relative w-16 h-20 shrink-0 rounded-xs overflow-hidden bg-neutral-200">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="64px"
                                  className="object-cover object-top"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-serif font-medium text-neutral-900 truncate">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-neutral-500 mt-0.5">
                                  Qty: {item.quantity} {item.color && `• Color: ${item.color}`}
                                </p>
                                <p className="text-xs font-semibold text-[#541920] mt-1">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>

                              <Link
                                href={`/product/${item.id}`}
                                className="px-3 py-1.5 border border-[#DCD5C9] text-neutral-700 hover:text-black hover:border-black text-xs font-medium rounded-xs transition-colors shrink-0"
                              >
                                View Saree
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer Info */}
                        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-[#541920]" />
                            <span>
                              Delivery Address: {order.shippingAddress}
                            </span>
                          </div>
                          <span className="text-neutral-500">
                            Payment: {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Saved Addresses Tab */}
            {activeTab === "addresses" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl text-neutral-900">Saved Delivery Addresses</h2>
                  <button className="px-4 py-2 bg-[#541920] text-white text-xs uppercase tracking-wider font-semibold rounded-xs">
                    + Add New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_ADDRESSES.map((addr) => (
                    <div
                      key={addr.id}
                      className="bg-white p-5 rounded-sm border border-[#E8E2D9] space-y-2 relative"
                    >
                      {addr.isDefault && (
                        <span className="inline-block px-2 py-0.5 bg-[#F4EFE6] text-[#541920] border border-[#E8E2D9] rounded-xs text-[10px] font-bold uppercase tracking-wider mb-1">
                          Default Address
                        </span>
                      )}
                      <h4 className="font-serif text-sm font-semibold text-neutral-900">
                        {addr.name} ({addr.type})
                      </h4>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        {addr.addressLine} <br />
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-neutral-600 pt-1">
                        Phone: <strong className="text-neutral-900">{addr.phone}</strong>
                      </p>
                      <div className="pt-3 border-t border-[#E8E2D9] flex gap-3 text-xs font-medium">
                        <button className="text-[#541920] hover:underline">Edit</button>
                        <span className="text-neutral-300">•</span>
                        <button className="text-neutral-500 hover:text-black">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white p-6 rounded-sm border border-[#E8E2D9] space-y-6">
                <h2 className="font-serif text-xl text-neutral-900 border-b border-[#E8E2D9] pb-3">
                  Profile Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-neutral-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Radhika Sharma"
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="radhika.sharma@example.com"
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      defaultValue="+91 98765 43210"
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Preferred Saree Drape Style</label>
                    <input
                      type="text"
                      defaultValue="Nivi Style / Bengali Festive"
                      className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button className="px-6 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-widest font-semibold rounded-xs">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
