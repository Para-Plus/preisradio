import { Metadata } from 'next';
import api from '@/lib/api';
import BrandDetailClient from './BrandDetailClient';
import { Product } from '@/lib/types';
import { generateBrandBreadcrumbSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';
const PAGE_SIZE = 100;

export const revalidate = 43200; // 12 hours

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const resolvedSearch = await searchParams;
    const currentPage = parseInt(resolvedSearch.page || '1', 10);
    const slug = resolvedParams.slug;

    const decodedSlug = decodeURIComponent(slug);
    const brandName = decodedSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Fetch product count for dynamic title
    let productCount = 0;
    try {
      const countRes = await api.getProductsFromBothRetailers({
        brand: brandName,
        page_size: 1,
      });
      productCount = countRes?.count || 0;
    } catch {
      // fallback: title without count
    }

    const countLabel = productCount > 0 ? ` (${productCount} Produkte)` : '';
    const title = `${brandName}${countLabel} günstig kaufen – Preisvergleich | Preisradio`;
    const description = `${brandName} Produkte im Preisvergleich: Saturn, MediaMarkt, Otto und Kaufland. Finden Sie täglich die günstigsten ${brandName} Angebote und sparen Sie beim Online-Kauf.`;

    const keywords = [
      `${brandName} günstig kaufen`,
      `${brandName} Preisvergleich`,
      `${brandName} Angebote`,
      `${brandName} Saturn MediaMarkt`,
      `${brandName} online kaufen`,
      `günstige ${brandName} Produkte`,
      'Preisradio',
    ];

    const canonicalBase = `${baseUrl}/marken/${slug}`;
    const canonical = currentPage === 1 ? canonicalBase : `${canonicalBase}?page=${currentPage}`;

    return {
      title: title.length > 70 ? title.substring(0, 67) + '...' : title,
      description: description.length > 160 ? description.substring(0, 157) + '...' : description,
      keywords,
      openGraph: {
        title: `${brandName} Produkte günstig | Preisradio`,
        description: `${brandName} im Preisvergleich – täglich günstigste Preise bei Saturn, MediaMarkt, Otto & Kaufland.`,
        url: canonical,
        type: 'article',
        locale: 'de_DE',
        siteName: 'Preisradio',
        modifiedTime: new Date().toISOString(),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${brandName} günstig kaufen | Preisradio`,
        description: `${brandName} im Preisvergleich – täglich aktuell auf Preisradio.`,
      },
      alternates: {
        canonical,
        languages: {
          'de-DE': canonical,
          'x-default': canonical,
        },
      },
      other: {
        'article:modified_time': new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      title: 'Marke | Preisradio',
      description: 'Markenprodukte auf Preisradio',
    };
  }
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const slug = resolvedParams.slug;
  const currentPage = Math.max(1, parseInt(resolvedSearch.page || '1', 10));

  let products: Product[] = [];
  let brandName = '';
  let totalProductsCount = 0;
  let totalPages = 1;

  try {
    const decodedSlug = decodeURIComponent(slug);
    const searchTerm = decodedSlug.replace(/-/g, ' ');

    const brandsResponse = await api.getBrands({ search: searchTerm, page_size: 50 });
    const matchingBrands = brandsResponse.results || [];

    const matchingBrand = matchingBrands.find(b => {
      const brandSlug = b.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return brandSlug === normalizedSlug;
    });

    if (matchingBrand) {
      brandName = matchingBrand;

      const response = await api.getProductsFromBothRetailers({
        brand: brandName,
        page: currentPage,
        page_size: PAGE_SIZE,
      });

      products = response?.results || [];
      totalProductsCount = response?.count || 0;
      totalPages = Math.ceil(totalProductsCount / PAGE_SIZE);
    } else {
      brandName = searchTerm
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  } catch (err) {
    console.error('Error fetching brand products:', err);
    brandName = decodeURIComponent(slug).toUpperCase();
  }

  const canonicalBase = `${baseUrl}/marken/${slug}`;

  const breadcrumbSchema = generateBrandBreadcrumbSchema(brandName, slug, baseUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <BrandDetailClient
        slug={slug}
        initialProducts={products}
        initialBrandName={brandName}
        totalProductsCount={totalProductsCount}
      />
    </>
  );
}
