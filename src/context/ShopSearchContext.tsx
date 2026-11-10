"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

interface ShopSearchContextType {
  shopSearchQuery: string;
  setShopSearchQuery: (query: string) => void;
}

const ShopSearchContext = createContext<ShopSearchContextType | undefined>(undefined);

export function ShopSearchProvider({ children }: { children: React.ReactNode }) {
  const [shopSearchQuery, setShopSearchQuery] = useState("");

  const value = useMemo(
    () => ({
      shopSearchQuery,
      setShopSearchQuery,
    }),
    [shopSearchQuery]
  );

  return (
    <ShopSearchContext.Provider value={value}>
      {children}
    </ShopSearchContext.Provider>
  );
}

export function useShopSearch(): ShopSearchContextType {
  const context = useContext(ShopSearchContext);
  if (!context) {
    return {
      shopSearchQuery: "",
      setShopSearchQuery: () => {},
    };
  }
  return context;
}

