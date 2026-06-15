import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import BrandSearch from './BrandSearch';

export const revalidate = 43200; // 12h ISR

// Filter garbage brand names
function isValidBrand(name: string): boolean {
  if (!name || name.length > 60) return false;
  if (/[{}:;#()@<>"]/.test(name)) return false;
  if (name.startsWith('*') || name.startsWith('.') || name.startsWith('-')) return false;
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length > 5) return false;
  return true;
}

async function fetchBrands() {
  try {
    const firstResponse = await api.getBrands({ page_size: 200, page: 1 });
    const totalPages = firstResponse?.total_pages || 1;
    let allBrands: string[] = firstResponse?.results || [];

    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= Math.min(totalPages, 5); page++) {
        pagePromises.push(api.getBrands({ page_size: 200, page }));
      }
      const responses = await Promise.all(pagePromises);
      responses.forEach(response => {
        allBrands = [...allBrands, ...(response?.results || [])];
      });
    }

    // Filter and build entries sorted alphabetically (brands endpoint only returns brands with products)
    return allBrands
      .filter(isValidBrand)
      .map(name => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        count: 0,
      }))
      .filter(b => b.slug)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}

export default async function MarkenPage() {
  const brands = await fetchBrands();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-10">
        <Breadcrumbs items={[{ label: 'Marken' }]} />

        {/* Header */}
        <div className="mt-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Alle Marken
            <span className="ml-2 text-base font-normal text-gray-400 dark:text-gray-500">
              ({brands.length})
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Preisvergleich fuer {brands.length} Marken bei Saturn, MediaMarkt, Otto & Kaufland
          </p>
        </div>

        <BrandSearch brands={brands} />
      </main>

      <Footer />
    </div>
  );
}
