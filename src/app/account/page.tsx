"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, MapPin, User, Truck, CheckCircle2, ShieldCheck, Plus, X, Edit2, Trash2, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { MOCK_ADDRESSES, SavedAddress } from "@/data/mockOrders";

export default function AccountPage() {
  const { orders, formatPrice, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  // Saved Addresses state
  const [addresses, setAddresses] = useState<SavedAddress[]>(MOCK_ADDRESSES);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, "id">>({
    name: "",
    phone: "",
    type: "Home",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // Profile & Settings state
  const [profile, setProfile] = useState({
    fullName: "Radhika Sharma",
    email: "radhika.sharma@example.com",
    mobile: "+91 98765 43210",
    preferredDrape: "Nivi Style / Bengali Festive",
  });
  const [profileSuccessMessage, setProfileSuccessMessage] = useState(false);

  // Address Actions
  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: profile.fullName || "Radhika Sharma",
      phone: profile.mobile || "+91 98765 43210",
      type: "Home",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      type: addr.type,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: !!addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleDeleteAddress = (id: string, name: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast(`Address for ${name} deleted`, "info");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    showToast("Default address updated");
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === editingAddressId) {
            return { id: editingAddressId, ...addressForm };
          }
          if (addressForm.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        })
      );
      showToast("Address updated successfully!");
    } else {
      const newAddress: SavedAddress = {
        id: `addr-${Date.now()}`,
        ...addressForm,
      };
      setAddresses((prev) => {
        if (addressForm.isDefault) {
          return [...prev.map((a) => ({ ...a, isDefault: false })), newAddress];
        }
        return [...prev, newAddress];
      });
      showToast("New address added successfully!");
    }
    setIsAddressModalOpen(false);
  };

  // Profile Actions
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccessMessage(true);
    showToast("Profile details updated successfully!");
    setTimeout(() => {
      setProfileSuccessMessage(false);
    }, 4000);
  };

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
                Welcome, {profile.fullName.split(" ")[0] || "Radhika"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans">
                {profile.email} • Member since 2024
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
              <span>Saved Addresses ({addresses.length})</span>
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
                  <div>
                    <h2 className="font-serif text-xl text-neutral-900">Saved Delivery Addresses</h2>
                    <p className="text-xs text-neutral-500 mt-0.5">Manage your shipping destinations for faster checkout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="bg-white p-8 text-center rounded-sm border border-[#E8E2D9] space-y-3">
                    <p className="font-serif text-neutral-700">No saved addresses found.</p>
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="px-5 py-2 bg-[#541920] text-white text-xs uppercase tracking-wider font-semibold rounded-xs"
                    >
                      + Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-white p-5 rounded-sm border space-y-2 relative transition-all ${
                          addr.isDefault ? "border-[#541920] ring-1 ring-[#541920]" : "border-[#E8E2D9]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-block px-2 py-0.5 bg-[#F4EFE6] text-[#541920] border border-[#E8E2D9] rounded-xs text-[10px] font-bold uppercase tracking-wider">
                            {addr.type}
                          </span>
                          {addr.isDefault ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D]">
                              <Check className="w-3 h-3" /> Default Address
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[11px] text-neutral-500 hover:text-[#541920] font-medium"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider block">
                            Recipient
                          </span>
                          <h4 className="font-serif text-sm font-semibold text-neutral-900">
                            {addr.name}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                          {addr.addressLine} <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-neutral-600 pt-1">
                          Phone: <strong className="text-neutral-900">{addr.phone}</strong>
                        </p>
                        <div className="pt-3 border-t border-[#E8E2D9] flex gap-3 text-xs font-medium">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="text-[#541920] hover:underline flex items-center gap-1 cursor-pointer"
                            aria-label={`Edit recipient address for ${addr.name}`}
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <span className="text-neutral-300">•</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id, addr.name)}
                            className="text-neutral-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                            aria-label={`Delete recipient address for ${addr.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white p-6 rounded-sm border border-[#E8E2D9] space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-neutral-900 pb-1">
                    Profile & Settings
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Update your personal information and draping preferences.
                  </p>
                </div>

                {profileSuccessMessage && (
                  <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xs flex items-center gap-2 text-xs animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Your profile details have been saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor="profile-fullName" className="block text-neutral-700 font-medium mb-1">
                        Full Name *
                      </label>
                      <input
                        id="profile-fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-email" className="block text-neutral-700 font-medium mb-1">
                        Email Address *
                      </label>
                      <input
                        id="profile-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-mobile" className="block text-neutral-700 font-medium mb-1">
                        Mobile Number *
                      </label>
                      <input
                        id="profile-mobile"
                        name="mobile"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={profile.mobile}
                        onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-drape" className="block text-neutral-700 font-medium mb-1">
                        Preferred Saree Drape Style
                      </label>
                      <input
                        id="profile-drape"
                        name="preferredDrape"
                        type="text"
                        value={profile.preferredDrape}
                        onChange={(e) => setProfile({ ...profile, preferredDrape: e.target.value })}
                        placeholder="e.g. Nivi Style, Bengali, Nauvari"
                        className="w-full px-3 py-2 border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Save Changes
                    </button>
                    {profileSuccessMessage && (
                      <span className="text-xs text-[#15803D] font-medium flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Saved!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Address Create / Edit Dialog Modal */}
      {isAddressModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-sm border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-[#F4EFE6] border-b border-[#E8E2D9] flex items-center justify-between">
              <h3 id="address-modal-title" className="font-serif text-base font-semibold text-neutral-900">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 text-neutral-500 hover:text-black rounded-full"
                aria-label="Close address modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addr-name" className="block text-neutral-700 font-medium mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    id="addr-name"
                    name="name"
                    type="text"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                  />
                </div>
                <div>
                  <label htmlFor="addr-phone" className="block text-neutral-700 font-medium mb-1">
                    Recipient Phone Number *
                  </label>
                  <input
                    id="addr-phone"
                    name="phone"
                    type="tel"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="addr-type" className="block text-neutral-700 font-medium mb-1">
                  Address Type
                </label>
                <select
                  id="addr-type"
                  name="type"
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value as "Home" | "Office" })}
                  className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                >
                  <option value="Home">Home (All-day delivery)</option>
                  <option value="Office">Office (9 AM - 6 PM)</option>
                </select>
              </div>

              <div>
                <label htmlFor="addr-line" className="block text-neutral-700 font-medium mb-1">
                  Flat / House / Street Address *
                </label>
                <input
                  id="addr-line"
                  name="addressLine"
                  type="text"
                  required
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Towers, 12th Main Road"
                  className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="addr-city" className="block text-neutral-700 font-medium mb-1">
                    City *
                  </label>
                  <input
                    id="addr-city"
                    name="city"
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                  />
                </div>
                <div>
                  <label htmlFor="addr-state" className="block text-neutral-700 font-medium mb-1">
                    State *
                  </label>
                  <input
                    id="addr-state"
                    name="state"
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                  />
                </div>
                <div>
                  <label htmlFor="addr-pincode" className="block text-neutral-700 font-medium mb-1">
                    PIN Code *
                  </label>
                  <input
                    id="addr-pincode"
                    name="pincode"
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label htmlFor="addr-default" className="flex items-center gap-2 cursor-pointer text-neutral-800">
                  <input
                    id="addr-default"
                    name="isDefault"
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="rounded-xs text-[#541920] focus:ring-[#541920]"
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#DCD5C9] bg-white text-neutral-700 text-xs font-semibold rounded-xs hover:bg-[#F4EFE6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs"
                >
                  {editingAddressId ? "Save Changes" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
