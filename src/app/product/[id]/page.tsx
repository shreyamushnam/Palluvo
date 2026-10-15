import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PRODUCTS, getProductMetaDescription } from "@/data/products";
import { getProductBreadcrumb } from "@/data/categories";
import { ProductDetailView } from "@/components/ecommerce/ProductDetailView";
import { SITE_URL } from "@/data/site";

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
  const description = getProductMetaDescription(product);
  const canonicalUrl = `${SITE_URL}/product/${product.id}`;

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

  const breadcrumb = getProductBreadcrumb(product);

  const productAndBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${SITE_URL}/product/${product.id}#product`,
        name: product.name,
        description: product.description,
        image: product.images.map((img) =>
          img.startsWith("http") ? img : `${SITE_URL}${img}`
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
          url: `${SITE_URL}/product/${product.id}`,
          seller: {
            "@type": "Organization",
            name: "PALLUVO",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/product/${product.id}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Shop",
            item: `${SITE_URL}/shop`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: breadcrumb.label,
            item: `${SITE_URL}${breadcrumb.href}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: product.name,
            item: `${SITE_URL}/product/${product.id}`,
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
