export interface DrapeStory {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  quote: string;
  steps: string[];
  stylingTip: string;
  idealFor: string;
}

export const DRAPE_STORIES: DrapeStory[] = [
  {
    id: "classic",
    name: "The Classic",
    subtitle: "The Timeless Nivi Drape",
    image: "https://images.unsplash.com/photo-1614940685083-c5409b57da6e?q=80&w=1200&auto=format&fit=crop",
    quote: "Seven precise pleats anchored at the navel, cascading into an unbroken waterfall of handloom artistry.",
    steps: [
      "1. Tuck the inner edge at the right waist and take one complete turn around the body.",
      "2. Fold 6 to 8 even pleats of 4 inches each, anchoring them firmly beneath the navel.",
      "3. Gather the remaining length across the torso, forming sharp diagonal flutes.",
      "4. Pin the ornate pallu over the left shoulder, letting it fall gracefully to the calf."
    ],
    stylingTip: "Pair with a structured high-neck raw silk blouse and heirloom antique gold earrings.",
    idealFor: "Weddings, classical galas, and heritage ceremonies."
  },
  {
    id: "contemporary",
    name: "The Contemporary",
    subtitle: "The Belted Architectural Silhouette",
    image: "https://images.unsplash.com/photo-1630267693092-2ea1f7dcc9a5?q=80&w=1200&auto=format&fit=crop",
    quote: "Clean geometry and modern power dressing. Saree structure engineered for the woman in motion.",
    steps: [
      "1. Drape with narrow, crisp waist pleats for an elongated column silhouette.",
      "2. Drape the pallu tightly diagonally across the breastplate.",
      "3. Cinch at the natural waist with a minimalist leather or hammered brass belt.",
      "4. Fan out the shoulder drape slightly for an asymmetrical cape effect."
    ],
    stylingTip: "Layer over a tailored cropped blazer or structured turtleneck.",
    idealFor: "Art biennales, evening cocktails, and international red carpets."
  },
  {
    id: "effortless",
    name: "The Effortless",
    subtitle: "The Relaxed Front-Fall Drape",
    image: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?q=80&w=1200&auto=format&fit=crop",
    quote: "Unfussy, breezy, and unapologetically poetic. Allowing the textile weight to find its own natural rhythm.",
    steps: [
      "1. Create relaxed, loose-tension pleats that allow uninhibited movement.",
      "2. Rather than pinning tightly, sweep the pallu loosely over the forearm.",
      "3. Let the fabric puddle naturally around the ankles without rigid starching.",
      "4. Let the pallu drop freely down the front or back as you stride."
    ],
    stylingTip: "Pair with flat leather juttis, bare shoulders, and undone hair.",
    idealFor: "Daytime gallery openings, brunch affairs, and intimate dinner parties."
  },
  {
    id: "statement",
    name: "The Statement",
    subtitle: "The Royal Seedha Pallu",
    image: "https://images.unsplash.com/photo-1588140686379-1b76a52103dc?q=80&w=1200&auto=format&fit=crop",
    quote: "Bringing the masterpiece front and center. Royal Gujarati & Rajasthani heritage reborn.",
    steps: [
      "1. Anchor base pleats with generous width to hold the heavy border weight.",
      "2. Bring the pallu from behind over the right shoulder to drape flat across the chest.",
      "3. Pin the top corner of the pallu neatly onto the left side waist to frame the embroidery.",
      "4. Adjust the border so each handwoven motif stands out in relief."
    ],
    stylingTip: "Elevate with a polki choker and a sleek low chignon adorned with fresh jasmine.",
    idealFor: "Sangeet nights, royal heritage venues, and festive family portraits."
  }
];
