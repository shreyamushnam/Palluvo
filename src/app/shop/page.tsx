"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, SlidersHorizontal, Check } from "lucide-react";
import { PRODUCTS, type Product } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const FABRICS = [
  "Pure Silk",
  "Kanjeevaram Silk",
  "Tissue Silk",
  "Cotton Silk",
  "Handloom Silk",
  "Katan Silk",
  "Tissue Organza",
  "Chiffon",
  "Banarasi Brocade Silk",
  "Paithani Silk",
  "Pure Linen",
  "Handspun Tussar Silk",
];

const OCCASIONS = [
  "Bridal & Wedding",
  "Festive & Ceremonial",
  "Party Wear",
  "Cocktail & Evening",
  "Workwear & Casual",
];

export function matchesCategory(product: Product, category: string): boolean {
  if (!category) return true;
  const norm = category.toLowerCase().trim();
  if (norm.includes("new arrival")) {
    return !!product.isNewArrival;
  } else if (norm.includes("silk") && !norm.includes("cotton")) {
    return product.category.toLowerCase() === "silk" || product.fabric.toLowerCase().includes("silk");
  } else if (norm.includes("handloom")) {
    return product.category.toLowerCase() === "handloom" || product.fabric.toLowerCase().includes("handloom");
  } else if (norm.includes("cotton")) {
    return product.category.toLowerCase() === "cotton" || product.fabric.toLowerCase().includes("cotton");
  } else if (norm.includes("festive")) {
    return product.category.toLowerCase() === "festive" || product.occasion.toLowerCase() === "festive";
  } else if (norm.includes("bridal") || norm.includes("wedding")) {
    return product.category.toLowerCase() === "bridal" || product.occasion.toLowerCase() === "wedding";
  } else if (norm.includes("party")) {
    return product.category.toLowerCase() === "party wear" || product.occasion.toLowerCase() === "party";
  } else if (norm.includes("printed")) {
    return product.category.toLowerCase() === "printed";
  } else {
    const root = norm.replace(/sarees?/g, "").trim();
    return (
      product.category.toLowerCase().includes(root) ||
      product.fabric.toLowerCase().includes(root) ||
      product.occasion.toLowerCase().includes(root)
    );
  }
}

export function matchesFabric(product: Product, fabric: string): boolean {
  if (!fabric) return true;
  return product.fabric.toLowerCase().includes(fabric.toLowerCase());
}

export function matchesOccasion(product: Product, occ: string): boolean {
  if (!occ) return true;
  const occTerms = occ.toLowerCase().split(/[&,\s]+/).filter((term) => term.length > 2);
  const prodOcc = product.occasion.toLowerCase();
  const prodDetailsOcc = product.details?.occasion?.toLowerCase() || "";
  const prodCat = product.category.toLowerCase();
  return occTerms.some(
    (term) => prodOcc.includes(term) || prodDetailsOcc.includes(term) || prodCat.includes(term)
  );
}

export function matchesPrice(product: Product, priceRangeIndex: number | null): boolean {
  if (priceRangeIndex === null) return true;
  const range = PRICE_RANGES[priceRangeIndex];
  if (!range) return true;
  return product.price >= range.min && product.price <= range.max;
}

export function matchesSearch(product: Product, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(q) ||
    product.fabric.toLowerCase().includes(q) ||
    product.category.toLowerCase().includes(q)
  );
}

export function getFabricItemCount(
  fabricName: string,
  productList: Product[] = PRODUCTS
): number {
  return productList.filter((product) => matchesFabric(product, fabricName)).length;
}

export function getOccasionItemCount(
  occ: string,
  productList: Product[] = PRODUCTS
): number {
  return productList.filter((product) => matchesOccasion(product, occ)).length;
}

export function getCategoryItemCount(
  categoryName: string,
  productList: Product[] = PRODUCTS
): number {
  return productList.filter((product) => matchesCategory(product, categoryName)).length;
}

const PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
  { label: "Above ₹15,000", min: 15000, max: 999999 },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";

  const [selectedFabric, setSelectedFabric] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const mobileFilterRef = useFocusTrap<HTMLDivElement>({
    isOpen: isMobileFilterOpen,
    onClose: () => setIsMobileFilterOpen(false),
  });

  React.useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileFilterOpen]);

  // Products matching all filters except fabric
  const productsForFabricCounts = useMemo(() => {
    return PRODUCTS.filter((p) =>
      matchesCategory(p, selectedCategory) &&
      matchesOccasion(p, selectedOccasion) &&
      matchesPrice(p, selectedPriceRange) &&
      matchesSearch(p, initialQuery)
    );
  }, [selectedCategory, selectedOccasion, selectedPriceRange, initialQuery]);

  // Products matching all filters except occasion
  const productsForOccasionCounts = useMemo(() => {
    return PRODUCTS.filter((p) =>
      matchesCategory(p, selectedCategory) &&
      matchesFabric(p, selectedFabric) &&
      matchesPrice(p, selectedPriceRange) &&
      matchesSearch(p, initialQuery)
    );
  }, [selectedCategory, selectedFabric, selectedPriceRange, initialQuery]);

  // Products matching all filters except category
  const productsForCategoryCounts = useMemo(() => {
    return PRODUCTS.filter((p) =>
      matchesFabric(p, selectedFabric) &&
      matchesOccasion(p, selectedOccasion) &&
      matchesPrice(p, selectedPriceRange) &&
      matchesSearch(p, initialQuery)
    );
  }, [selectedFabric, selectedOccasion, selectedPriceRange, initialQuery]);

  const handleCategoryToggle = (catName: string) => {
    const isCurrent =
      selectedCategory.toLowerCase() === catName.toLowerCase() ||
      (catName.toLowerCase().includes("silk") && selectedCategory.toLowerCase() === "silk") ||
      (catName.toLowerCase().includes("handloom") && selectedCategory.toLowerCase() === "handloom") ||
      (catName.toLowerCase().includes("festive") && selectedCategory.toLowerCase() === "festive") ||
      (catName.toLowerCase().includes("bridal") && selectedCategory.toLowerCase() === "bridal") ||
      (catName.toLowerCase().includes("new") && selectedCategory.toLowerCase().includes("new"));

    const count = getCategoryItemCount(catName, productsForCategoryCounts);

    // Prevent selecting categories with zero items for active filters
    if (count === 0 && !isCurrent) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (isCurrent) {
      params.delete("category");
    } else {
      params.set("category", catName);
    }
    const newQuery = params.toString();
    router.push(newQuery ? `/shop?${newQuery}` : "/shop", { scroll: false });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (!matchesCategory(product, selectedCategory)) return false;
      if (!matchesFabric(product, selectedFabric)) return false;
      if (!matchesOccasion(product, selectedOccasion)) return false;
      if (!matchesPrice(product, selectedPriceRange)) return false;
      if (!matchesSearch(product, initialQuery)) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "popular") return (b.isTrending ? 2 : 0) + b.rating - ((a.isTrending ? 2 : 0) + a.rating);
      if (sortBy === "bestselling") return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      if (sortBy === "newest") return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
      return 0; // default featured
    });
  }, [selectedCategory, selectedFabric, selectedOccasion, selectedPriceRange, sortBy, initialQuery]);

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    (selectedFabric ? 1 : 0) +
    (selectedOccasion ? 1 : 0) +
    (selectedPriceRange !== null ? 1 : 0);

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("q");
    const qStr = params.toString();
    router.push(qStr ? `/shop?${qStr}` : "/shop", { scroll: false });
    setSelectedFabric("");
    setSelectedOccasion("");
    setSelectedPriceRange(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 lg:pb-12">
      {/* Breadcrumb & Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-xs text-neutral-600 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">{selectedCategory ? "Shop" : "All Products"}</span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-[#541920] font-semibold">{selectedCategory}</span>
              </>
            )}
          </nav>

          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900">
            {selectedCategory || "All Handcrafted Products"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans max-w-2xl">
            {selectedCategory
              ? "Explore authentic zari brocades, handloom weaves, and royal silk drapes curated with Silk Mark purity."
              : "Explore authentic zari brocades, royal silk drapes, designer blouses, and handcrafted jewellery curated with Silk Mark purity."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Control Bar: Total count, Mobile filter button, Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] bg-white border border-[#DCD5C9] rounded-xs text-xs font-semibold text-neutral-800 hover:bg-[#FAF7F2] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            <span className="text-xs text-neutral-600 font-sans">
              Showing <strong className="text-neutral-900">{filteredProducts.length}</strong>{" "}
              {selectedCategory && selectedCategory.toLowerCase().includes("saree")
                ? filteredProducts.length === 1
                  ? "saree"
                  : "sarees"
                : filteredProducts.length === 1
                ? "product"
                : "products"}
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="sort" className="text-xs text-neutral-600 whitespace-nowrap font-medium">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => {
                const newSort = e.target.value;
                setSortBy(newSort);
                const params = new URLSearchParams(searchParams.toString());
                params.set("sort", newSort);
                router.push(`/shop?${params.toString()}`, { scroll: false });
              }}
              className="bg-white border border-[#DCD5C9] text-neutral-800 text-xs rounded-xs px-3 py-2 min-h-[44px] focus:outline-none focus:border-[#541920] focus-visible:ring-2 focus-visible:ring-[#541920]"
              aria-label="Sort products by"
            >
              <option value="featured">Featured Weaves</option>
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Popular & Trending</option>
              <option value="bestselling">Bestsellers</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#E8E2D9]">
            <span className="text-xs text-neutral-600 font-medium">Active Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center pl-3 pr-1 py-0.5 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                <span>Category: {selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("category");
                    const qStr = params.toString();
                    router.push(qStr ? `/shop?${qStr}` : "/shop", { scroll: false });
                  }}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -my-2.5 -mr-1 flex items-center justify-center text-neutral-500 hover:text-red-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label={`Remove category filter: ${selectedCategory}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedFabric && (
              <span className="inline-flex items-center pl-3 pr-1 py-0.5 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                <span>Fabric: {selectedFabric}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFabric("")}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -my-2.5 -mr-1 flex items-center justify-center text-neutral-500 hover:text-red-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label={`Remove fabric filter: ${selectedFabric}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedOccasion && (
              <span className="inline-flex items-center pl-3 pr-1 py-0.5 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                <span>Occasion: {selectedOccasion}</span>
                <button
                  type="button"
                  onClick={() => setSelectedOccasion("")}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -my-2.5 -mr-1 flex items-center justify-center text-neutral-500 hover:text-red-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label={`Remove occasion filter: ${selectedOccasion}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {selectedPriceRange !== null && (
              <span className="inline-flex items-center pl-3 pr-1 py-0.5 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                <span>Price: {PRICE_RANGES[selectedPriceRange].label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPriceRange(null)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -my-2.5 -mr-1 flex items-center justify-center text-neutral-500 hover:text-red-600 transition-colors cursor-pointer rounded-full focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label={`Remove price filter: ${PRICE_RANGES[selectedPriceRange].label}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2.5 py-2 text-xs text-[#541920] font-semibold hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Shop Layout: Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
          
          {/* Desktop Left Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-sm border border-[#E8E2D9] space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
                <h3 className="font-serif text-base font-semibold text-neutral-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#541920]" />
                  <span>Filters</span>
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="min-h-[44px] px-2.5 inline-flex items-center text-xs text-[#541920] hover:underline font-semibold cursor-pointer rounded-xs focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2.5">
                  Category
                </h4>
                <div className="space-y-1.5">
                  {CATEGORIES.map((cat) => {
                    const isSelected =
                      selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                      (cat.name.toLowerCase().includes("silk") && selectedCategory.toLowerCase() === "silk") ||
                      (cat.name.toLowerCase().includes("handloom") && selectedCategory.toLowerCase() === "handloom") ||
                      (cat.name.toLowerCase().includes("festive") && selectedCategory.toLowerCase() === "festive") ||
                      (cat.name.toLowerCase().includes("bridal") && selectedCategory.toLowerCase() === "bridal") ||
                      (cat.name.toLowerCase().includes("new") && selectedCategory.toLowerCase().includes("new"));

                    const count = getCategoryItemCount(cat.name, productsForCategoryCounts);
                    const isDisabled = count === 0 && !isSelected;

                    return (
                      <button
                        key={cat.id}
                        disabled={isDisabled}
                        aria-disabled={isDisabled}
                        onClick={() => !isDisabled && handleCategoryToggle(cat.name)}
                        className={`w-full min-h-[44px] px-2.5 py-2 flex items-center justify-between text-xs text-left rounded-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                          isDisabled
                            ? "cursor-not-allowed text-neutral-600"
                            : isSelected
                            ? "text-[#541920] font-bold bg-[#541920]/5 cursor-pointer"
                            : "text-neutral-800 hover:text-black hover:bg-[#FAF7F2] cursor-pointer"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={`text-[11px] ${isDisabled ? "text-neutral-500" : isSelected ? "text-[#541920]" : "text-neutral-600 font-medium"}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Ranges */}
              <div className="border-t border-[#E8E2D9] pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2.5">
                  Price
                </h4>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((range, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 text-xs min-h-[44px] px-2.5 rounded-xs text-neutral-700 hover:text-black hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="desktop-price"
                        checked={selectedPriceRange === idx}
                        onChange={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
                        onClick={() => {
                          if (selectedPriceRange === idx) {
                            setSelectedPriceRange(null);
                          }
                        }}
                        className="text-[#541920] focus:ring-[#541920] w-4 h-4"
                      />
                      <span>{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div className="border-t border-[#E8E2D9] pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2.5">
                  Fabric & Weave
                </h4>
                <div className="space-y-1.5">
                  {FABRICS.map((fabric) => {
                    const count = getFabricItemCount(fabric, productsForFabricCounts);
                    const isDisabled = count === 0 && selectedFabric !== fabric;

                    return (
                      <button
                        key={fabric}
                        disabled={isDisabled}
                        aria-disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedFabric(selectedFabric === fabric ? "" : fabric)}
                        className={`w-full min-h-[44px] px-2.5 py-2 flex items-center justify-between text-xs text-left rounded-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                          isDisabled
                            ? "cursor-not-allowed text-neutral-600"
                            : selectedFabric === fabric
                            ? "text-[#541920] font-bold bg-[#541920]/5 cursor-pointer"
                            : "text-neutral-800 hover:text-black hover:bg-[#FAF7F2] cursor-pointer"
                        }`}
                      >
                        <span>{fabric}</span>
                        <span className={`text-[11px] ${isDisabled ? "text-neutral-500" : selectedFabric === fabric ? "text-[#541920]" : "text-neutral-600 font-medium"}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Occasion */}
              <div className="border-t border-[#E8E2D9] pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2.5">
                  Occasion
                </h4>
                <div className="space-y-1.5">
                  {OCCASIONS.map((occ) => {
                    const count = getOccasionItemCount(occ, productsForOccasionCounts);
                    const isDisabled = count === 0 && selectedOccasion !== occ;

                    return (
                      <button
                        key={occ}
                        disabled={isDisabled}
                        aria-disabled={isDisabled}
                        onClick={() => !isDisabled && setSelectedOccasion(selectedOccasion === occ ? "" : occ)}
                        className={`w-full min-h-[44px] px-2.5 py-2 flex items-center justify-between text-xs text-left rounded-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                          isDisabled
                            ? "cursor-not-allowed text-neutral-600"
                            : selectedOccasion === occ
                            ? "text-[#541920] font-bold bg-[#541920]/5 cursor-pointer"
                            : "text-neutral-800 hover:text-black hover:bg-[#FAF7F2] cursor-pointer"
                        }`}
                      >
                        <span>{occ}</span>
                        <span className={`text-[11px] ${isDisabled ? "text-neutral-500" : selectedOccasion === occ ? "text-[#541920]" : "text-neutral-600 font-medium"}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-sm border border-[#E8E2D9] text-center space-y-4">
                <p className="font-serif text-lg text-neutral-800">
                  {selectedCategory && selectedCategory.toLowerCase().includes("saree")
                    ? "No sarees found matching your selected filters."
                    : "No products found matching your selected filters."}
                </p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try clearing some filter criteria to browse our handcrafted catalogue.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#541920] text-white text-xs uppercase tracking-widest font-semibold rounded-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-over Sheet */}
      {isMobileFilterOpen && (
        <div
          ref={mobileFilterRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 overflow-hidden lg:hidden outline-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
          aria-label="Filter products"
        >
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-[#FAF7F2] text-[#1C1A18] flex flex-col shadow-2xl">
              
              <div className="p-4 border-b border-[#E8E2D9] flex items-center justify-between bg-[#F4EFE6]">
                <div>
                  <h3 id="mobile-filters-title" className="font-serif text-base font-semibold">
                    {selectedCategory && selectedCategory.toLowerCase().includes("saree")
                      ? "Filter Sarees"
                      : "Filter Products"}
                  </h3>
                  <p className="text-[11px] text-neutral-600 mt-0.5">
                    Showing {filteredProducts.length} {filteredProducts.length === 1 ? (selectedCategory?.toLowerCase().includes("saree") ? "saree" : "product") : (selectedCategory?.toLowerCase().includes("saree") ? "sarees" : "products")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-2 text-neutral-500 hover:text-black rounded-full flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-6 flex-1">
                {/* Category */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                    Category
                  </h4>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => {
                      const isSelected =
                        selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                        (cat.name.toLowerCase().includes("silk") && selectedCategory.toLowerCase() === "silk") ||
                        (cat.name.toLowerCase().includes("handloom") && selectedCategory.toLowerCase() === "handloom") ||
                        (cat.name.toLowerCase().includes("festive") && selectedCategory.toLowerCase() === "festive") ||
                        (cat.name.toLowerCase().includes("bridal") && selectedCategory.toLowerCase() === "bridal") ||
                        (cat.name.toLowerCase().includes("new") && selectedCategory.toLowerCase().includes("new"));

                      const count = getCategoryItemCount(cat.name, productsForCategoryCounts);
                      const isDisabled = count === 0 && !isSelected;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          disabled={isDisabled}
                          aria-disabled={isDisabled}
                          onClick={() => !isDisabled && handleCategoryToggle(cat.name)}
                          className={`w-full min-h-[44px] flex items-center justify-between px-2.5 py-2 text-xs text-left rounded-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                            isDisabled
                              ? "cursor-not-allowed text-neutral-600 bg-neutral-200/20"
                              : isSelected
                              ? "text-[#541920] font-bold bg-[#541920]/5 cursor-pointer"
                              : "text-neutral-800 hover:bg-black/5 cursor-pointer"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{cat.name}</span>
                            <span className={`text-[11px] ${isDisabled ? "text-neutral-500" : isSelected ? "text-[#541920]" : "text-neutral-600 font-medium"}`}>({count})</span>
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#541920]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price */}
                <div className="border-t border-[#E8E2D9] pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                    Price Range
                  </h4>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((range, idx) => (
                      <label
                        key={idx}
                        className="min-h-[44px] flex items-center gap-2.5 px-2.5 py-2 text-xs text-neutral-600 rounded-xs hover:bg-black/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="mobile-price"
                          checked={selectedPriceRange === idx}
                          onChange={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
                          onClick={() => {
                            if (selectedPriceRange === idx) {
                              setSelectedPriceRange(null);
                            }
                          }}
                          className="w-4 h-4 text-[#541920] accent-[#541920]"
                        />
                        <span>{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Fabric */}
                <div className="border-t border-[#E8E2D9] pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                    Fabric
                  </h4>
                  <div className="space-y-1">
                    {FABRICS.map((fabric) => {
                      const count = getFabricItemCount(fabric, productsForFabricCounts);
                      const isDisabled = count === 0 && selectedFabric !== fabric;

                      return (
                        <button
                          key={fabric}
                          type="button"
                          disabled={isDisabled}
                          aria-disabled={isDisabled}
                          onClick={() => !isDisabled && setSelectedFabric(selectedFabric === fabric ? "" : fabric)}
                          className={`w-full min-h-[44px] px-2.5 py-2 flex items-center justify-between text-left text-xs rounded-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                            isDisabled
                              ? "cursor-not-allowed text-neutral-600 bg-neutral-200/20"
                              : selectedFabric === fabric
                              ? "text-[#541920] font-bold bg-[#541920]/5 cursor-pointer"
                              : "text-neutral-800 hover:bg-black/5 cursor-pointer"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{fabric}</span>
                            <span className={`text-[11px] ${isDisabled ? "text-neutral-500" : selectedFabric === fabric ? "text-[#541920]" : "text-neutral-600 font-medium"}`}>({count})</span>
                          </span>
                          {selectedFabric === fabric && <Check className="w-3.5 h-3.5 text-[#541920]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Occasion */}
                <div className="border-t border-[#E8E2D9] pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                    Occasion
                  </h4>
                  <div className="space-y-1">
                    {OCCASIONS.map((occ) => {
                      const count = getOccasionItemCount(occ, productsForOccasionCounts);
                      const isDisabled = count === 0 && selectedOccasion !== occ;

                      return (
                        <button
                          key={occ}
                          type="button"
                          disabled={isDisabled}
                          aria-disabled={isDisabled}
                          onClick={() => !isDisabled && setSelectedOccasion(selectedOccasion === occ ? "" : occ)}
                          className={`w-full min-h-[44px] px-2.5 py-2 flex items-center justify-between text-left text-xs rounded-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#541920] focus-visible:outline-none ${
                            isDisabled
                              ? "cursor-not-allowed text-neutral-600 bg-neutral-200/20"
                              : selectedOccasion === occ
                              ? "text-[#541920] font-bold bg-[#541920]/5 cursor-pointer"
                              : "text-neutral-800 hover:bg-black/5 cursor-pointer"
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            <span>{occ}</span>
                            <span className={`text-[11px] ${isDisabled ? "text-neutral-500" : selectedOccasion === occ ? "text-[#541920]" : "text-neutral-600 font-medium"}`}>({count})</span>
                          </span>
                          {selectedOccasion === occ && <Check className="w-3.5 h-3.5 text-[#541920]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E8E2D9] bg-[#F4EFE6] flex gap-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex-1 min-h-[44px] py-2.5 bg-white border border-[#DCD5C9] text-xs font-semibold rounded-xs hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 min-h-[44px] py-2.5 bg-[#541920] text-white text-xs font-semibold rounded-xs hover:bg-[#3D1217] transition-colors cursor-pointer"
                >
                  Close Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-500 font-sans">Loading products...</div>}>
      <ShopContent />
    </Suspense>
  );
}
