import { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/blog-db';

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'https://api.preisradio.de/api';

// Revalidate sitemap every hour (blog articles update frequently)
export const revalidate = 3600;

// Generate multiple sitemaps: static, products, brands, categories
export async function generateSitemaps() {
  return [
    { id: 'static' },
    { id: 'blog' },
    { id: 'products-index' },
    { id: 'brands' },
    { id: 'categories' },
  ];
}

// Helper: paginated fetch of products (page_size=500 instead of 10000 to avoid timeouts)
async function fetchProductsPaginated(params: string, maxPages = 10) {
  const allProducts: any[] = [];
  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(`${API_URL}/products/?page_size=500&page=${page}${params}`, {
        next: { revalidate: 86400 },
        headers: { 'User-Agent': 'Preisradio-SitemapGenerator/1.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) break;
      const data = await res.json();
      allProducts.push(...(data.results || []));
      if (!data.next) break;
    } catch {
      break;
    }
  }
  return allProducts;
}

// Helper: fetch all brands via lightweight brands endpoint
async function fetchAllBrands() {
  const brands: string[] = [];
  for (let page = 1; page <= 5; page++) {
    try {
      const res = await fetch(`${API_URL}/products/brands/?page_size=200&page=${page}`, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) break;
      const data = await res.json();
      brands.push(...(data.results || []));
      if (!data.next) break;
    } catch {
      break;
    }
  }
  return brands;
}

// Helper: fetch all categories via lightweight categories endpoint
async function fetchAllCategories() {
  try {
    const res = await fetch(`${API_URL}/products/categories/?page_size=1000`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

// Reject garbage data (CSS injection, HTML, product descriptions as brand names)
function isValidName(name: string): boolean {
  if (!name || name.length > 60) return false;
  if (/[{}:;#()@<>"]/.test(name)) return false; // CSS/HTML chars
  if (name.startsWith('*') || name.startsWith('.') || name.startsWith('-')) return false;
  // Reject names with too many hyphens/spaces (likely product descriptions not brands)
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length > 5) return false;
  return true;
}

// Clean slug: trim leading/trailing dashes
function cleanSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const sitemapId = await id;
  const baseUrl = 'https://preisradio.de';

  // Static pages sitemap
  if (sitemapId === 'static') {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      },
      {
        url: `${baseUrl}/kategorien`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/marken`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/haendler`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/kontakt`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      },
      {
        url: `${baseUrl}/impressum`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
      {
        url: `${baseUrl}/datenschutz`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      },
    ];
  }

  // Blog sitemap — /blog index + all article pages
  if (sitemapId === 'blog') {
    const entries: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      },
    ];
    try {
      const articles = await getPublishedArticles();
      articles.forEach((article) => {
        entries.push({
          url: `${baseUrl}/blog/${article.slug}`,
          lastModified: new Date(article.date),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        });
      });
    } catch {
      // Build resilience — return at least /blog
    }
    return entries;
  }

  // Products sitemap - paginated fetch (page_size=500)
  if (sitemapId === 'products-index') {
    try {
      const allProducts = await fetchProductsPaginated('');
      const productPages = allProducts.map((product: any) => ({
        url: `${baseUrl}/product/${product.id}`,
        lastModified: product.scraped_at ? new Date(product.scraped_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
      console.log(`✓ Generated products sitemap with ${productPages.length} URLs`);
      return productPages;
    } catch (error) {
      console.error(`Error generating products sitemap:`, error);
      return [];
    }
  }

  // Brands sitemap - uses lightweight /brands/ endpoint
  if (sitemapId === 'brands') {
    try {
      const brands = await fetchAllBrands();
      const brandPages = brands
        .filter(isValidName)
        .map((name: string) => ({
          url: `${baseUrl}/marken/${encodeURIComponent(cleanSlug(name))}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      console.log(`✓ Generated brands sitemap with ${brandPages.length} URLs`);
      return brandPages;
    } catch (error) {
      console.error(`Error generating brands sitemap:`, error);
      return [];
    }
  }

  // Categories sitemap - uses lightweight /categories/ endpoint
  if (sitemapId === 'categories') {
    try {
      const categories = await fetchAllCategories();
      const categoryPages = categories
        .filter(isValidName)
        .map((name: string) => ({
          url: `${baseUrl}/kategorien/${encodeURIComponent(cleanSlug(name))}`,
          lastModified: new Date(),
          changeFrequency: 'daily' as const,
          priority: 0.8,
        }));
      console.log(`✓ Generated categories sitemap with ${categoryPages.length} URLs`);
      return categoryPages;
    } catch (error) {
      console.error(`Error generating categories sitemap:`, error);
      return [];
    }
  }

  return [];
}
