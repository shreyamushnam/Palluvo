import { PRODUCTS, type Product, getProductType } from "./products";

export interface Category {
  id: string;
  name: string;
  slug: string;
  canonicalQuery: string;
  image: string;
  itemCount: number;
}

export function getCategoryCanonicalQuery(categoryNameOrQuery: string): string {
  if (!categoryNameOrQuery) return "";
  const norm = categoryNameOrQuery.toLowerCase().trim();
  if (norm.includes("new arrival") || norm.includes("new")) {
    return "New+Arrivals";
  } else if (norm.includes("silk") && !norm.includes("cotton")) {
    return "Silk";
  } else if (norm.includes("handloom")) {
    return "Handloom";
  } else if (norm.includes("cotton")) {
    return "Cotton";
  } else if (norm.includes("festive")) {
    return "Festive";
  } else if (norm.includes("bridal") || norm.includes("wedding")) {
    return "Bridal";
  } else if (norm.includes("party")) {
    return "Party+Wear";
  } else if (norm.includes("printed")) {
    return "Printed";
  } else if (norm.includes("blouse")) {
    return "Blouses";
  } else if (norm.includes("jewel") || norm.includes("jhumka") || norm.includes("accessor")) {
    return "Jewelry";
  } else {
    const root = norm.replace(/sarees?/g, "").trim();
    return root ? encodeURIComponent(root) : "";
  }
}

export interface ProductBreadcrumb {
  label: string;
  href: string;
}

/**
 * Returns product-type-aware breadcrumb metadata for PDP navigation and JSON-LD structured data.
 * Prevents non-sarees (such as blouses and jewelry) from linking to saree-only category filters.
 */
export function getProductBreadcrumb(product: Product): ProductBreadcrumb {
  const type = getProductType(product);
  if (type === "blouse") {
    return {
      label: "Blouses",
      href: "/shop?category=Blouses",
    };
  }
  if (type === "jewelry") {
    return {
      label: "Jewelry",
      href: "/shop?category=Jewelry",
    };
  }
  return {
    label: product.category,
    href: getCategoryHref(product.category),
  };
}

export function getCategoryHref(categoryNameOrQuery: string): string {
  const canon = getCategoryCanonicalQuery(categoryNameOrQuery);
  return canon ? `/shop?category=${canon}` : "/shop";
}

export function matchesCategory(product: Product, category: string): boolean {
  if (!category) return true;
  const norm = category.toLowerCase().trim();
  const isSaree = getProductType(product) === "saree";

  if (norm.includes("new arrival") || norm.includes("new")) {
    return !!product.isNewArrival;
  } else if (norm.includes("silk") && !norm.includes("cotton")) {
    return (
      isSaree &&
      (product.category.toLowerCase() === "silk" ||
        (product.fabric.toLowerCase().includes("silk") &&
          !product.fabric.toLowerCase().includes("cotton") &&
          product.category.toLowerCase() !== "cotton"))
    );
  } else if (norm.includes("handloom")) {
    return isSaree && (product.category.toLowerCase() === "handloom" || product.fabric.toLowerCase().includes("handloom"));
  } else if (norm.includes("cotton")) {
    return isSaree && (product.category.toLowerCase() === "cotton" || product.fabric.toLowerCase().includes("cotton"));
  } else if (norm.includes("festive")) {
    return isSaree && (product.category.toLowerCase() === "festive" || product.occasion.toLowerCase() === "festive");
  } else if (norm.includes("bridal") || norm.includes("wedding")) {
    return isSaree && (product.category.toLowerCase() === "bridal" || product.occasion.toLowerCase() === "wedding");
  } else if (norm.includes("party")) {
    return product.category.toLowerCase() === "party wear" || product.occasion.toLowerCase() === "party";
  } else if (norm.includes("printed")) {
    return isSaree && product.category.toLowerCase() === "printed";
  } else if (norm.includes("blouse")) {
    return getProductType(product) === "blouse";
  } else if (norm.includes("jewel") || norm.includes("jhumka") || norm.includes("accessor")) {
    return getProductType(product) === "jewelry";
  } else {
    const isSareeQuery = norm.includes("saree");
    if (isSareeQuery && !isSaree) return false;
    const root = norm.replace(/sarees?/g, "").trim();
    if (!root) return isSaree;
    return (
      product.name.toLowerCase().includes(root) ||
      product.category.toLowerCase().includes(root) ||
      product.fabric.toLowerCase().includes(root) ||
      product.occasion.toLowerCase().includes(root) ||
      (product.tags || []).some((t) => t.toLowerCase().includes(root))
    );
  }
}

export function getCategoryItemCount(
  categoryName: string,
  productList: Product[] = PRODUCTS
): number {
  return productList.filter((product) => matchesCategory(product, categoryName)).length;
}

