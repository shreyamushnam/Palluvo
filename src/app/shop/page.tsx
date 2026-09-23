"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Filter, X, ChevronDown, SlidersHorizontal, Check } from "lucide-react";
import { PRODUCTS, Product } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { ProductCard } from "@/components/ecommerce/ProductCard";

const FABRICS = [
  "Pure Silk",
  "Kanjeevaram Silk",
  "Banarasi Brocade Silk",
  "Paithani Silk",
  "Pure Linen",
  "Tissue Organza",
  "Chiffon",
  "Handspun Tussar Silk",
];

const OCCASIONS = [
  "Bridal & Wedding",
  "Festive & Ceremonial",
  "Party Wear",
  "Cocktail & Evening",
  "Workwear & Casual",
];

const PRICE_RANGES = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹15,000", min: 10000, max: 15000 },
  { label: "Above ₹15,000", min: 15000, max: 999999 },
];

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFabric, setSelectedFabric] = useState<string>("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Fabric filter
      if (selectedFabric && !product.fabric.toLowerCase().includes(selectedFabric.toLowerCase())) {
        return false;
      }
      // Occasion filter
      if (selectedOccasion && !product.occasion.toLowerCase().includes(selectedOccasion.toLowerCase().split(" ")[0])) {
        return false;
      }
      // Price range filter
      if (selectedPriceRange !== null) {
        const range = PRICE_RANGES[selectedPriceRange];
        if (product.price < range.min || product.price > range.max) {
          return false;
        }
      }
      // Search query
      if (initialQuery) {
        const q = initialQuery.toLowerCase();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.fabric.toLowerCase().includes(q) ||
          product.category.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
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
    setSelectedCategory("");
    setSelectedFabric("");
    setSelectedOccasion("");
    setSelectedPriceRange(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Breadcrumb & Header */}
      <div className="bg-[#F4EFE6] border-b border-[#E8E2D9] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-neutral-500 mb-2 flex items-center gap-1.5 font-sans">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>/</span>
            <span className="text-neutral-900 font-medium">Shop Sarees</span>
            {selectedCategory && (
              <>
                <span>/</span>
                <span className="text-[#541920] font-semibold">{selectedCategory}</span>
              </>
            )}
          </nav>

          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-neutral-900">
            {selectedCategory || "All Handcrafted Sarees"}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-sans max-w-2xl">
            Explore authentic zari brocades, handloom weaves, and royal silk drapes curated with Silk Mark purity.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Control Bar: Total count, Mobile filter button, Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DCD5C9] rounded-xs text-xs font-semibold text-neutral-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            <span className="text-xs text-neutral-600 font-sans">
              Showing <strong className="text-neutral-900">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "saree" : "sarees"}
            </span>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="sort" className="text-xs text-neutral-500 whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#DCD5C9] text-neutral-800 text-xs rounded-xs px-3 py-2 focus:outline-none focus:border-[#541920]"
            >
              <option value="featured">Featured Weaves</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-[#E8E2D9]">
            <span className="text-xs text-neutral-500 font-medium">Active Filters:</span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("")} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFabric && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                Fabric: {selectedFabric}
                <button onClick={() => setSelectedFabric("")} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedOccasion && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                Occasion: {selectedOccasion}
                <button onClick={() => setSelectedOccasion("")} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPriceRange !== null && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD5C9] rounded-full text-xs text-neutral-800">
                Price: {PRICE_RANGES[selectedPriceRange].label}
                <button onClick={() => setSelectedPriceRange(null)} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#541920] font-semibold hover:underline ml-2"
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
                    className="text-xs text-[#541920] hover:underline font-medium"
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
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
                      className={`w-full flex items-center justify-between py-1 text-xs text-left transition-colors ${
                        selectedCategory === cat.name
                          ? "text-[#541920] font-bold"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] text-neutral-400">({cat.itemCount})</span>
                    </button>
                  ))}
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
                      className="flex items-center gap-2 text-xs text-neutral-600 hover:text-black cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="desktop-price"
                        checked={selectedPriceRange === idx}
                        onChange={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
                        className="text-[#541920] focus:ring-[#541920]"
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
                  {FABRICS.map((fabric) => (
                    <button
                      key={fabric}
                      onClick={() => setSelectedFabric(selectedFabric === fabric ? "" : fabric)}
                      className={`w-full text-left text-xs py-1 transition-colors ${
                        selectedFabric === fabric
                          ? "text-[#541920] font-bold"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      {fabric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion */}
              <div className="border-t border-[#E8E2D9] pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2.5">
                  Occasion
                </h4>
                <div className="space-y-1.5">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ}
                      onClick={() => setSelectedOccasion(selectedOccasion === occ ? "" : occ)}
                      className={`w-full text-left text-xs py-1 transition-colors ${
                        selectedOccasion === occ
                          ? "text-[#541920] font-bold"
                          : "text-neutral-600 hover:text-black"
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-sm border border-[#E8E2D9] text-center space-y-4">
                <p className="font-serif text-lg text-neutral-800">
                  No sarees found matching your selected filters.
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
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-[#FAF7F2] text-[#1C1A18] flex flex-col shadow-2xl">
              
              <div className="p-4 border-b border-[#E8E2D9] flex items-center justify-between bg-[#F4EFE6]">
                <h3 className="font-serif text-base font-semibold">Filter Sarees</h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black"
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
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(selectedCategory === cat.name ? "" : cat.name)}
                        className={`w-full flex items-center justify-between py-1.5 text-xs text-left ${
                          selectedCategory === cat.name ? "text-[#541920] font-bold" : "text-neutral-600"
                        }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.name && <Check className="w-3.5 h-3.5 text-[#541920]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="border-t border-[#E8E2D9] pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-800 mb-2">
                    Price Range
                  </h4>
                  <div className="space-y-1.5">
                    {PRICE_RANGES.map((range, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-xs text-neutral-600">
                        <input
                          type="radio"
                          name="mobile-price"
                          checked={selectedPriceRange === idx}
                          onChange={() => setSelectedPriceRange(idx)}
                          className="text-[#541920]"
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
                    {FABRICS.map((fabric) => (
                      <button
                        key={fabric}
                        onClick={() => setSelectedFabric(selectedFabric === fabric ? "" : fabric)}
                        className={`w-full text-left text-xs py-1.5 ${
                          selectedFabric === fabric ? "text-[#541920] font-bold" : "text-neutral-600"
                        }`}
                      >
                        {fabric}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E8E2D9] bg-[#F4EFE6] flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 bg-white border border-[#DCD5C9] text-xs font-semibold rounded-xs"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-[#541920] text-white text-xs font-semibold rounded-xs"
                >
                  Apply Filters
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-500 font-sans">Loading sarees...</div>}>
      <ShopContent />
    </Suspense>
  );
}
