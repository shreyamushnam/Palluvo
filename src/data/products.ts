export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductDetails {
  length: string;
  blousePiece: string;
  work: string;
  occasion: string;
  careInstructions: string;
}

export interface Product {
  id: string;
  name: string;
  fabric: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewsCount: number;
  reviewCount?: number;
  category: "Silk" | "Handloom" | "Cotton" | "Festive" | "Bridal" | "Party Wear" | "Printed";
  color: string;
  colorHex: string;
  occasion: "Wedding" | "Festive" | "Party" | "Casual";
  primaryImage: string;
  hoverImage: string;
  images: string[];
  description: string;
  details: ProductDetails;
  colors: ProductColor[];
  hasBlousePiece: boolean;
  blouseOptions?: string[];
  inStock: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  isSilkMark?: boolean;
  tags?: string[];
  origin?: string;
  zari?: string;
  length?: string;
  blouseLength?: string;
  careInstructions?: string;
}

export interface LookItem {
  id: string;
  type: "Saree" | "Blouse" | "Jewelry";
  name: string;
  title?: string;
  role?: string;
  price: number;
  image: string;
  fabricOrMaterial: string;
  productId?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "pal-001",
    name: "Wine Tissue Silk Saree",
    fabric: "Silk Blend with Metallic Zari",
    price: 2999,
    originalPrice: 3499,
    discountPercent: 14,
    rating: 4.8,
    reviewsCount: 142,
    category: "Silk",
    color: "Wine",
    colorHex: "#541920",
    occasion: "Festive",
    primaryImage: "/images/hero-saree.jpg",
    hoverImage: "https://images.unsplash.com/photo-1614940685083-c5409b57da6e?q=80&w=1000&auto=format&fit=crop",
    images: [
      "/images/hero-saree.jpg",
      "https://images.unsplash.com/photo-1614940685083-c5409b57da6e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1698657169585-0fce00d3ad9c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1698657169427-a24d79024f14?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "An heirloom wine silk saree woven with lustrous antique gold zari along the border and pallu. Lightweight and fluid, it drapes like liquid poetry, perfect for intimate festive evenings and weddings.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter unstitched matching brocade silk fabric included",
      work: "Intricate metallic electroplated antique gold zari border with hand-twisted pallu tassels",
      occasion: "Festive ceremonies, evening receptions, weddings",
      careInstructions: "Dry clean only. Store wrapped in unbleached pure cotton muslin cloth.",
    },
    colors: [
      { name: "Wine", hex: "#541920" },
      { name: "Emerald", hex: "#1A4D2E" },
      { name: "Royal Blue", hex: "#1B3B6F" },
      { name: "Deep Crimson", hex: "#7B1113" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
    isTrending: true,
  },
  {
    id: "pal-002",
    name: "Emerald Green Organza Saree",
    fabric: "Pure Sheer Silk Organza",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    rating: 4.9,
    reviewsCount: 98,
    category: "Festive",
    color: "Green",
    colorHex: "#1A4D2E",
    occasion: "Party",
    primaryImage: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1610313461564-489bda80660a?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610313461564-489bda80660a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1631005436600-15dd6ddabf92?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "Gossamer emerald organza saree adorned with delicate scalloped cutwork and fine silver zari butis. Designed for contemporary cocktail galas and celebratory sangeet nights.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter heavy embroidered satin blouse piece included",
      work: "Hand-finished scallop embroidery with resham and micro-sequin detailing",
      occasion: "Cocktail parties, festive soirees, summer weddings",
      careInstructions: "Professional dry clean only. Do not iron directly on organza; use steam press.",
    },
    colors: [
      { name: "Emerald", hex: "#1A4D2E" },
      { name: "Dusty Pink", hex: "#D49B9B" },
      { name: "Powder Blue", hex: "#9EB7D4" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isNewArrival: true,
    isTrending: true,
  },
  {
    id: "pal-003",
    name: "Handspun Tussar Ghicha Drape",
    fabric: "Wild Ahimsa Tussar Silk",
    price: 3299,
    originalPrice: 3999,
    discountPercent: 17,
    rating: 4.7,
    reviewsCount: 86,
    category: "Handloom",
    color: "Cream",
    colorHex: "#F2E8DC",
    occasion: "Casual",
    primaryImage: "https://images.unsplash.com/photo-1630267693092-2ea1f7dcc9a5?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1610313416292-e350ece568f6?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1630267693092-2ea1f7dcc9a5?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1610313416292-e350ece568f6?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "An authentic hand-reeled wild tussar silk saree crafted on village pit looms. Distinct natural slub texture with contrasting smoked terracotta selvedge borders.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter handloom running tussar blouse piece included",
      work: "Hand-spun natural ghicha weft with contrast temple border motifs",
      occasion: "Art exhibitions, day gatherings, formal boardroom meetings",
      careInstructions: "Dry clean recommended. Gentle cold hand wash with mild silk detergent.",
    },
    colors: [
      { name: "Raw Ivory", hex: "#F2E8DC" },
      { name: "Terracotta", hex: "#BF6A54" },
      { name: "Mustard", hex: "#D4A338" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isBestseller: true,
  },
  {
    id: "pal-004",
    name: "Royal Crimson Bridal Kanjeevaram",
    fabric: "Pure Mulberry Silk (160 GSM)",
    price: 7499,
    originalPrice: 9999,
    discountPercent: 25,
    rating: 5.0,
    reviewsCount: 64,
    category: "Bridal",
    color: "Red",
    colorHex: "#8B1E26",
    occasion: "Wedding",
    primaryImage: "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1664636124899-4a121f1ce449?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1664636124899-4a121f1ce449?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614940685083-c5409b57da6e?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "The crown jewel of Indian bridal heritage. Handcrafted with heavy three-ply pure mulberry silk and authentic gold-plated silver zari portraying royal peacocks and floral vines.",
    details: {
      length: "5.5 meters",
      blousePiece: "1.0 meter heavy brocade zari blouse fabric with matching border included",
      work: "Traditional Korvai interlocking border technique with heavy zari pallu",
      occasion: "Bridal ceremony, grand wedding receptions",
      careInstructions: "Specialized bridal dry clean only. Store flat in acid-free tissue inside a dark cedar chest.",
    },
    colors: [
      { name: "Royal Crimson", hex: "#8B1E26" },
      { name: "Sindoor Red", hex: "#A81E1E" },
      { name: "Rani Pink", hex: "#C71585" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isBestseller: true,
    isNewArrival: false,
    isTrending: true,
  },
  {
    id: "pal-005",
    name: "Midnight Noir Matka Silk Saree",
    fabric: "High-Twist Matka Silk",
    price: 3499,
    originalPrice: 4299,
    discountPercent: 18,
    rating: 4.8,
    reviewsCount: 79,
    category: "Party Wear",
    color: "Black",
    colorHex: "#1C1A18",
    occasion: "Party",
    primaryImage: "https://images.unsplash.com/photo-1737275857760-1c4b42f8bb8b?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1708182564325-fb1d3a3864d3?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1737275857760-1c4b42f8bb8b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1708182564325-fb1d3a3864d3?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "An enigmatic midnight black matka saree with subtle silver thread inlays along the drape edge. Understated, architectural, and effortlessly chic for modern evening wear.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter matching black matka blouse piece included",
      work: "Oxidized gunmetal silver thread woven selvedge",
      occasion: "Evening cocktails, dinner galas, festive celebrations",
      careInstructions: "Dry clean only. Steam press on medium heat.",
    },
    colors: [
      { name: "Midnight Black", hex: "#1C1A18" },
      { name: "Charcoal Grey", hex: "#4A4642" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isNewArrival: true,
  },
  {
    id: "pal-006",
    name: "Chanderi Gold Tissue Festive Saree",
    fabric: "Fine Chanderi Silk Cotton with Gold Zari Weft",
    price: 2499,
    originalPrice: 3199,
    discountPercent: 22,
    rating: 4.9,
    reviewsCount: 115,
    category: "Festive",
    color: "Gold",
    colorHex: "#C5A575",
    occasion: "Festive",
    primaryImage: "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1698657169210-9d6ec3860dc4?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1698657169210-9d6ec3860dc4?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "Luminous gold tissue saree woven in historic Chanderi. Adorned with delicate ashrafi coin butis that catch ambient festive light with radiant subtlety.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter contrast chanderi silk blouse fabric included",
      work: "Ek-Nali hand-loomed gold zari tissue weave with ashrafi motifs",
      occasion: "Diwali, Pooja celebrations, festive family gatherings",
      careInstructions: "Dry clean only. Do not wring or spin.",
    },
    colors: [
      { name: "Muted Gold", hex: "#C5A575" },
      { name: "Rose Gold", hex: "#B76E79" },
      { name: "Champagne Silver", hex: "#D9D6D0" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isBestseller: true,
    isTrending: true,
  },
  {
    id: "pal-007",
    name: "Pastel Floral Printed Pure Chiffon",
    fabric: "Featherlight Silk Chiffon",
    price: 1899,
    originalPrice: 2499,
    discountPercent: 24,
    rating: 4.7,
    reviewsCount: 160,
    category: "Printed",
    color: "Pink",
    colorHex: "#E6A8B8",
    occasion: "Casual",
    primaryImage: "https://images.unsplash.com/photo-1610313407085-8397d3ac4563?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610313407085-8397d3ac4563?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "Breezy pastel pink chiffon saree featuring hand-painted botanical watercolor blooms. Finished with a delicate micro-gota lace border for effortless daytime grace.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter unstitched matching crepe silk blouse piece included",
      work: "Digital floral art print with fine scalloped gota lace border",
      occasion: "Daytime brunches, baby showers, intimate garden soirees",
      careInstructions: "Gentle machine wash on wool cycle or hand wash in cold water.",
    },
    colors: [
      { name: "Blush Pink", hex: "#E6A8B8" },
      { name: "Mint Green", hex: "#A8D5BA" },
      { name: "Sky Blue", hex: "#A2C2E2" },
    ],
    hasBlousePiece: true,
    inStock: true,
    isNewArrival: true,
  },
  {
    id: "pal-008",
    name: "Dhakai Jamdani Handloom Cotton Saree",
    fabric: "100-Count Combed Fine Muslin Cotton",
    price: 2199,
    originalPrice: 2699,
    discountPercent: 18,
    rating: 4.6,
    reviewsCount: 71,
    category: "Cotton",
    color: "Blue",
    colorHex: "#1B3B6F",
    occasion: "Casual",
    primaryImage: "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1698657169582-64ec02a333f7?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1698657169582-64ec02a333f7?q=80&w=1000&auto=format&fit=crop",
    ],
    description: "Breathable, airy handspun cotton saree decorated with geometric Jamdani floral motifs woven manually thread-by-thread on traditional wooden looms.",
    details: {
      length: "5.5 meters",
      blousePiece: "0.8 meter matching pure cotton unstitched blouse included",
      work: "Authentic supplementary weft Jamdani weaving",
      occasion: "Daily office wear, cultural events, festive daytime affairs",
      careInstructions: "Hand wash separately in cold water with mild liquid detergent. Starch lightly if crisp pleats are preferred.",
    },
    colors: [
      { name: "Indigo Blue", hex: "#1B3B6F" },
      { name: "Natural Ecru", hex: "#EBE3D5" },
      { name: "Ruby Red", hex: "#9E2A2B" },
    ],
    hasBlousePiece: true,
    inStock: true,
  }
];

export const SHOP_THE_LOOK_ITEMS: LookItem[] = [
  {
    id: "look-saree",
    type: "Saree",
    name: "Wine Tissue Silk Saree",
    price: 2999,
    image: "/images/hero-saree.jpg",
    fabricOrMaterial: "Silk Blend with Antique Gold Zari",
    productId: "pal-001",
  },
  {
    id: "look-blouse",
    type: "Blouse",
    name: "Embroidered Zari Raw Silk Blouse",
    price: 1299,
    image: "https://images.unsplash.com/photo-1698657169585-0fce00d3ad9c?q=80&w=600&auto=format&fit=crop",
    fabricOrMaterial: "Pure Raw Silk with Maggam Work",
  },
  {
    id: "look-jewelry",
    type: "Jewelry",
    name: "Kundan & Polki Choker Necklace Set",
    price: 1499,
    image: "https://images.unsplash.com/photo-1614940685083-c5409b57da6e?q=80&w=600&auto=format&fit=crop",
    fabricOrMaterial: "Antique Gold Plated Brass & Pearls",
  },
];
