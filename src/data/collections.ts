export interface CollectionItem {
  id: string;
  number: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  countText: string;
  aspectRatio: string;
  gridSpan: string;
  accentColor: string;
}

export const COLLECTIONS: CollectionItem[] = [
  {
    id: "the-silk-edit",
    number: "01",
    name: "The Silk Edit",
    tagline: "Heirloom Silks & Pure Metallic Zari",
    description: "Opulent Kanjeevarams, liquid Benarasi satins, and sculpted Tanchoi brocades woven for moments that echo across generations.",
    image: "https://images.unsplash.com/photo-1614940685083-c5409b57da6e?q=80&w=1200&auto=format&fit=crop",
    countText: "14 Curated Weaves",
    aspectRatio: "aspect-[4/5]",
    gridSpan: "lg:col-span-7",
    accentColor: "#541920",
  },
  {
    id: "midnight-drapes",
    number: "02",
    name: "Midnight Drapes",
    tagline: "The Poetry of Shadow & Sheer",
    description: "Organza, whisper-light tissue silks, and noir matkas created for twilight soirees and candlelit celebrations.",
    image: "https://images.unsplash.com/photo-1707569615782-13f021c40eae?q=80&w=1200&auto=format&fit=crop",
    countText: "09 Editions",
    aspectRatio: "aspect-[3/4]",
    gridSpan: "lg:col-span-5",
    accentColor: "#1C1A18",
  },
  {
    id: "festive-stories",
    number: "03",
    name: "Festive Stories",
    tagline: "Gilded Nostalgia & Royal Hues",
    description: "Luminous turmeric yellows, ruby carmines, and ceremonial gold tissue silks reimagined with clean contemporary geometry.",
    image: "https://images.unsplash.com/photo-1572470176170-98fa8abcb741?q=80&w=1200&auto=format&fit=crop",
    countText: "18 Silhouettes",
    aspectRatio: "aspect-[3/4]",
    gridSpan: "lg:col-span-5",
    accentColor: "#BF6A54",
  },
  {
    id: "everyday-poetry",
    number: "04",
    name: "Everyday Poetry",
    tagline: "Breathable Weaves for Living In",
    description: "Handspun Chanderi, unbleached Ahimsa tussar, and organic linen crafted for the poetry of everyday life.",
    image: "https://images.unsplash.com/photo-1618901185975-d59f7091bcfe?q=80&w=1200&auto=format&fit=crop",
    countText: "12 Silhouettes",
    aspectRatio: "aspect-[4/5]",
    gridSpan: "lg:col-span-7",
    accentColor: "#C5A575",
  },
];
