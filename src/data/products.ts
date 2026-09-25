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
    fabric: "Tissue Silk",
    price: 3999,
    originalPrice: 4999,
    discountPercent: 20,
    rating: 4.8,
    reviewsCount: 120,
    reviewCount: 120,
    category: "Silk",
    color: "Wine",
    colorHex: "#541920",
    occasion: "Festive",
    primaryImage: "/images/products/wine-tissue-silk.jpg",
    hoverImage: "/images/hero-saree.jpg",
    images: [
      "/images/products/wine-tissue-silk.jpg",
      "/images/hero-saree.jpg",
    ],
    description: "An imperial masterpiece woven in luminous wine tissue silk with intricate antique gold zari borders and a regal pallu drape.",
    details: {
      length: "5.5 m (approx)",
      blousePiece: "Yes (0.8 m)",
      work: "Zari Weaving",
      occasion: "Festive, Wedding",
      careInstructions: "Strictly dry clean only.",
    },
    colors: [
      { name: "Wine", hex: "#541920" },
      { name: "Sapphire Blue", hex: "#1A365D" },
      { name: "Crimson Red", hex: "#991B1B" },
      { name: "Lavender", hex: "#A855F7" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
    isSilkMark: true,
    tags: ["silk", "festive", "wine", "tissue"],
    origin: "Varanasi, India",
    zari: "Antique Gold Zari",
  },
  {
    id: "pal-002",
    name: "Royal Blue Kanjeevaram Silk",
    fabric: "Pure Kanjeevaram Silk",
    price: 5699,
    originalPrice: 7500,
    discountPercent: 24,
    rating: 4.8,
    reviewsCount: 124,
    reviewCount: 124,
    category: "Silk",
    color: "Royal Blue",
    colorHex: "#1A365D",
    occasion: "Wedding",
    primaryImage: "/images/products/royal-blue-kanjeevaram.jpg",
    hoverImage: "/images/products/royal-blue-kanjeevaram.jpg",
    images: [
      "/images/products/royal-blue-kanjeevaram.jpg",
    ],
    description: "Handcrafted pure silk Kanjeevaram featuring traditional temple motifs and rich zari weaving for celebratory grandeur.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Temple Zari Border",
      occasion: "Bridal, Wedding",
      careInstructions: "Dry clean only. Wrap in muslin cloth.",
    },
    colors: [
      { name: "Royal Blue", hex: "#1A365D" },
      { name: "Gold", hex: "#C5A575" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isTrending: true,
    isSilkMark: true,
    tags: ["silk", "kanjeevaram", "blue", "wedding"],
    origin: "Kanchipuram, Tamil Nadu",
    zari: "Pure Gold Zari",
  },
  {
    id: "pal-003",
    name: "Purple Handloom Saree",
    fabric: "Handloom Silk",
    price: 3499,
    originalPrice: 4299,
    discountPercent: 18,
    rating: 4.8,
    reviewsCount: 89,
    reviewCount: 89,
    category: "Handloom",
    color: "Deep Purple",
    colorHex: "#581C87",
    occasion: "Festive",
    primaryImage: "/images/products/purple-handloom-saree.jpg",
    hoverImage: "/images/products/purple-handloom-saree.jpg",
    images: [
      "/images/products/purple-handloom-saree.jpg",
    ],
    description: "Artisanal handloom weave in imperial purple with delicate golden zari butta motifs across the drape.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Handwoven Butta & Border",
      occasion: "Festive, Ceremonial",
      careInstructions: "Dry clean only.",
    },
    colors: [
      { name: "Deep Purple", hex: "#581C87" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isBestseller: true,
    isSilkMark: true,
    tags: ["handloom", "purple", "festive"],
    origin: "Varanasi, India",
    zari: "Fine Zari Thread",
  },
  {
    id: "pal-004",
    name: "Mustard Cotton Saree",
    fabric: "Chanderi Cotton Silk",
    price: 2499,
    originalPrice: 2999,
    discountPercent: 17,
    rating: 4.7,
    reviewsCount: 95,
    reviewCount: 95,
    category: "Cotton",
    color: "Mustard Gold",
    colorHex: "#D97706",
    occasion: "Casual",
    primaryImage: "/images/products/mustard-cotton-saree.jpg",
    hoverImage: "/images/products/mustard-cotton-saree.jpg",
    images: [
      "/images/products/mustard-cotton-saree.jpg",
    ],
    description: "Radiant mustard yellow lightweight cotton silk saree with fine woven border, designed for all-day festive comfort.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Subtle Woven Border",
      occasion: "Daytime Celebrations, Haldi",
      careInstructions: "Gentle hand wash or dry clean.",
    },
    colors: [
      { name: "Mustard Gold", hex: "#D97706" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isNewArrival: true,
    tags: ["cotton", "mustard", "yellow", "haldi"],
    origin: "Chanderi, Madhya Pradesh",
  },
  {
    id: "pal-005",
    name: "Red Banarasi Saree",
    fabric: "Pure Katan Silk",
    price: 6300,
    originalPrice: 8000,
    discountPercent: 22,
    rating: 4.9,
    reviewsCount: 210,
    reviewCount: 210,
    category: "Bridal",
    color: "Crimson Red",
    colorHex: "#B91C1C",
    occasion: "Wedding",
    primaryImage: "/images/products/red-banarasi-saree.jpg",
    hoverImage: "/images/products/red-banarasi-saree.jpg",
    images: [
      "/images/products/red-banarasi-saree.jpg",
    ],
    description: "Heirloom bridal red Banarasi brocade woven over weeks with opulent floral jaal zari and rich scalloped borders.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Kadwa Zari Brocade",
      occasion: "Bridal, Reception",
      careInstructions: "Dry clean only.",
    },
    colors: [
      { name: "Crimson Red", hex: "#B91C1C" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isBestseller: true,
    isSilkMark: true,
    tags: ["bridal", "red", "banarasi", "wedding"],
    origin: "Varanasi, India",
    zari: "Real Gold Brocade",
  },
  {
    id: "pal-006",
    name: "Black Chiffon Saree",
    fabric: "Chiffon Silk",
    price: 3100,
    originalPrice: 3800,
    discountPercent: 18,
    rating: 4.7,
    reviewsCount: 86,
    reviewCount: 86,
    category: "Party Wear",
    color: "Jet Black",
    colorHex: "#18181B",
    occasion: "Party",
    primaryImage: "/images/products/black-chiffon-saree.jpg",
    hoverImage: "/images/products/black-chiffon-saree.jpg",
    images: [
      "/images/products/black-chiffon-saree.jpg",
    ],
    description: "Flowing midnight black chiffon saree accented with delicate metallic gold sequin lace border for evening soirees.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Gold Sequin Lace",
      occasion: "Cocktail, Evening Party",
      careInstructions: "Dry clean only.",
    },
    colors: [
      { name: "Jet Black", hex: "#18181B" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isTrending: true,
    tags: ["black", "chiffon", "party"],
    origin: "Surat, Gujarat",
  },
  {
    id: "pal-007",
    name: "Lavender Organza Saree",
    fabric: "Tissue Organza",
    price: 4200,
    originalPrice: 4999,
    discountPercent: 16,
    rating: 4.8,
    reviewsCount: 92,
    reviewCount: 92,
    category: "Party Wear",
    color: "Soft Lavender",
    colorHex: "#C084FC",
    occasion: "Party",
    primaryImage: "/images/products/lavender-organza-saree.jpg",
    hoverImage: "/images/products/lavender-organza-saree.jpg",
    images: [
      "/images/products/lavender-organza-saree.jpg",
    ],
    description: "Dreamy sheer lavender organza saree hand-finished with scalloped resham borders and fine silver foil embroidery.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Scalloped Resham Embroidery",
      occasion: "Festive, Sangeet, Day Wedding",
      careInstructions: "Dry clean only.",
    },
    colors: [
      { name: "Soft Lavender", hex: "#C084FC" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isNewArrival: true,
    tags: ["organza", "lavender", "party"],
    origin: "Kolkata, West Bengal",
  },
  {
    id: "pal-008",
    name: "Ivory Handloom Saree",
    fabric: "Handloom Cotton",
    price: 2499,
    originalPrice: 2999,
    discountPercent: 17,
    rating: 4.8,
    reviewsCount: 110,
    reviewCount: 110,
    category: "Handloom",
    color: "Ivory White",
    colorHex: "#FAF7F2",
    occasion: "Festive",
    primaryImage: "/images/products/ivory-handloom-saree.jpg",
    hoverImage: "/images/products/ivory-handloom-saree.jpg",
    images: [
      "/images/products/ivory-handloom-saree.jpg",
    ],
    description: "Elegantly pure ivory off-white handloom cotton drape with temple border accents in golden zari.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Gold Temple Border",
      occasion: "Festive, Temple, Ceremonial",
      careInstructions: "Dry clean or gentle hand wash.",
    },
    colors: [
      { name: "Ivory White", hex: "#FAF7F2" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isNewArrival: true,
    tags: ["handloom", "ivory", "white", "temple"],
    origin: "Chettinad, Tamil Nadu",
  },
  {
    id: "pal-009",
    name: "Emerald Green Silk Saree",
    fabric: "Pure Silk",
    price: 4999,
    originalPrice: 5999,
    discountPercent: 17,
    rating: 4.8,
    reviewsCount: 135,
    reviewCount: 135,
    category: "Silk",
    color: "Emerald Green",
    colorHex: "#047857",
    occasion: "Festive",
    primaryImage: "/images/products/emerald-green-silk.jpg",
    hoverImage: "/images/products/emerald-green-silk.jpg",
    images: [
      "/images/products/emerald-green-silk.jpg",
    ],
    description: "Regal emerald green pure silk saree with heavy paisley gold zari pallu and traditional border weaving.",
    details: {
      length: "5.5 m",
      blousePiece: "Yes (0.8 m)",
      work: "Paisley Gold Zari",
      occasion: "Festive, Wedding Guest",
      careInstructions: "Dry clean only.",
    },
    colors: [
      { name: "Emerald Green", hex: "#047857" },
    ],
    hasBlousePiece: true,
    blouseOptions: ["With Blouse", "Without Blouse"],
    inStock: true,
    isNewArrival: true,
    isSilkMark: true,
    tags: ["silk", "green", "festive"],
    origin: "Kanchipuram, Tamil Nadu",
  },
  {
    id: "pal-010",
    name: "Matching Wine Embroidered Blouse Piece",
    fabric: "Embroidered Silk",
    price: 999,
    originalPrice: 1499,
    discountPercent: 33,
    rating: 4.8,
    reviewsCount: 42,
    reviewCount: 42,
    category: "Silk",
    color: "Wine",
    colorHex: "#541920",
    occasion: "Festive",
    primaryImage: "/images/products/wine-tissue-silk.jpg",
    hoverImage: "/images/products/wine-tissue-silk.jpg",
    images: ["/images/products/wine-tissue-silk.jpg"],
    description: "Complementary unstitched 0.8m designer embroidered silk blouse piece with matching gold zari work to complete your Wine Tissue Silk drape.",
    details: {
      length: "0.8 m unstitched",
      blousePiece: "Self piece",
      work: "Embroidered Gold Zari",
      occasion: "Festive, Wedding",
      careInstructions: "Dry clean only.",
    },
    colors: [
      { name: "Wine", hex: "#541920" },
    ],
    hasBlousePiece: false,
    inStock: true,
    tags: ["blouse", "silk", "wine", "accessories"],
    origin: "Varanasi, India",
  },
  {
    id: "pal-011",
    name: "Temple Gold Plated Jhumkas",
    fabric: "Brass & 22k Gold Micron Plating",
    price: 1299,
    originalPrice: 1999,
    discountPercent: 35,
    rating: 4.9,
    reviewsCount: 56,
    reviewCount: 56,
    category: "Festive",
    color: "Antique Gold",
    colorHex: "#C5A575",
    occasion: "Festive",
    primaryImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    hoverImage: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"],
    description: "Artisanal handcrafted temple jhumka earrings featuring delicate antique gold bead clusters and ornate floral studs.",
    details: {
      length: "5 cm drop",
      blousePiece: "N/A",
      work: "Handcrafted Temple Filigree",
      occasion: "Festive, Wedding, Party",
      careInstructions: "Keep away from water and perfume. Store in zip pouch.",
    },
    colors: [
      { name: "Antique Gold", hex: "#C5A575" },
    ],
    hasBlousePiece: false,
    inStock: true,
    tags: ["jewelry", "jhumkas", "gold", "accessories"],
    origin: "Jaipur, Rajasthan",
  },
];

export const SHOP_THE_LOOK_ITEMS: LookItem[] = [
  {
    id: "look-1",
    type: "Saree",
    name: "Wine Tissue Silk Saree",
    title: "Wine Tissue Silk Saree",
    role: "Saree",
    price: 3999,
    image: "/images/products/wine-tissue-silk.jpg",
    fabricOrMaterial: "Tissue Silk with Gold Zari",
    productId: "pal-001",
  },
  {
    id: "look-2",
    type: "Blouse",
    name: "Matching Wine Embroidered Blouse Piece",
    title: "Matching Blouse",
    role: "Blouse",
    price: 999,
    image: "/images/products/wine-tissue-silk.jpg",
    fabricOrMaterial: "Embroidered Silk (Unstitched 0.8m)",
    productId: "pal-010",
  },
  {
    id: "look-3",
    type: "Jewelry",
    name: "Temple Gold Plated Jhumkas",
    title: "Gold Jhumkas",
    role: "Accessories",
    price: 1299,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80",
    fabricOrMaterial: "Gold Plated Temple Jhumkas",
    productId: "pal-011",
  },
];
