import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/ecommerce/CartDrawer";
import { SearchOverlay } from "@/components/ecommerce/SearchOverlay";
import dynamic from "next/dynamic";
import { Toast } from "@/components/ecommerce/Toast";

const QuickViewModal = dynamic(
  () => import("@/components/ecommerce/QuickViewModal").then((mod) => mod.QuickViewModal)
);

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
  metadataBase: new URL("https://palluvo.com"),
  title: "PALLUVO | Buy Designer Sarees Online | Pure Silk, Handloom, & Bridal",
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
    title: "PALLUVO | Every drape, a little magic",
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
  twitter: {
    card: "summary_large_image",
    title: "PALLUVO | Buy Designer Sarees Online | Pure Silk, Handloom, & Bridal",
    description: "Premium Indian sarees online. Authentic handlooms, pure silk, and modern silhouettes.",
    images: [
      {
        url: "/images/hero-saree.jpg",
        width: 1200,
        height: 630,
        alt: "PALLUVO Saree Collection",
      },
    ],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#641C2D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const organizationAndWebsiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://palluvo.com/#organization",
      "name": "PALLUVO",
      "url": "https://palluvo.com",
      "logo": "https://palluvo.com/images/logo.png",
      "description": "Premium Indian sarees online. Authentic handlooms, pure silk, and modern silhouettes.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+918498854323",
        "contactType": "customer service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi", "Telugu"],
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://palluvo.com/#website",
      "url": "https://palluvo.com",
      "name": "PALLUVO",
      "description": "Buy Designer Sarees Online | Pure Silk, Handloom, & Bridal",
      "publisher": {
        "@id": "https://palluvo.com/#organization",
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://palluvo.com/shop?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${montserrat.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans-body bg-[#FAF7F2] text-[#1C1A18] antialiased selection:bg-[#541920] selection:text-[#FAF7F2] pb-20 lg:pb-0">
        {/* Sets html[data-auth] before first paint so signed-in-only header UI (announcement bar, bell)
            is shown/hidden via CSS without shifting layout after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=JSON.parse(localStorage.getItem("palluvo_ecommerce_auth")||"null");document.documentElement.setAttribute("data-auth",a&&a.isLoggedIn?"in":"out")}catch(e){document.documentElement.setAttribute("data-auth","out")}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationAndWebsiteJsonLd),
          }}
        />
        {/* Skip to Main Content Bypass Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#541920] focus:text-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C5A575] focus:shadow-lg focus:rounded-xs text-xs font-semibold tracking-wider uppercase transition-colors"
        >
          Skip to main content
        </a>
        <StoreProvider>
          {/* Top Announcement Bar */}
          <AnnouncementBar />

          {/* Sticky E-Commerce Navigation */}
          <Navbar />

          {/* Main App Content */}
          <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>

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
