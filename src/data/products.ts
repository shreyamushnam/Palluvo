export interface Product {
  id: string;
  name: string;
  fabric: string;
  price: number;
  currency: string;
  category: "Silk Sarees" | "Handloom" | "Festive" | "Contemporary" | "Bridal" | "Limited Edition";
  collectionId: string;
  primaryImage: string;
  hoverImage: string;
  description: string;
  weaveDetail: string;
  colorName: string;
  origin: string;
  drapeRecommendation: string;
  inStock: boolean;
  isNewArrival?: boolean;
  isBestseller?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: "pal-001",
    name: "Aadrika Chandrakala Saree",
    fabric: "Pure Mulberry Kanjeevaram Silk (140 GSM)",
    price: 38500,
    currency: "INR",
    category: "Silk Sarees",
    collectionId: "the-silk-edit",
    primaryImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop",
    description: "An heirloom crimson drape woven with antique electroplated gold zari across a midnight-wine field. Finished with hand-twisted silk tassels.",
    weaveDetail: "Korvai double-warp interlock weave crafted over 28 working days in Kanchipuram.",
    colorName: "Deep Crimson & Antique Gold",
    origin: "Kanchipuram, Tamil Nadu",
    drapeRecommendation: "Architectural Nivi drape with structured pleats to spotlight the pallu tapestry.",
    inStock: true,
    isNewArrival: true,
    isBestseller: true,
  },
  {
    id: "pal-002",
    name: "Noorani Tissue Organza",
    fabric: "Handspun Organza with Metallic Tissue Weft",
    price: 42000,
    currency: "INR",
    category: "Festive",
    collectionId: "midnight-drapes",
    primaryImage: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1610313461564-489bda80660a?q=80&w=1000&auto=format&fit=crop",
    description: "Gossamer emerald organza shimmering with whisper-fine champagne gold threads that catch evening candlelight with every turn.",
    weaveDetail: "Single-reed open weave hand-knotted by master weavers using real dipped silver zari.",
    colorName: "Emerald Fog & Champagne Silver",
    origin: "Varanasi, Uttar Pradesh",
    drapeRecommendation: "Floating front-fall or relaxed shoulder drape for an ethereal evening silhouette.",
    inStock: true,
    isNewArrival: true,
  },
  {
    id: "pal-003",
    name: "Vanya Raw Tussar Drape",
    fabric: "Wild Ahimsa Tussar & Organic Linen",
    price: 24500,
    currency: "INR",
    category: "Handloom",
    collectionId: "everyday-poetry",
    primaryImage: "https://images.unsplash.com/photo-1630267693092-2ea1f7dcc9a5?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1610313416292-e350ece568f6?q=80&w=1000&auto=format&fit=crop",
    description: "A textured ivory and biscuit-beige handspun saree that feels like liquid air. Characterized by natural slubs and raw selvedge borders.",
    weaveDetail: "Hand-reeled wild silk woven on pit-looms with zero chemical processing.",
    colorName: "Raw Ivory & Smoked Terracotta",
    origin: "Bhagalpur, Bihar",
    drapeRecommendation: "Belted modern drape styled over an architectural linen shirt.",
    inStock: true,
    isBestseller: true,
  },
  {
    id: "pal-004",
    name: "Meera Chanderi Zari Tissue",
    fabric: "Fine Chanderi Silk Cotton with Muted Gold Zari",
    price: 29000,
    currency: "INR",
    category: "Contemporary",
    collectionId: "festive-stories",
    primaryImage: "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1698657169210-9d6ec3860dc4?q=80&w=1000&auto=format&fit=crop",
    description: "Sheer gold radiance meets featherweight drape. Hand-embellished with micro-butis inspired by 18th century royal Mewar frescoes.",
    weaveDetail: "Traditional Ek-Nali technique with hand-picked butis in unrefined antique zari.",
    colorName: "Burnished Ochre & Rosewood",
    origin: "Chanderi, Madhya Pradesh",
    drapeRecommendation: "Seedha pallu with draped waist tuck for effortless festive movement.",
    inStock: true,
  },
  {
    id: "pal-005",
    name: "Shyamala Noir Matka Silk",
    fabric: "High-Twist Matka Silk with Jamdani Inlay",
    price: 34000,
    currency: "INR",
    category: "Limited Edition",
    collectionId: "midnight-drapes",
    primaryImage: "https://images.unsplash.com/photo-1737275857760-1c4b42f8bb8b?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1708182564325-fb1d3a3864d3?q=80&w=1000&auto=format&fit=crop",
    description: "An enigmatic midnight black saree punctuated with subtle geometric motifs woven in oxidized gunmetal and wine threads.",
    weaveDetail: "Discontinuous weft Jamdani technique executed by fifth-generation weaver families.",
    colorName: "Ink Charcoal & Oxidized Silver",
    origin: "Santipur, West Bengal",
    drapeRecommendation: "High-neck contemporary drape with clean diagonal pleats.",
    inStock: true,
    isNewArrival: true,
  },
  {
    id: "pal-006",
    name: "Rukmani Bridal Tanchoi",
    fabric: "Heirloom Pure Mulberry Silk Satin Weft",
    price: 68000,
    currency: "INR",
    category: "Bridal",
    collectionId: "the-silk-edit",
    primaryImage: "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1664636124899-4a121f1ce449?q=80&w=1000&auto=format&fit=crop",
    description: "Our signature bridal masterpiece. Intricate brocade woven with four-ply real silver zari, featuring flora and mythical peacocks.",
    weaveDetail: "Extravagant Tanchoi multi-colored weft weave requiring over 45 days on jacquard pit looms.",
    colorName: "Deep Vermillion & Royal Gold",
    origin: "Varanasi, Uttar Pradesh",
    drapeRecommendation: "Royal ceremonial drape with double-pinned shoulder pleats.",
    inStock: true,
    isBestseller: true,
  },
  {
    id: "pal-007",
    name: "Tarangini Indigo Jamdani",
    fabric: "120-Count Fine Muslin Handspun Cotton",
    price: 21500,
    currency: "INR",
    category: "Handloom",
    collectionId: "everyday-poetry",
    primaryImage: "https://images.unsplash.com/photo-1610313407085-8397d3ac4563?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=1000&auto=format&fit=crop",
    description: "Cloud-soft organic muslin naturally dyed with fermented organic indigo. Features undulating wave motifs that ripple like running water.",
    weaveDetail: "Authentic Dhakai Jamdani woven thread-by-thread using bamboo shuttles.",
    colorName: "Natural Indigo & Cloud Ecru",
    origin: "Fulia, West Bengal",
    drapeRecommendation: "Casual Bengali-style loose drape with oversized silver cuff jewelry.",
    inStock: true,
  },
  {
    id: "pal-008",
    name: "Kalyani Sunset Kanjeevaram",
    fabric: "Heavyweight Pure Mulberry Silk with Korvai Border",
    price: 52000,
    currency: "INR",
    category: "Silk Sarees",
    collectionId: "the-silk-edit",
    primaryImage: "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?q=80&w=1000&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1698657169582-64ec02a333f7?q=80&w=1000&auto=format&fit=crop",
    description: "A breathtaking dual-tone rust-orange and ruby saree that catches the magic hour sun with incandescent warmth.",
    weaveDetail: "Three-shuttle Korvai weaving technique with traditional temple spires (Gopuram) border.",
    colorName: "Terracotta Rust & Ruby Wine",
    origin: "Kanchipuram, Tamil Nadu",
    drapeRecommendation: "Classic South Indian bridal drape with waist belt (Oddiyanam).",
    inStock: true,
  }
];

export const CATEGORIES = [
  "All",
  "Silk Sarees",
  "Handloom",
  "Festive",
  "Contemporary",
  "Bridal",
  "Limited Edition",
] as const;
