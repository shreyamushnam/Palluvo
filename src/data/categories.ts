import { PRODUCTS } from "./products";

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
  const norm = categoryNameOrQuery.toLowerCase().trim().replace(/\+/g, " ");
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
  } else {
    const root = norm.replace(/sarees?/g, "").trim();
    return root ? encodeURIComponent(root) : "";
  }
}

export function getCategoryHref(categoryNameOrQuery: string): string {
  const canon = getCategoryCanonicalQuery(categoryNameOrQuery);
  return canon ? `/shop?category=${canon}` : "/shop";
}

export function getCategoryItemCount(categoryName: string): number {
  const norm = categoryName.toLowerCase().trim().replace(/\+/g, " ");
  return PRODUCTS.filter((product) => {
    if (norm.includes("new arrival") || norm.includes("new")) {
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
  }).length;
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
];

export const CATEGORIES: Category[] = CATEGORY_DEFINITIONS.map((cat) => ({
  ...cat,
  get itemCount() {
    return getCategoryItemCount(cat.canonicalQuery || cat.name);
  },
}));
