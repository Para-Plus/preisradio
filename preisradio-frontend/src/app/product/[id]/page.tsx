import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import ProductDescription from './ProductDescription';
import ProductSpecs from './ProductSpecs';
import api from '@/lib/api';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

// Revalidate every 24 hours - ISR
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const product = await api.getProduct(resolvedParams.id);

    const retailerName =
      product.retailer === 'saturn' ? 'Saturn' :
      product.retailer === 'mediamarkt' ? 'MediaMarkt' :
      product.retailer === 'kaufland' ? 'Kaufland' : 'Otto';

    const brand = product.brand || '';
    const price = product.price.toFixed(2);
    const currency = product.currency || 'EUR';
    const hasDiscount = product.old_price && product.old_price > product.price;
    const savings = hasDiscount ? (product.old_price! - product.price).toFixed(2) : null;

    // Title: "{Brand} {Model} – {Price}€ (Monat Jahr) | Preisradio" (max 60 chars)
    const month = new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(new Date());
    const year = new Date().getFullYear();
    const suffix = ` – ${price}€ (${month} ${year})`;
    const titleBase = brand ? `${brand} ${product.title}` : product.title;
    const maxBase = 52 - suffix.length;
    const title = titleBase.length > maxBase
      ? `${titleBase.substring(0, maxBase - 3)}...${suffix}`
      : `${titleBase}${suffix}`;

    // Description: compelling, includes savings and retailers (max 160 chars)
    const descriptionParts = [
      `${product.title}`,
      `für ${price} ${currency} bei ${retailerName}.`,
      savings ? `Sie sparen ${savings} ${currency}!` : null,
      `Preise vergleichen bei Saturn, MediaMarkt, Otto & Kaufland auf Preisradio.`,
    ].filter(Boolean);
    const description = descriptionParts.join(' ').substring(0, 157) + (descriptionParts.join(' ').length > 157 ? '...' : '');

    // Keywords — specific, purchase-intent
    const keywords = [
      brand ? `${brand} ${product.category} kaufen` : `${product.category} kaufen`,
      brand ? `${brand} günstig` : `${product.category} günstig`,
      `${product.category} Preisvergleich`,
      `${product.category} Angebot`,
      brand ? `${brand} ${product.category} Angebot` : `${product.category} günstig kaufen`,
      'Preisradio',
    ].filter(Boolean);

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: `${product.title} – ${price}€ | Preisradio`,
        description: `${product.title} für ${price} ${currency} bei ${retailerName}.${savings ? ` Spare ${savings} ${currency}!` : ''} Jetzt vergleichen!`,
        images: product.image
          ? [{ url: product.image, alt: product.title }]
          : [{ url: `${baseUrl}/og-image.webp`, width: 1200, height: 630 }],
        url: `${baseUrl}/product/${resolvedParams.id}`,
        type: 'article',
        locale: 'de_DE',
        siteName: 'Preisradio',
        modifiedTime: new Date().toISOString(),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.title} – ${price}€ | Preisradio`,
        description: `${product.title} für ${price} ${currency} bei ${retailerName}.${savings ? ` Spare ${savings} ${currency}!` : ''}`,
        images: [product.image || `${baseUrl}/og-image.webp`],
      },
      alternates: {
        canonical: `${baseUrl}/product/${resolvedParams.id}`,
        languages: {
          'de-DE': `${baseUrl}/product/${resolvedParams.id}`,
          'x-default': `${baseUrl}/product/${resolvedParams.id}`,
        },
      },
      other: {
        'article:modified_time': new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      title: 'Produkt | Preisradio',
      description: 'Produktdetails auf Preisradio',
    };
  }
}

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  let product = null;
  let productSchema = null;
  let breadcrumbSchema = null;
  try {
    product = await api.getProduct(resolvedParams.id);
    productSchema = generateProductSchema(product, baseUrl);
    breadcrumbSchema = generateBreadcrumbSchema(product, baseUrl);
  } catch (err) {
    console.error('Error fetching product:', err);
    redirect('/');
  }

  return (
    <>
      {/* Preload LCP image — produit principal */}
      {product?.image && (
        <link rel="preload" as="image" href={product.image} />
      )}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ProductDetailClient
        productId={resolvedParams.id}
        initialProduct={product}
      >
        <ProductDescription data={product?.produktbeschreibung} />
        <ProductSpecs data={product?.produktdaten} />
      </ProductDetailClient>
    </>
  );
}