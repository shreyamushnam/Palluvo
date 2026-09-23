export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  content: string[];
}

export const ARTICLES: Article[] = [
  {
    id: "art-of-the-drape",
    title: "The Art of the Drape",
    subtitle: "Six yards of unstitched fluid geometry that reshapes itself around the wearer",
    category: "Philosophy & Craft",
    readTime: "5 min read",
    date: "Autumn / Edition 01",
    author: "Ananya Sen, Textile Curator",
    image: "https://images.unsplash.com/photo-1742287724816-4a8a1cc7ad5c?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Why the unstitched garment remains the purest form of human clothing—a dynamic sculpture born anew each dawn.",
    content: [
      "To drape a saree is not merely to dress; it is an act of kinetic architecture. Unlike Western tailoring that enforces rigid seams upon the body, the Indian saree respects the organic contours of the human form, offering infinite reinvention through tension, pleating, and fall.",
      "The weight of the pallu acts as a pendulum, anchoring balance while the fluid pleats at the waist create a natural accordion of movement. In an era obsessed with fast silhouettes and disposable fashion, the unstitched textile stands as an eternal testament to conscious elegance.",
      "At PALLUVO, we design our weaves with intentional weight distribution. By graduating the weft density from the body to the border, each drape achieves a languid, whisper-like cascade that moves with the wearer rather than against them."
    ]
  },
  {
    id: "choosing-the-right-silk",
    title: "Choosing the Right Silk",
    subtitle: "From gossamer Chanderi to architectural Kanjeevarams: a discerning collector's guide",
    category: "Textile Guide",
    readTime: "6 min read",
    date: "Autumn / Edition 01",
    author: "Devika Rao, Master Weaver Liaison",
    image: "https://images.unsplash.com/photo-1631005436600-15dd6ddabf92?q=80&w=1200&auto=format&fit=crop",
    excerpt: "Understand GSM, twist density, and mulberry grades to find the drape that complements your climate, posture, and mood.",
    content: [
      "Not all silks are created equal. The tactile experience of silk is determined by the sericin content, the twist multiplier (tpi), and whether the thread was hand-reeled or machine-spun.",
      "For tropical evenings or warm daytime affairs, look for low-GSM open-weave Chanderi or wild Ahimsa tussar. These fabrics breathe naturally, developing a supple, glove-like softness with every wear.",
      "When formal majesty is demanded, nothing compares to high-warp Kanjeevaram silk woven with three-ply Mulberry thread. The interlocked Korvai border provides crisp structural tension, holding pleats with pristine razor sharpness through hours of ceremony."
    ]
  },
  {
    id: "saree-styling-reimagined",
    title: "Saree Styling, Reimagined",
    subtitle: "Breaking convention: pairing heritage handlooms with tailored corsetry, blazers, and boots",
    category: "Modern Editorial",
    readTime: "4 min read",
    date: "Autumn / Edition 01",
    author: "Kavya Menon, Fashion Director",
    image: "https://images.unsplash.com/photo-1517424401253-3db93d0d6c93?q=80&w=1200&auto=format&fit=crop",
    excerpt: "How modern tastemakers are dismantling the traditional blouse-and-petticoat formula in favor of clean architectural silhouettes.",
    content: [
      "The saree has never been static. Throughout five millennia across the subcontinent, women draped it without underskirts or stitched blouses, adapting its length to farming, dancing, and royal courts alike.",
      "Today's renaissance reclaims that fearless versatility. We see PALLUVO patrons draping pure Matka silks over crisp poplin shirts for boardrooms, or cinching ethereal organza with sculpted brass obi belts for international gala dinners.",
      "The key is contrast: when the fabric is richly traditional, pair it with sharp, modern lines. Let the juxtaposition of raw antique metallic zari against minimal matte tailoring create the electric tension of modern luxury."
    ]
  },
  {
    id: "stories-behind-the-weave",
    title: "Stories Behind the Weave",
    subtitle: "A journey into the pit looms of Varanasi and the temple towns of Tamil Nadu",
    category: "Artisanal Heritage",
    readTime: "7 min read",
    date: "Autumn / Edition 01",
    author: "Rohan Varma, Heritage Chronicler",
    image: "https://images.unsplash.com/photo-1711608766962-a8b73a8772b8?q=80&w=1200&auto=format&fit=crop",
    excerpt: "The rhythm of the shuttle, the mathematics of the punch-card, and the human hands that give soul to every yard.",
    content: [
      "Step into the weaving lanes of Alaipura in Varanasi at dawn, and you are greeted by an extraordinary symphony: the rhythmic clack-clack of wooden pedals, the hum of silk bobbin winders, and the soft rustle of jacquard cards dancing overhead.",
      "A single PALLUVO Tanchoi saree involves over 180,000 passes of the shuttle. Master weavers coordinate with an apprentice who hand-picks each silver warp thread, ensuring tension remains identical across forty days of continuous labor.",
      "When you touch a PALLUVO piece, you are holding the generational memory of families who have guarded these mathematical weaving codes for over two hundred years. That touch is where the magic lives."
    ]
  }
];
