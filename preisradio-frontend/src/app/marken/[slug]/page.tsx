import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import api from '@/lib/api';
import BrandDetailClient from './BrandDetailClient';
import { Product } from '@/lib/types';
import { generateBrandBreadcrumbSchema, generateBrandFAQSchema } from '@/lib/schema';

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
    const slug = resolvedParams.slug.toLowerCase();

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

  // Any-case slug ("Jabra", "SONY") was getting indexed as a separate page
  // from the lowercase canonical one ("jabra", "sony") — both rendered the
  // same brand via the case-insensitive lookup below, splitting their
  // ranking signals across duplicate URLs. Redirect instead of just setting
  // a canonical hint, so the duplicate stops being crawled/indexed at all.
  if (slug !== slug.toLowerCase()) {
    const target = `/marken/${slug.toLowerCase()}${currentPage > 1 ? `?page=${currentPage}` : ''}`;
    redirect(target);
  }

  let products: Product[] = [];
  let brandName = '';
  let totalProductsCount = 0;
  let totalPages = 1;
  let apiSucceeded = false;

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
    }
    // No matchingBrand -> brand no longer exists; totalProductsCount stays 0,
    // apiSucceeded stays true, so this falls through to the notFound() below
    // instead of rendering a fake "Keine Produkte" page as brandName.
    apiSucceeded = true;
  } catch (err) {
    console.error('Error fetching brand products:', err);
    brandName = decodeURIComponent(slug).toUpperCase();
  }

  // Brand genuinely has no products (or no longer exists) and the API call
  // that told us so didn't fail transiently -> real 404 instead of a 200
  // with an empty product list (was leaving stale pages indexed in Google).
  if (apiSucceeded && totalProductsCount === 0) {
    notFound();
  }

  const canonicalBase = `${baseUrl}/marken/${slug}`;

  const breadcrumbSchema = generateBrandBreadcrumbSchema(brandName, slug, baseUrl);
  const lowestPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : undefined;
  const faqSchema = generateBrandFAQSchema(brandName, totalProductsCount, lowestPrice);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <BrandDetailClient
        slug={slug}
        initialProducts={products}
        initialBrandName={brandName}
        totalProductsCount={totalProductsCount}
      />

      {/* Visible FAQ matching the FAQPage JSON-LD above */}
      <div className="container mx-auto px-4 pb-8">
        <section className="max-w-3xl">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {(faqSchema as any).mainEntity.map((faq: any) => (
              <div key={faq.name}>
                <h3 className="font-semibold text-gray-900 dark:text-white">{faq.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
