import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS } from "@/data/products";
import { getCategoryHref } from "@/data/categories";
import { ProductDetailView } from "@/components/ecommerce/ProductDetailView";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const title = `${product.name} | PALLUVO`;
  const description = `${product.description.slice(0, 155)}… Pure ${product.fabric} handcrafted saree.`;
  const canonicalUrl = `https://palluvo.com/product/${product.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "PALLUVO",
      images: [
        {
          url: product.primaryImage,
          width: 800,
          height: 1067,
          alt: product.name,
        },
        ...product.images.map((img) => ({
          url: img,
          alt: `${product.name} alternate view`,
        })),
      ],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.primaryImage],
    },
  };
}

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const productAndBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `https://palluvo.com/product/${product.id}#product`,
        name: product.name,
        description: product.description,
        image: product.images.map((img) =>
          img.startsWith("http") ? img : `https://palluvo.com${img}`
        ),
        sku: product.id,
        category: product.category,
        brand: {
          "@type": "Brand",
          name: "PALLUVO",
        },
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "INR",
          itemCondition: "https://schema.org/NewCondition",
          availability: product.inStock !== false
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          url: `https://palluvo.com/product/${product.id}`,
          seller: {
            "@type": "Organization",
            name: "PALLUVO",
          },
        },
        ...(product.rating
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: product.rating,
                reviewCount: product.reviewsCount || 120,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://palluvo.com/product/${product.id}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://palluvo.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: "https://palluvo.com/shop",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.category,
            item: `https://palluvo.com${getCategoryHref(product.category)}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `https://palluvo.com/product/${product.id}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productAndBreadcrumbJsonLd) }}
      />
      <ProductDetailView product={product} />
    </>
  );
}
