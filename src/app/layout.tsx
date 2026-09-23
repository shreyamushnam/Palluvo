import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/ecommerce/CartDrawer";
import { SearchOverlay } from "@/components/ecommerce/SearchOverlay";
import { QuickViewModal } from "@/components/ecommerce/QuickViewModal";
import { Toast } from "@/components/ecommerce/Toast";

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
  title: "PALLUVO | Buy Designer Sarees Online — Pure Silk, Handloom, & Bridal",
  description:
    "Shop premium Indian sarees online at PALLUVO. Discover handwoven Kanjeevaram silk, Banarasi brocades, lightweight organza, and festive party wear. Free shipping above ₹1999 & easy returns.",
  keywords: [
    "PALLUVO",
    "Buy Sarees Online",
    "Pure Silk Sarees",
    "Kanjeevaram Saree",
    "Banarasi Saree",
    "Handloom Sarees",
    "Bridal Sarees India",
    "Organza Sarees",
  ],
  openGraph: {
    title: "PALLUVO — Every drape, a little magic",
    description: "Premium Indian sarees online. Authentic handlooms, pure silk, and modern silhouettes.",
    url: "https://palluvo.com",
    siteName: "PALLUVO",
    images: [
      {
        url: "/images/hero-saree.jpg",
        width: 1200,
        height: 630,
        alt: "PALLUVO Saree Collection",
      },
    ],
    locale: "en_IN",
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
      <body className="min-h-screen flex flex-col font-sans-body bg-[#FAF7F2] text-[#1C1A18] antialiased selection:bg-[#541920] selection:text-[#FAF7F2] pb-16 md:pb-0">
        <StoreProvider>
          {/* Top Announcement Bar */}
          <AnnouncementBar />

          {/* Sticky E-Commerce Navigation */}
          <Navbar />

          {/* Main App Content */}
          <main className="flex-1">{children}</main>

          {/* E-Commerce Footer */}
          <Footer />

          {/* Mobile Bottom Navigation Bar */}
          <MobileBottomNav />

          {/* Global Interactive Overlays */}
          <CartDrawer />
          <SearchOverlay />
          <QuickViewModal />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
