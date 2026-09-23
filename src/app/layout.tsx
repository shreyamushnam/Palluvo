import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PALLUVO | Every drape, a little magic",
  description:
    "Modern silhouettes. Timeless Indian artistry. Discover artisanal handcrafted sarees, couture drapes, and heritage weaves from PALLUVO.",
  keywords: [
    "PALLUVO",
    "Luxury Sarees",
    "Handloom Silk",
    "Kanjeevaram",
    "Chanderi",
    "Indian Fashion Couture",
    "Modern Saree Drapes",
    "Festive Weaves",
  ],
  authors: [{ name: "PALLUVO Couture" }],
  openGraph: {
    title: "PALLUVO — Every drape, a little magic",
    description: "Modern silhouettes. Timeless Indian artistry. Luxury saree house.",
    url: "https://palluvo.com",
    siteName: "PALLUVO",
    images: [
      {
        url: "https://images.unsplash.com/photo-1617297873650-aef8f4e00b9b?q=80&w=1600&auto=format&fit=crop",
        width: 1600,
        height: 900,
        alt: "PALLUVO Haute Couture Saree Editorial",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans-body bg-[#FAF7F2] text-[#1C1A18] antialiased selection:bg-[#541920] selection:text-[#FAF7F2]">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
