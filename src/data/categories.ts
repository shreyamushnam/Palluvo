import { PRODUCTS } from "./products";

export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
}

export function getCategoryItemCount(categoryName: string): number {
  const norm = categoryName.toLowerCase().trim();
  return PRODUCTS.filter((product) => {
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
  }).length;
}

const CATEGORY_DEFINITIONS: Omit<Category, "itemCount">[] = [
  {
    id: "cat-silk",
    name: "Silk Sarees",
    image: "/images/categories/silk-sarees.jpg",
  },
  {
    id: "cat-handloom",
    name: "Handloom Sarees",
    image: "/images/categories/handloom-sarees.jpg",
  },
  {
    id: "cat-cotton",
    name: "Cotton Sarees",
    image: "/images/categories/cotton-sarees.jpg",
  },
  {
    id: "cat-festive",
    name: "Festive Sarees",
    image: "/images/categories/festive-sarees.jpg",
  },
  {
    id: "cat-bridal",
    name: "Bridal Sarees",
    image: "/images/categories/bridal-sarees.jpg",
  },
  {
    id: "cat-party",
    name: "Party Wear",
    image: "/images/categories/party-wear.jpg",
  },
  {
    id: "cat-printed",
    name: "Printed Sarees",
    image: "/images/categories/printed-sarees.jpg",
  },
  {
    id: "cat-new",
    name: "New Arrivals",
    image: "/images/categories/new-arrivals.jpg",
  },
];

export const CATEGORIES: Category[] = CATEGORY_DEFINITIONS.map((cat) => ({
  ...cat,
  get itemCount() {
    return getCategoryItemCount(cat.name);
  },
}));
