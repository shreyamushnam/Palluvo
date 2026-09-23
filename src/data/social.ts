export interface SocialPost {
  id: string;
  image: string;
  author: string;
  location: string;
  caption: string;
  likes: string;
  tag: string;
  aspect: string;
}

export const SOCIAL_POSTS: SocialPost[] = [
  {
    id: "sp-1",
    image: "https://images.unsplash.com/photo-1617297873650-aef8f4e00b9b?q=80&w=800&auto=format&fit=crop",
    author: "@palluvo",
    location: "Royal Opera House, Mumbai",
    caption: "The Aadrika Chandrakala drape caught in golden hour before the curtain rises.",
    likes: "2,410",
    tag: "#TheSilkEdit",
    aspect: "aspect-[3/4]"
  },
  {
    id: "sp-2",
    image: "https://images.unsplash.com/photo-1739429942851-9083ee185d3d?q=80&w=800&auto=format&fit=crop",
    author: "@palluvo",
    location: "Jaipur Literature Festival",
    caption: "Crimson handloom silk shimmering with real dipped gold under the desert sun.",
    likes: "1,890",
    tag: "#MidnightDrapes",
    aspect: "aspect-[4/5]"
  },
  {
    id: "sp-3",
    image: "https://images.unsplash.com/photo-1693023656257-87c142566ad3?q=80&w=800&auto=format&fit=crop",
    author: "@palluvo",
    location: "Kochi-Muziris Biennale",
    caption: "Modern silhouettes. Vanya Raw Tussar styled with clean lines for an art preview.",
    likes: "3,120",
    tag: "#EverydayPoetry",
    aspect: "aspect-[1/1]"
  },
  {
    id: "sp-4",
    image: "https://images.unsplash.com/photo-1742287721821-ddf522b3f37b?q=80&w=800&auto=format&fit=crop",
    author: "@palluvo",
    location: "Umaid Bhawan Palace, Jodhpur",
    caption: "Heritage weaves alive in royal courtyards. Hand-spun silk catching the palace breeze.",
    likes: "4,650",
    tag: "#FestiveStories",
    aspect: "aspect-[3/4]"
  },
  {
    id: "sp-5",
    image: "https://images.unsplash.com/photo-1610313461564-489bda80660a?q=80&w=800&auto=format&fit=crop",
    author: "@palluvo",
    location: "Studio Fittings, New Delhi",
    caption: "Drape tests on the Noorani tissue organza. Light filtering through raw silver weft.",
    likes: "1,430",
    tag: "#BehindTheDrape",
    aspect: "aspect-[4/5]"
  },
  {
    id: "sp-6",
    image: "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=800&auto=format&fit=crop",
    author: "@palluvo",
    location: "Lake Palace, Udaipur",
    caption: "The heirloom vermillion Rukmani Tanchoi. Every drape, a little magic.",
    likes: "5,820",
    tag: "#PalluvoBridal",
    aspect: "aspect-[3/4]"
  }
];
