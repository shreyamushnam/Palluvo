export interface CustomerReview {
  id: string;
  rating: number;
  review: string;
  customerName: string;
  location: string;
  productName: string;
  verifiedPurchase: boolean;
  date: string;
}

export const CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: "rev-1",
    rating: 5,
    review: "Beautiful fabric and exactly as shown. The zari work is subtle and very elegant, not glaringly shiny. Wore it for my sister's reception and received so many compliments!",
    customerName: "Pooja H.",
    location: "Bangalore",
    productName: "Wine Tissue Silk Saree",
    verifiedPurchase: true,
    date: "2 days ago",
  },
  {
    id: "rev-2",
    rating: 5,
    review: "The drape of this organza saree is exceptional! It does not puff up awkwardly like cheaper organzas. Comes with lovely unbleached box packaging.",
    customerName: "Meenakshi S.",
    location: "Chennai",
    productName: "Emerald Green Organza Saree",
    verifiedPurchase: true,
    date: "1 week ago",
  },
  {
    id: "rev-3",
    rating: 5,
    review: "Pure handloom magic. The tussar texture feels breathable and regal. Ordering another one in the terracotta shade for Diwali.",
    customerName: "Ananya R.",
    location: "Kolkata",
    productName: "Handspun Tussar Ghicha Drape",
    verifiedPurchase: true,
    date: "2 weeks ago",
  },
  {
    id: "rev-4",
    rating: 5,
    review: "Worth every single rupee. The Kanjeevaram silk is rich, heavyweight, and the peacock border is woven with true mastery.",
    customerName: "Dr. Radhika N.",
    location: "Mumbai",
    productName: "Royal Crimson Bridal Kanjeevaram",
    verifiedPurchase: true,
    date: "3 weeks ago",
  },
];
