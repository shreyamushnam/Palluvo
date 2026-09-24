export interface Category {
  id: string;
  name: string;
  image: string;
  itemCount: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "cat-silk",
    name: "Silk Sarees",
    image: "/images/categories/silk-sarees.jpg",
    itemCount: 48,
  },
  {
    id: "cat-handloom",
    name: "Handloom Sarees",
    image: "/images/categories/handloom-sarees.jpg",
    itemCount: 36,
  },
  {
    id: "cat-cotton",
    name: "Cotton Sarees",
    image: "/images/categories/cotton-sarees.jpg",
    itemCount: 28,
  },
  {
    id: "cat-festive",
    name: "Festive Sarees",
    image: "/images/categories/festive-sarees.jpg",
    itemCount: 42,
  },
  {
    id: "cat-bridal",
    name: "Bridal Sarees",
    image: "/images/categories/bridal-sarees.jpg",
    itemCount: 24,
  },
  {
    id: "cat-party",
    name: "Party Wear",
    image: "/images/categories/party-wear.jpg",
    itemCount: 32,
  },
  {
    id: "cat-printed",
    name: "Printed Sarees",
    image: "/images/categories/printed-sarees.jpg",
    itemCount: 19,
  },
  {
    id: "cat-new",
    name: "New Arrivals",
    image: "/images/categories/new-arrivals.jpg",
    itemCount: 24,
  },
];
