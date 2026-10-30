import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import api from '@/lib/api';
import CategoryDetailClient from './CategoryDetailClient';
import { Product } from '@/lib/types';
import { generateCategoryBreadcrumbSchema, generateCategoryFAQSchema, generateItemListSchema } from '@/lib/schema';

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
    const categoryName = decodedSlug.replace(/-/g, ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    // Fetch product count for dynamic title
    let productCount = 0;
    try {
      const countRes = await api.getProductsFromBothRetailers({
        category: categoryName,
        page_size: 1,
      });
      productCount = countRes?.count || 0;
    } catch {
      // fallback: title without count
    }

    const countLabel = productCount > 0 ? ` (${productCount} Produkte)` : '';
    const title = `${categoryName}${countLabel} günstig kaufen – Preisvergleich | Preisradio`;
    const description = `${categoryName} im Preisvergleich: Saturn, MediaMarkt, Otto & Kaufland. Finden Sie täglich die günstigsten ${categoryName}-Angebote und sparen Sie beim Online-Kauf.`;

    const keywords = [
      `${categoryName} kaufen`,
      `${categoryName} günstig`,
      `${categoryName} Preisvergleich`,
      `${categoryName} Angebot`,
      `${categoryName} Saturn MediaMarkt`,
      `günstige ${categoryName}`,
      'Preisradio',
    ];

    const canonicalBase = `${baseUrl}/kategorien/${slug}`;
    const canonical = currentPage === 1 ? canonicalBase : `${canonicalBase}?page=${currentPage}`;

    return {
      title,
      description,
      keywords,
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        locale: 'de_DE',
        siteName: 'Preisradio',
        modifiedTime: new Date().toISOString(),
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
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
      title: 'Kategorie | Preisradio',
      description: 'Kategorieprodukte auf Preisradio',
    };
  }
}

export default async function CategoryDetailPage({
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

  // Same duplicate-case issue as /marken/[slug]: redirect any non-lowercase
  // slug to the canonical lowercase URL instead of letting both get indexed.
  if (slug !== slug.toLowerCase()) {
    const target = `/kategorien/${slug.toLowerCase()}${currentPage > 1 ? `?page=${currentPage}` : ''}`;
    redirect(target);
  }

  let products: Product[] = [];
  let categoryName = '';
  let totalProductsCount = 0;
  let totalPages = 1;
  let apiSucceeded = false;

  try {
    const categoriesResponse = await api.getCategories({ page_size: 1000 });
    const allCategories = categoriesResponse.results || [];

    const matchingCategory = allCategories.find(cat => {
      const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return catSlug === normalizedSlug;
    });

    if (matchingCategory) {
      categoryName = matchingCategory;

      const response = await api.getProductsFromBothRetailers({
        category: categoryName,
        page: currentPage,
        page_size: PAGE_SIZE,
      });

      products = response?.results || [];
      totalProductsCount = response?.count || 0;
      totalPages = Math.ceil(totalProductsCount / PAGE_SIZE);
    }
    // No matchingCategory -> category no longer exists; totalProductsCount
    // stays 0, apiSucceeded stays true, falls through to notFound() below.
    apiSucceeded = true;
  } catch (err) {
    console.error('Error fetching category products:', err);
    categoryName = decodeURIComponent(slug).replace(/-/g, ' ');
  }

  // Category genuinely has no products (or no longer exists) and the API
  // call that told us so didn't fail transiently -> real 404 instead of a
  // 200 with an empty product list.
  if (apiSucceeded && totalProductsCount === 0) {
    notFound();
  }

  const canonicalBase = `${baseUrl}/kategorien/${slug}`;

  const breadcrumbSchema = generateCategoryBreadcrumbSchema(categoryName, slug, baseUrl);
  const lowestPrice = products.length > 0 ? Math.min(...products.map(p => p.price)) : undefined;
  const faqSchema = generateCategoryFAQSchema(categoryName, totalProductsCount, lowestPrice);
  const itemListSchema = generateItemListSchema(products, categoryName, baseUrl);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <CategoryDetailClient
        slug={slug}
        initialProducts={products}
        initialCategoryName={categoryName}
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