export function isCategoryActive(
  selectedCategory: string,
  cat: Category | Omit<Category, "itemCount">
): boolean {
  if (!selectedCategory) return false;
  const selNorm = selectedCategory.toLowerCase().trim();
  const catCanonNorm = cat.canonicalQuery.toLowerCase().trim().replace(/\+/g, " ");
  const catNameNorm = cat.name.toLowerCase().trim();

  if (selNorm === catCanonNorm || selNorm === catNameNorm) return true;
  if (catCanonNorm === "silk" && selNorm.includes("silk") && !selNorm.includes("cotton")) return true;
  if (catCanonNorm === "handloom" && selNorm.includes("handloom")) return true;
  if (catCanonNorm === "cotton" && selNorm.includes("cotton")) return true;
  if (catCanonNorm === "festive" && selNorm.includes("festive")) return true;
  if (catCanonNorm === "bridal" && (selNorm.includes("bridal") || selNorm.includes("wedding"))) return true;
  if (catCanonNorm.includes("party") && selNorm.includes("party")) return true;
  if (catCanonNorm === "printed" && selNorm.includes("printed")) return true;
  if (catCanonNorm.includes("new") && selNorm.includes("new")) return true;
  if (catCanonNorm === "blouses" && selNorm.includes("blouse")) return true;
  if (
    catCanonNorm === "jewelry" &&
    (selNorm.includes("jewel") || selNorm.includes("jhumka") || selNorm.includes("accessor"))
  ) return true;
  return false;
}

export function getCategoryDescription(categoryOrQuery?: string): string {
  if (!categoryOrQuery) {
    return "Explore authentic zari brocades, royal silk drapes, designer blouses, and handcrafted jewellery curated with artisanal elegance.";
  }
  const norm = categoryOrQuery.toLowerCase().trim();
  if (norm.includes("jewel") || norm.includes("jhumka") || norm.includes("accessor")) {
    return "Discover artisanal temple jewellery and handcrafted antique gold-plated adornments designed to complement your luxury drapes.";
  }
  if (norm.includes("blouse")) {
    return "Explore curated designer blouse pieces crafted in fine silk with intricate zari embroidery to complete your ensemble.";
  }
  if (norm.includes("silk") && !norm.includes("cotton")) {
    return "Explore lustrous silk weaves, rich zari brocades, and festive drapes crafted across celebrated handloom traditions.";
  }
  if (norm.includes("handloom")) {
    return "Discover heritage handloom weaves and timeless artisan drapes crafted with authentic weaving traditions.";
  }
  if (norm.includes("cotton")) {
    return "Explore lightweight cotton and chanderi silk sarees designed for breathable all-day elegance and festive grace.";
  }
  if (norm.includes("bridal") || norm.includes("wedding")) {
    return "Explore heirloom bridal drapes and opulent zari brocades curated for timeless wedding celebrations.";
  }
  if (norm.includes("festive")) {
    return "Celebrate festive moments in shimmering tissue silks, vibrant jewel tones, and celebratory gold zari drapes.";
  }
  if (norm.includes("party")) {
    return "Step into contemporary elegance with modern organza drapes, fine sequins, and evening celebrations wear.";
  }
  if (norm.includes("printed")) {
    return "Discover fluid georgette and printed floral drapes crafted for modern versatility and effortless styling.";
  }
  if (norm.includes("new")) {
    return "Explore the latest handcrafted drapes, designer blouses, and artisanal accessories fresh from our master weavers.";
  }
  return "Explore handcrafted drapes, designer blouses, and artisanal accessories curated with traditional craftsmanship.";
}

const CATEGORY_DEFINITIONS: Omit<Category, "itemCount">[] = [
  {
    id: "cat-silk",
    name: "Silk Sarees",
    slug: "silk",
    canonicalQuery: "Silk",
    image: "/images/categories/silk-sarees.jpg",
  },
  {
    id: "cat-handloom",
    name: "Handloom Sarees",
    slug: "handloom",
    canonicalQuery: "Handloom",
    image: "/images/categories/handloom-sarees.jpg",
  },
  {
    id: "cat-cotton",
    name: "Cotton Sarees",
    slug: "cotton",
    canonicalQuery: "Cotton",
    image: "/images/categories/cotton-sarees.jpg",
  },
  {
    id: "cat-festive",
    name: "Festive Sarees",
    slug: "festive",
    canonicalQuery: "Festive",
    image: "/images/categories/festive-sarees.jpg",
  },
  {
    id: "cat-bridal",
    name: "Bridal Sarees",
    slug: "bridal",
    canonicalQuery: "Bridal",
    image: "/images/categories/bridal-sarees.jpg",
  },
  {
    id: "cat-party",
    name: "Party Wear",
    slug: "party-wear",
    canonicalQuery: "Party+Wear",
    image: "/images/categories/party-wear.jpg",
  },
  {
    id: "cat-printed",
    name: "Printed Sarees",
    slug: "printed",
    canonicalQuery: "Printed",
    image: "/images/categories/printed-sarees.jpg",
  },
  {
    id: "cat-new",
    name: "New Arrivals",
    slug: "new-arrivals",
    canonicalQuery: "New+Arrivals",
    image: "/images/categories/new-arrivals.jpg",
  },
  {
    id: "cat-blouses",
    name: "Blouses",
    slug: "blouses",
    canonicalQuery: "Blouses",
    image: "/images/products/wine-blouse-piece.jpg",
  },
  {
    id: "cat-jewelry",
    name: "Jewelry",
    slug: "jewelry",
    canonicalQuery: "Jewelry",
    image: "/images/products/gold-jhumkas.jpg",
  },
];

export const CATEGORIES: Category[] = CATEGORY_DEFINITIONS.map((cat) => ({
  ...cat,
  get itemCount() {
    return getCategoryItemCount(cat.canonicalQuery || cat.name);
  },
}));
