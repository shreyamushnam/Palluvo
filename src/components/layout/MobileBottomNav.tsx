"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Heart, ShoppingBag, User } from "lucide-react";
import { useStore } from "@/context/StoreContext";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, wishlistCount, setIsCartOpen } = useStore();

  const items = [
    { label: "Home", href: "/", icon: Home },
    { label: "Shop", href: "/shop", icon: Grid },
    { label: "Wishlist", href: "/wishlist", icon: Heart, count: wishlistCount },
    { label: "Cart", href: "/cart", icon: ShoppingBag, count: cartCount, isCartDrawer: true },
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#1C1A18]/10 py-2 px-3 flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isCartDrawer) {
          return (
            <button
              key={item.label}
              onClick={() => setIsCartOpen(true)}
              className="flex flex-col items-center justify-center p-1 relative text-[#5E5A54] hover:text-[#541920]"
            >
              <div className="relative">
                <Icon size={20} />
                {item.count !== undefined && item.count > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#541920] text-[#FAF7F2] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.count}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-wider mt-0.5 font-medium">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center p-1 relative transition-colors ${
              isActive ? "text-[#541920] font-semibold" : "text-[#5E5A54] hover:text-[#541920]"
            }`}
          >
            <div className="relative">
              <Icon size={20} />
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#BF6A54] text-[#FAF7F2] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-wider mt-0.5 font-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
