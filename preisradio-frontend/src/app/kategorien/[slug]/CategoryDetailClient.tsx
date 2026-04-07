'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import AdSenseDisplay from '@/components/AdSenseDisplay';

interface CategoryDetailClientProps {
  slug: string;
  initialProducts: Product[];
  initialCategoryName: string;
  totalProductsCount?: number;
}

export default function CategoryDetailClient({
  slug,
  initialProducts,
  initialCategoryName,
  totalProductsCount = 0,
}: CategoryDetailClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categoryName, setCategoryName] = useState<string>(initialCategoryName);
  const [loading, setLoading] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest'>('newest');
  const [pageSize, setPageSize] = useState<number>(24);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [priceInited, setPriceInited] = useState(false);

  // Only fetch if no initial data
  useEffect(() => {
    if (initialProducts.length === 0) {
      loadCategoryProducts();
    }
  }, [slug, initialProducts]);

  const loadCategoryProducts = async () => {
    try {
      setLoading(true);
      const categoriesResponse = await api.getCategories({ page_size: 1000 });
      const allCategories = categoriesResponse.results || [];

      const matchingCategory = allCategories.find(cat => {
        const catSlug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return catSlug === normalizedSlug;
      });

      if (matchingCategory) {
        setCategoryName(matchingCategory);
        const response = await api.getProductsFromBothRetailers({
          category: matchingCategory,
          page_size: 100,
        });
        setProducts(response?.results || []);
      }
    } catch (err) {
      console.error('Error loading category products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate global min/max prices
  const globalMinPrice = products.length > 0 ? Math.floor(Math.min(...products.map(p => p.price))) : 0;
  const globalMaxPrice = products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 1000;

  // Init price range once
  useEffect(() => {
    if (products.length > 0 && !priceInited) {
      setPriceRange([globalMinPrice, globalMaxPrice]);
      setPriceInited(true);
    }
  }, [products, priceInited, globalMinPrice, globalMaxPrice]);

  // Filter and sort products
  const filteredProducts = products.filter((product) => {
    if (selectedBrand && product.brand !== selectedBrand) return false;
    if (selectedRetailer && product.retailer !== selectedRetailer) return false;
    if (priceInited && product.price < priceRange[0]) return false;
    if (priceInited && product.price > priceRange[1]) return false;
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'newest') {
      const dateA = a.scraped_at ? new Date(a.scraped_at).getTime() : 0;
      const dateB = b.scraped_at ? new Date(b.scraped_at).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  // Extract unique brands and retailers
  const brands = Array.from(new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))).sort();
  const retailers = Array.from(new Set(products.map((p) => p.retailer).filter((r): r is string => Boolean(r)))).sort();

  // Stats
  const stats = {
    totalProducts: products.length,
    avgPrice: products.length > 0
      ? products.reduce((sum, p) => sum + p.price, 0) / products.length
      : 0,
    minPrice: products.length > 0 ? Math.min(...products.map(p => p.price)) : 0,
    maxPrice: products.length > 0 ? Math.max(...products.map(p => p.price)) : 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <Navigation />

      <main className="container mx-auto px-4 py-6 md:py-10">
        {/* Breadcrumbs */}
        {categoryName && (
          <Breadcrumbs
            items={[
              { label: 'Kategorien', href: '/kategorien' },
              { label: categoryName }
            ]}
          />
        )}

        {/* Header: H1 + brand pills + sort */}
        <div className="mt-4 mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {categoryName || 'Kategorie'}
          </h1>
          {brands.length > 0 && (
            <nav className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedBrand('')}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedBrand === ''
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700'
                }`}
              >
                Alle
              </button>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedBrand === brand
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </nav>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">Sortierung:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[13px] text-gray-700 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 cursor-pointer"
            >
              <option value="newest">Beliebtheit</option>
              <option value="price_asc">Preis aufsteigend</option>
              <option value="price_desc">Preis absteigend</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Stand: {new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date())} · Preise taeglich aktualisiert
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-6 text-base font-medium text-gray-600 dark:text-gray-400">
                Produkte werden geladen...
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Bitte warten Sie einen Moment
              </p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 p-12 md:p-16 text-center border-2 border-dashed border-gray-300 dark:border-zinc-700">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center mb-6">
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Keine Produkte gefunden
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Diese Kategorie hat derzeit keine Produkte in unserer Datenbank. Schauen Sie spaeter wieder vorbei oder durchsuchen Sie andere Kategorien.
            </p>
            <Link
              href="/kategorien"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Alle Kategorien durchsuchen
            </Link>
          </div>
        ) : (
          <>
            <div className="max-w-[728px] mb-6">
              <AdSenseDisplay
                adSlot="1502312871"
                adFormat=""
                fullWidthResponsive={false}
                style={{ display: 'inline-block', width: '728px', height: '90px' }}
              />
            </div>

            <div className="lg:grid lg:grid-cols-4 lg:gap-8">
              {/* Sidebar Filters */}
              <aside className="mb-6 lg:col-span-1 lg:mb-0">
                <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 sticky top-20">
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                      Filter
                    </h2>
                    {(selectedBrand || selectedRetailer || (priceInited && (priceRange[0] > globalMinPrice || priceRange[1] < globalMaxPrice))) && (
                      <button
                        onClick={() => {
                          setSelectedBrand('');
                          setSelectedRetailer('');
                          setPriceRange([globalMinPrice, globalMaxPrice]);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Zurucksetzen
                      </button>
                    )}
                  </div>

                  {/* Price Filter — Range Slider */}
                  <div className="mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <label className="mb-3 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Preis
                    </label>
                    <div className="flex items-center justify-between mb-3 text-sm font-medium text-gray-900 dark:text-white">
                      <span>{priceRange[0]} €</span>
                      <span>{priceRange[1]} €</span>
                    </div>
                    <div className="relative h-2">
                      <div className="absolute inset-0 rounded-full bg-gray-200 dark:bg-zinc-700" />
                      <div
                        className="absolute h-full rounded-full bg-blue-500"
                        style={{
                          left: `${globalMaxPrice > globalMinPrice ? ((priceRange[0] - globalMinPrice) / (globalMaxPrice - globalMinPrice)) * 100 : 0}%`,
                          right: `${globalMaxPrice > globalMinPrice ? ((globalMaxPrice - priceRange[1]) / (globalMaxPrice - globalMinPrice)) * 100 : 0}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={globalMinPrice}
                        max={globalMaxPrice}
                        value={priceRange[0]}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]);
                        }}
                        className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer"
                      />
                      <input
                        type="range"
                        min={globalMinPrice}
                        max={globalMaxPrice}
                        value={priceRange[1]}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (v >= priceRange[0]) setPriceRange([priceRange[0], v]);
                        }}
                        className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-500 [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Page Size */}
                  <div className="mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
                    <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Artikel pro Seite
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white cursor-pointer"
                    >
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                      <option value={96}>96</option>
                    </select>
                  </div>

                  {/* Retailer Filter with Icons */}
                  {retailers.length > 0 && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Handler
                      </label>
                      <div className="space-y-1">
                        {retailers.map((retailer) => {
                          const names: Record<string, string> = { saturn: 'Saturn', mediamarkt: 'MediaMarkt', otto: 'Otto', kaufland: 'Kaufland', amazon: 'Amazon' };
                          const icons: Record<string, string> = { saturn: '/retailers/saturn.png', mediamarkt: '/retailers/mediamarkt.png', otto: '/retailers/otto.png', kaufland: '/retailers/kaufland.png', amazon: '/retailers/amazon_new.webp' };
                          return (
                            <button
                              key={retailer}
                              onClick={() => setSelectedRetailer(selectedRetailer === retailer ? '' : retailer)}
                              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                                selectedRetailer === retailer
                                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {icons[retailer] && (
                                <Image
                                  src={icons[retailer]}
                                  alt={names[retailer] || retailer}
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 object-contain"
                                  unoptimized
                                />
                              )}
                              <span className="font-medium">{names[retailer] || retailer}</span>
                              {selectedRetailer === retailer && (
                                <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {sortedProducts.length} {sortedProducts.length === 1 ? 'Produkt' : 'Produkte'}
                </p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-3 lg:grid-cols-4">
                  {sortedProducts.slice(0, pageSize).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>

            {/* Show more button */}
            {sortedProducts.length > pageSize && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPageSize(pageSize + 24)}
                  className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 transition-colors"
                >
                  Mehr anzeigen ({sortedProducts.length - pageSize} weitere)
                </button>
              </div>
            )}

            {/* Top 5 Preisvergleich — HTML table for AI citation */}
            {sortedProducts.length > 0 && (
              <section aria-label={`Top 5 ${categoryName} im Preisvergleich`} className="mt-12 rounded-2xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Top 5 {categoryName} im Preisvergleich
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-zinc-700">
                        <th className="pb-3 font-semibold text-gray-900 dark:text-white">Produkt</th>
                        <th className="pb-3 font-semibold text-gray-900 dark:text-white">Preis</th>
                        <th className="pb-3 font-semibold text-gray-900 dark:text-white hidden sm:table-cell">Haendler</th>
                        <th className="pb-3 font-semibold text-gray-900 dark:text-white hidden md:table-cell">Rabatt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...sortedProducts]
                        .sort((a, b) => a.price - b.price)
                        .slice(0, 5)
                        .map((p) => (
                          <tr key={p.id} className="border-b border-gray-100 dark:border-zinc-800">
                            <td className="py-3 pr-4">
                              <Link href={`/product/${p.id}`} className="text-blue-600 hover:underline dark:text-blue-400 line-clamp-2">
                                {p.title}
                              </Link>
                            </td>
                            <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                              {p.price.toFixed(2)} EUR
                            </td>
                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell capitalize">
                              {p.retailer || '–'}
                            </td>
                            <td className="py-3 text-green-600 dark:text-green-400 hidden md:table-cell">
                              {p.old_price && p.old_price > p.price
                                ? `-${Math.round(((p.old_price - p.price) / p.old_price) * 100)}%`
                                : '–'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* FAQ — Microdata (FAQPage schema embedded in HTML) */}
            {categoryName && (
              <section
                aria-label={`FAQ zu ${categoryName}`}
                className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800"
                itemScope
                itemType="https://schema.org/FAQPage"
              >
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Haeufig gestellte Fragen zu {categoryName}
                </h2>
                <div className="space-y-3">
                  <div itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
                    <details className="group border-b border-gray-100 dark:border-zinc-800 pb-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                        <span itemProp="name">Wo kann ich {categoryName} am guenstigsten kaufen?</span>
                        <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed" itemProp="text">
                          Preisradio vergleicht taeglich Preise fuer {categoryName} bei Saturn, MediaMarkt, Otto und Kaufland.
                          Aktuell finden Sie {totalProductsCount > 0 ? totalProductsCount : 'zahlreiche'} {categoryName}-Angebote{sortedProducts.length > 0 ? ` ab ${Math.min(...sortedProducts.map(p => p.price)).toFixed(2)} EUR` : ''}.
                          Alle Preise werden direkt von den Haendlern uebernommen.
                        </p>
                      </div>
                    </details>
                  </div>
                  <div itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
                    <details className="group border-b border-gray-100 dark:border-zinc-800 pb-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                        <span itemProp="name">Wie viele {categoryName} werden bei Preisradio verglichen?</span>
                        <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed" itemProp="text">
                          Aktuell vergleicht Preisradio {totalProductsCount > 0 ? totalProductsCount : 'zahlreiche'} {categoryName} von Saturn, MediaMarkt, Otto und Kaufland.
                          Die Preise werden taeglich aktualisiert.
                        </p>
                      </div>
                    </details>
                  </div>
                  <div itemProp="mainEntity" itemScope itemType="https://schema.org/Question">
                    <details className="group pb-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                        <span itemProp="name">Ist der {categoryName} Preisvergleich auf Preisradio kostenlos?</span>
                        <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
                      </summary>
                      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed" itemProp="text">
                          Ja, der Preisvergleich fuer {categoryName} auf Preisradio ist vollstaendig kostenlos und ohne Registrierung nutzbar.
                          Wir sind unabhaengig und erhalten keine Zahlungen von Haendlern fuer bessere Platzierungen.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              </section>
            )}

            {/* Editorial SEO content */}
            {categoryName && (
              <section aria-label={`Kaufberatung ${categoryName}`} className="mt-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
                <div className="max-w-3xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-4">

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {categoryName} im Preisvergleich {new Date().getFullYear()} — Kaufberatung, Preise & Tipps
                  </h2>

                  <p>
                    Auf Preisradio finden Sie aktuell{' '}
                    <strong>{stats.totalProducts} {categoryName}-Produkte</strong> von{' '}
                    {retailers.length > 0 ? (
                      retailers.map((r, i) => {
                        const names: Record<string, string> = { saturn: 'Saturn', mediamarkt: 'MediaMarkt', otto: 'Otto', kaufland: 'Kaufland' };
                        const name = names[r] || r;
                        if (i === retailers.length - 1 && retailers.length > 1) return ` und ${name}`;
                        if (i > 0) return `, ${name}`;
                        return name;
                      }).join('')
                    ) : 'den grossen deutschen Online-Haendlern'}
                    . Die Preise reichen von <strong>{stats.minPrice.toFixed(2)}&nbsp;€</strong> bis <strong>{stats.maxPrice.toFixed(2)}&nbsp;€</strong>,
                    bei einem Durchschnittspreis von {stats.avgPrice.toFixed(2)}&nbsp;€.
                  </p>

                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
                    Warum lohnt sich ein {categoryName} Preisvergleich?
                  </h3>

                  <p>
                    Der gleiche Artikel kann je nach Haendler deutlich im Preis variieren. Preisunterschiede von 10 bis 30 Prozent
                    sind keine Seltenheit. Ein schneller Vergleich auf Preisradio zeigt Ihnen sofort, wo Sie am wenigsten bezahlen — ohne jeden Shop einzeln besuchen zu muessen.
                  </p>

                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
                    Worauf sollten Sie beim Kauf von {categoryName} achten?
                  </h3>

                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Garantie und Gewaehrleistung:</strong> Pruefen Sie, ob der Haendler die volle Herstellergarantie bietet. Bei autorisierten Haendlern wie Saturn oder MediaMarkt ist dies in der Regel der Fall.</li>
                    <li><strong>Lieferzeit und Versandkosten:</strong> Manche Haendler liefern kostenlos ab einem bestimmten Bestellwert. Vergleichen Sie neben dem Produktpreis auch die Gesamtkosten.</li>
                    <li><strong>Rueckgaberecht:</strong> Alle auf Preisradio gelisteten Haendler bieten das gesetzliche 14-taegige Widerrufsrecht. Einige gewaehren darueber hinaus verlaengerte Rueckgabefristen.</li>
                    <li><strong>Technische Spezifikationen:</strong> Achten Sie auf Modellnummer und Ausstattungsvariante. Verschiedene Haendler fuehren teilweise unterschiedliche Konfigurationen.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
                    Wann gibt es die besten {categoryName}-Angebote?
                  </h3>

                  <p>
                    Preisradio aktualisiert die Preise taeglich. Erfahrungsgemaess gibt es die groessten Rabatte zu folgenden Zeitraeumen:
                  </p>

                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Black Friday & Cyber Monday</strong> (Ende November) — haeufig die tiefsten Preise des Jahres</li>
                    <li><strong>Amazon Prime Day</strong> (Juli) — auch andere Haendler ziehen mit Gegenangeboten nach</li>
                    <li><strong>Saisonwechsel</strong> (Januar, Juli) — Lagerraeumung und Modellwechsel fuehren zu Preissenkungen</li>
                  </ul>

                  <p>
                    Preisradio ist und bleibt <strong>kostenlos und unabhaengig</strong>. Die Reihenfolge der Produkte richtet sich ausschliesslich nach Aktualitaet und Preis.
                  </p>

                </div>
              </section>
            )}

          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
