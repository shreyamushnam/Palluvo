"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, MapPin, User, Truck, CheckCircle2, ShieldCheck, Plus, X, Edit2, Trash2, Check, RotateCcw, LogOut, Sparkles, Award, Headphones, ArrowRight, Lock, Info } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { SavedAddress } from "@/data/mockOrders";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function getSafeRedirectUrl(target: string | null | undefined): string {
  if (!target || typeof target !== "string") return "/";
  const trimmed = target.trim();
  // Must start with '/' and strictly disallow protocol-relative paths ('//', '/\', '\\')
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("\\")) {
    return "/";
  }
  // Reject control characters
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return "/";
  }
  try {
    const parsed = new URL(trimmed, "http://localhost");
    // Ensure origin remains dummy localhost and pathname starts with '/'
    if (parsed.origin !== "http://localhost" || !parsed.pathname.startsWith("/")) {
      return "/";
    }
    // Disallow colon in path component to block scheme smuggling
    const pathOnly = trimmed.split("?")[0].split("#")[0];
    if (pathOnly.includes(":")) {
      return "/";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const {
    orders,
    formatPrice,
    showToast,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    isLoggedIn,
    user,
    login,
    logout,
  } = useStore();
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");

  // Unauthenticated Auth Card state
  const [authTab, setAuthTab] = useState<"signin" | "register">("signin");
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConnoisseur, setRegConnoisseur] = useState(true);

  // Saved Addresses modal and form state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const addressModalRef = useFocusTrap<HTMLDivElement>({
    isOpen: isAddressModalOpen,
    onClose: () => setIsAddressModalOpen(false),
  });
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
    fullName: user?.name || "Radhika Sharma",
    email: user?.email || "radhika.sharma@example.com",
    mobile: "+91 98765 43210",
    preferredDrape: "Nivi Style / Bengali Festive",
  });
  const [profileSuccessMessage, setProfileSuccessMessage] = useState(false);

  // Sync profile when auth user updates
  React.useEffect(() => {
    if (user?.name || user?.email) {
      setProfile((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = loginIdentifier ? loginIdentifier.split("@")[0] : "Radhika Sharma";
    const email = loginIdentifier.includes("@") ? loginIdentifier : `${loginIdentifier || "radhika"}@palluvo.com`;
    login({ name: name.charAt(0).toUpperCase() + name.slice(1), email });
    showToast("Signed in to prototype session (local demo mode).");
    const targetRedirect = getSafeRedirectUrl(redirectUrl);
    router.push(targetRedirect);
  };

  const handleDemoSignIn = () => {
    login({ name: "Radhika Sharma", email: "radhika.sharma@example.com" });
    showToast("Signed in as Radhika Sharma (Demo Account)");
    const targetRedirect = getSafeRedirectUrl(redirectUrl);
    router.push(targetRedirect);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = regFullName.trim() || "Valued Connoisseur";
    const email = regEmail.trim() || "member@palluvo.com";
    login({ name, email });
    showToast("Prototype profile created in local session.");
    const targetRedirect = getSafeRedirectUrl(redirectUrl);
    router.push(targetRedirect);
  };

  const handleSignOut = () => {
    logout();
    showToast("Signed out of your Palluvo account.", "info");
  };

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

  const handleDeleteAddress = (id: string) => {
    deleteAddress(id);
  };

  const handleSetDefaultAddress = (id: string) => {
    setDefaultAddress(id);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddress(editingAddressId, addressForm);
    } else {
      addAddress(addressForm);
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pb-24 lg:pb-16">
        {/* Editorial Brand Header */}
        <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <nav aria-label="Breadcrumb" className="text-xs text-neutral-600 mb-3 flex items-center justify-center gap-1.5 font-sans">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <span className="text-neutral-900 font-medium">Account Access</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#E8E2D9] rounded-full text-[11px] sm:text-xs font-semibold text-[#541920] uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
              <span>PALLUVO Royal Drape Club</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-neutral-900 tracking-tight">
              Welcome to Palluvo
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 mt-2.5 max-w-xl mx-auto font-sans leading-relaxed">
              Sign in to track handloom orders, manage delivery addresses, and access exclusive heirloom releases.
            </p>
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="max-w-xl mx-auto px-4 sm:px-6 -mt-4 sm:-mt-6 space-y-4">
          {/* Prototype Demonstration Notice */}
          <div className="p-4 bg-[#F4EFE6] border border-[#C5A575]/50 rounded-xs flex items-start gap-3 shadow-xs">
            <Info className="w-5 h-5 text-[#541920] shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-800 leading-relaxed font-sans">
              <span className="font-semibold text-[#541920] uppercase tracking-wider block mb-0.5">
                Prototype Demonstration Mode
              </span>
              Account creation and sign-in are simulated for storefront evaluation. Credentials are not validated against an external backend or shared across devices. Do not enter production credentials or personal passwords.
            </div>
          </div>

          <div className="bg-white rounded-sm border border-[#E8E2D9] shadow-lg overflow-hidden">
            {/* Tabbed Switch */}
            <div className="grid grid-cols-2 border-b border-[#E8E2D9] bg-[#FAF7F2]/60" role="tablist" aria-label="Authentication Options">
              <button
                id="auth-tab-signin"
                type="button"
                role="tab"
                aria-selected={authTab === "signin"}
                aria-controls="auth-panel-signin"
                tabIndex={authTab === "signin" ? 0 : -1}
                onClick={() => setAuthTab("signin")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    setAuthTab("register");
                    document.getElementById("auth-tab-register")?.focus();
                  }
                }}
                className={`py-3 sm:py-3.5 px-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                  authTab === "signin"
                    ? "bg-white text-[#541920] border-b-2 border-[#541920] shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-white/60"
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-[#541920] shrink-0" />
                <span>Simulated Sign In</span>
              </button>
              <button
                id="auth-tab-register"
                type="button"
                role="tab"
                aria-selected={authTab === "register"}
                aria-controls="auth-panel-register"
                tabIndex={authTab === "register" ? 0 : -1}
                onClick={() => setAuthTab("register")}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    setAuthTab("signin");
                    document.getElementById("auth-tab-signin")?.focus();
                  }
                }}
                className={`py-3 sm:py-3.5 px-2 text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                  authTab === "register"
                    ? "bg-white text-[#541920] border-b-2 border-[#541920] shadow-2xs"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-white/60"
                }`}
              >
                <User className="w-3.5 h-3.5 text-[#541920] shrink-0" />
                <span>Create Prototype Profile</span>
              </button>
            </div>

            {/* Auth Forms */}
            <div className="p-6 sm:p-8">
              <div
                id="auth-panel-signin"
                role="tabpanel"
                aria-labelledby="auth-tab-signin"
                hidden={authTab !== "signin"}
              >
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="signin-identifier" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                      Mobile Number or Email Address <span className="text-[#541920]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="signin-identifier"
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. radhika.sharma@example.com or +91 98765 43210"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF7F2]/50 border border-[#DCD5C9] rounded-xs text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="signin-password" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                        Password / OTP <span className="text-[#541920]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => showToast("Password reset is unavailable in this prototype demonstration.", "info")}
                        className="text-[11px] text-[#541920] hover:underline font-medium cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      id="signin-password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your secret password or OTP"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF7F2]/50 border border-[#DCD5C9] rounded-xs text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[46px] px-6 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                    >
                      <span>SIGN IN TO MY ACCOUNT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sample / Demo One-Click Sign In */}
                  <div className="pt-2 text-center border-t border-[#E8E2D9] mt-5">
                    <p className="text-[11px] text-neutral-500 mb-2 font-sans">
                      Testing the storefront experience?
                    </p>
                    <button
                      type="button"
                      onClick={handleDemoSignIn}
                      className="w-full min-h-[42px] px-4 py-2 border border-[#C5A575] bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#541920] text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A575]" />
                      <span>Demo Sign In (Radhika Sharma)</span>
                    </button>
                  </div>
                </form>
              </div>

              <div
                id="auth-panel-register"
                role="tabpanel"
                aria-labelledby="auth-tab-register"
                hidden={authTab !== "register"}
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-[#541920]">*</span>
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF7F2]/50 border border-[#DCD5C9] rounded-xs text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="reg-mobile" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                        Mobile Number <span className="text-[#541920]">*</span>
                      </label>
                      <input
                        id="reg-mobile"
                        type="tel"
                        required
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF7F2]/50 border border-[#DCD5C9] rounded-xs text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg-email" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-[#541920]">*</span>
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF7F2]/50 border border-[#DCD5C9] rounded-xs text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
                      Create Password <span className="text-[#541920]">*</span>
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#FAF7F2]/50 border border-[#DCD5C9] rounded-xs text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                    />
                  </div>

                  <div className="pt-1">
                    <label htmlFor="reg-connoisseur" className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-700 leading-normal">
                      <input
                        id="reg-connoisseur"
                        type="checkbox"
                        checked={regConnoisseur}
                        onChange={(e) => setRegConnoisseur(e.target.checked)}
                        className="w-4 h-4 rounded-xs text-[#541920] focus:ring-[#541920] mt-0.5 shrink-0"
                      />
                      <span>Join the Palluvo Connoisseur Circle for early access to private handloom drops and bridal previews.</span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full min-h-[46px] px-6 py-3 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                    >
                      <span>CREATE ACCOUNT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Trust Pillars / Perks of Joining */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white p-4 rounded-sm border border-[#E8E2D9] text-center flex flex-col items-center">
              <Award className="w-5 h-5 text-[#C5A575] mb-2" />
              <h3 className="text-xs font-semibold text-neutral-900 mb-0.5 font-serif">Silk Mark Authenticity</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">Every saree certified 100% pure silk with government hallmarks.</p>
            </div>
            <div className="bg-white p-4 rounded-sm border border-[#E8E2D9] text-center flex flex-col items-center">
              <RotateCcw className="w-5 h-5 text-[#C5A575] mb-2" />
              <h3 className="text-xs font-semibold text-neutral-900 mb-0.5 font-serif">Complimentary Returns</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">Hassle-free 7-day doorstep reverse pickups and swift exchanges.</p>
            </div>
            <div className="bg-white p-4 rounded-sm border border-[#E8E2D9] text-center flex flex-col items-center">
              <Headphones className="w-5 h-5 text-[#C5A575] mb-2" />
              <h3 className="text-xs font-semibold text-neutral-900 mb-0.5 font-serif">Stylist Concierge</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">Dedicated bridal and drape consultants available on WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 lg:pb-12">
      {/* Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-600 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
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
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#E8E2D9] rounded-full text-xs font-semibold text-[#541920]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C5A575]" />
                <span>Prototype Connoisseur Session</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-[#DCD5C9] rounded-full text-xs font-semibold transition-colors cursor-pointer"
                title="Sign out of prototype session"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-500" />
                <span>Exit Session</span>
              </button>
            </div>
          </div>

          {/* Prototype Session Info Strip */}
          <div className="mt-4 p-3 bg-white/80 border border-[#C5A575]/40 rounded-xs flex items-center gap-2.5 text-xs text-neutral-700 font-sans">
            <Info className="w-4 h-4 text-[#541920] shrink-0" />
            <span>
              <strong>Storefront Evaluation Mode:</strong> Orders and delivery addresses are maintained in this browser&apos;s local storage for previewing workflows. Server authentication and backend data persistence are not active in this prototype.
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-start">
          
          {/* Left Navigation Tabs */}
          <div
            role="tablist"
            aria-label="Account sections"
            className="lg:col-span-3 bg-white p-2 sm:p-3 rounded-sm border border-[#E8E2D9] flex flex-col space-y-1"
          >
            <button
              id="account-tab-orders"
              role="tab"
              aria-selected={activeTab === "orders"}
              aria-controls="account-panel-orders"
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center justify-start gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] text-xs font-semibold rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                activeTab === "orders"
                  ? "bg-[#541920] text-white shadow-xs"
                  : "text-neutral-700 hover:bg-[#F4EFE6]"
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>My Orders ({orders.length})</span>
            </button>

            <Link
              href="/account/returns"
              className="w-full flex items-center justify-start gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] text-xs font-semibold rounded-xs transition-colors cursor-pointer text-neutral-700 hover:bg-[#F4EFE6] hover:text-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
              aria-label="Order Returns and Exchanges"
            >
              <RotateCcw className="w-4 h-4 shrink-0 text-[#541920]" />
              <span>Order Returns</span>
            </Link>

            <button
              id="account-tab-addresses"
              role="tab"
              aria-selected={activeTab === "addresses"}
              aria-controls="account-panel-addresses"
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center justify-start gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] text-xs font-semibold rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                activeTab === "addresses"
                  ? "bg-[#541920] text-white shadow-xs"
                  : "text-neutral-700 hover:bg-[#F4EFE6]"
              }`}
            >
              <MapPin className="w-4 h-4 shrink-0" />
              <span>Saved Addresses ({addresses.length})</span>
            </button>

            <button
              id="account-tab-profile"
              role="tab"
              aria-selected={activeTab === "profile"}
              aria-controls="account-panel-profile"
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-start gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] text-xs font-semibold rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                activeTab === "profile"
                  ? "bg-[#541920] text-white shadow-xs"
                  : "text-neutral-700 hover:bg-[#F4EFE6]"
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile & Settings</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-start gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 min-h-[44px] text-xs font-semibold rounded-xs transition-colors cursor-pointer text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none border-t border-[#E8E2D9] mt-2 pt-3"
            >
              <LogOut className="w-4 h-4 shrink-0 text-red-600" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Right Content Body */}
          <div className="lg:col-span-9">
            
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div
                id="account-panel-orders"
                role="tabpanel"
                aria-labelledby="account-tab-orders"
                tabIndex={0}
                className="space-y-6 focus-visible:outline-none"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl text-neutral-900">Order History</h2>
                  <span className="text-xs text-neutral-600 font-sans">{orders.length} Total orders</span>
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
                            <span className="text-neutral-600 font-medium">Order Placed: </span>
                            <span className="font-semibold text-neutral-900">{order.date}</span>
                            <span className="text-neutral-400 mx-2">•</span>
                            <span className="text-neutral-600 font-medium">Order #: </span>
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
                            <span className="font-serif font-bold text-neutral-900 text-sm tabular-nums">
                              {formatPrice(order.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-4 sm:p-5 divide-y divide-[#EFEAE1]">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex gap-3 sm:gap-4 items-center flex-1 min-w-0">
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
                                  <h3 className="text-sm font-serif font-medium text-neutral-900 leading-snug break-words">
                                    {item.name}
                                  </h3>
                                  <p className="text-xs text-neutral-500 mt-0.5">
                                    Qty: {item.quantity} {item.color && `• Color: ${item.color}`}
                                  </p>
                                  <p className="text-xs font-semibold text-[#541920] mt-1 tabular-nums">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>

                              <Link
                                href={`/product/${item.id}`}
                                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 border border-[#DCD5C9] hover:border-[#541920] bg-white text-neutral-800 hover:text-[#541920] text-xs font-medium rounded-xs transition-colors shrink-0 inline-flex items-center justify-center text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
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
                          <span className="text-neutral-600">
                            Payment: <span className="font-semibold text-neutral-900">{order.paymentMethod}</span>
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
              <div
                id="account-panel-addresses"
                role="tabpanel"
                aria-labelledby="account-tab-addresses"
                tabIndex={0}
                className="space-y-6 focus-visible:outline-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="font-serif text-xl text-neutral-900">Saved Delivery Addresses</h2>
                    <p className="text-xs text-neutral-600 mt-0.5">Manage your shipping destinations for faster checkout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="self-start sm:self-auto min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
                      className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-wider font-semibold rounded-xs"
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
                            <span className="min-h-[44px] -my-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D]">
                              <Check className="w-3.5 h-3.5" /> Default Address
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="min-h-[44px] -my-2.5 -mr-2 px-2.5 inline-flex items-center text-[11px] text-neutral-500 hover:text-[#541920] font-medium cursor-pointer rounded-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-semibold text-neutral-600 tracking-wider block">
                            Recipient
                          </span>
                          <h3 className="font-serif text-sm font-semibold text-neutral-900">
                            {addr.name}
                          </h3>
                        </div>
                        <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                          {addr.addressLine} <br />
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-neutral-600 pt-1">
                          Phone: <strong className="text-neutral-900">{addr.phone}</strong>
                        </p>
                        <div className="pt-2 border-t border-[#E8E2D9] flex items-center gap-1 text-xs font-medium -ml-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-[#541920] hover:bg-[#541920]/5 rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                            aria-label={`Edit recipient address for ${addr.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <span className="text-neutral-300 select-none">•</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                            aria-label={`Delete recipient address for ${addr.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              <div
                id="account-panel-profile"
                role="tabpanel"
                aria-labelledby="account-tab-profile"
                tabIndex={0}
                className="bg-white p-6 rounded-sm border border-[#E8E2D9] space-y-6 focus-visible:outline-none"
              >
                <div>
                  <h2 className="font-serif text-xl text-neutral-900 pb-1">
                    Profile & Settings
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Update your personal information and draping preferences.
                  </p>
                </div>

                {profileSuccessMessage && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xs flex items-center gap-2 text-xs animate-in fade-in duration-200"
                  >
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
                        className="w-full min-h-[44px] px-3.5 py-2.5 border border-[#DCD5C9] rounded-xs focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        className="w-full min-h-[44px] px-3.5 py-2.5 border border-[#DCD5C9] rounded-xs focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        className="w-full min-h-[44px] px-3.5 py-2.5 border border-[#DCD5C9] rounded-xs focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                        className="w-full min-h-[44px] px-3.5 py-2.5 border border-[#DCD5C9] rounded-xs focus:border-[#541920] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920] placeholder:text-neutral-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      className="min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-widest font-semibold rounded-xs shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541920]"
                    >
                      Save Changes
                    </button>
                    {profileSuccessMessage && (
                      <span
                        role="status"
                        aria-live="polite"
                        className="text-xs text-[#15803D] font-medium flex items-center gap-1"
                      >
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
          ref={addressModalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 outline-none"
        >
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-sm border border-[#E8E2D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-[#F4EFE6] border-b border-[#E8E2D9] flex items-center justify-between">
              <h3 id="address-modal-title" className="font-serif text-base font-semibold text-neutral-900">
                {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center -mr-2 text-neutral-500 hover:text-black rounded-full cursor-pointer transition-colors"
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
                    autoComplete="name"
                    required
                    value={addressForm.name}
                    onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                    autoComplete="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    value={addressForm.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setAddressForm({ ...addressForm, phone: digitsOnly });
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                  autoComplete="street-address"
                  required
                  value={addressForm.addressLine}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                  placeholder="e.g. Flat 402, Lotus Towers"
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920] placeholder:text-neutral-500"
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
                    autoComplete="address-level2"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                    autoComplete="address-level1"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
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
                    autoComplete="postal-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setAddressForm({ ...addressForm, pincode: digitsOnly });
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-[#DCD5C9] rounded-xs focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label
                  htmlFor="addr-default"
                  className="min-h-[44px] py-1.5 flex items-center gap-2.5 cursor-pointer text-neutral-800"
                >
                  <input
                    id="addr-default"
                    name="isDefault"
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded-xs text-[#541920] focus:ring-[#541920] shrink-0"
                  />
                  <span>Make this my default delivery address</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="min-h-[44px] px-4 py-2.5 border border-[#DCD5C9] bg-white text-neutral-700 text-xs font-semibold rounded-xs hover:bg-[#F4EFE6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 bg-[#541920] hover:bg-[#3D1217] text-white text-xs uppercase tracking-wider font-semibold rounded-xs shadow-xs cursor-pointer"
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
