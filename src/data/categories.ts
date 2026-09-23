export interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  description: string;
}

export const CATEGORIES: CategoryCard[] = [
  {
    id: "cat-silk",
    name: "Silk Sarees",
    slug: "Silk",
    image: "/images/hero-saree.jpg",
    itemCount: 28,
    description: "Kanjeevaram, Banarasi & Tussar weaves",
  },
  {
    id: "cat-handloom",
    name: "Handloom Sarees",
    slug: "Handloom",
    image: "https://images.unsplash.com/photo-1630267693092-2ea1f7dcc9a5?q=80&w=800&auto=format&fit=crop",
    itemCount: 19,
    description: "Artisanal hand-spun natural fibers",
  },
  {
    id: "cat-cotton",
    name: "Cotton Sarees",
    slug: "Cotton",
    image: "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?q=80&w=800&auto=format&fit=crop",
    itemCount: 22,
    description: "Breathable Dhakai Jamdani & Mulmul",
  },
  {
    id: "cat-festive",
    name: "Festive Sarees",
    slug: "Festive",
    image: "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?q=80&w=800&auto=format&fit=crop",
    itemCount: 35,
    description: "Gilded zari, chanderi & tissue drapes",
  },
  {
    id: "cat-bridal",
    name: "Bridal Sarees",
    slug: "Bridal",
    image: "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=800&auto=format&fit=crop",
    itemCount: 14,
    description: "Heirloom wedding weaves & heavy brocades",
  },
  {
    id: "cat-party",
    name: "Party Wear",
    slug: "Party Wear",
    image: "https://images.unsplash.com/photo-1737275857760-1c4b42f8bb8b?q=80&w=800&auto=format&fit=crop",
    itemCount: 18,
    description: "Modern sequins, matka & organza silhouettes",
  },
  {
    id: "cat-printed",
    name: "Printed Sarees",
    slug: "Printed",
    image: "https://images.unsplash.com/photo-1610313407085-8397d3ac4563?q=80&w=800&auto=format&fit=crop",
    itemCount: 24,
    description: "Floral watercolor chiffons & botanical georgette",
  },
  {
    id: "cat-new",
    name: "New Arrivals",
    slug: "New Arrivals",
    image: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?q=80&w=800&auto=format&fit=crop",
    itemCount: 16,
    description: "Freshly dropped season weaves",
  },
];
