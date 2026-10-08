'use client';

import { useEffect, useState } from 'react';
import { Product, Category } from '@/lib/types';
import api from '@/lib/api';
import ProductSection from '@/components/ProductSection';
import AdSenseDisplay from '@/components/AdSenseDisplay';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';

interface CategorySection {
  category: Category;
  saturnProducts: Product[];
  mediamarktProducts: Product[];
  ottoProducts: Product[];
  kauflandProducts: Product[];
}

// Fixed display order for the homepage (curated, not alphabetical).
const HOMEPAGE_CATEGORY_ORDER = [
  'Fernseher',
  'Kopfhörer',
  'Kühlschränke',
  'Backöfen',
  'Waschmaschinen',
  'Kaffeemaschinen',
  'Airfryer',
  'Heizung & Klima',
  'E-Bikes',
  'Staubsauger',
];

export default function HomeContent() {
  const [topDeals, setTopDeals] = useState<Product[]>([]);
  const [categorySections, setCategorySections] = useState<CategorySection[]>([]);
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllSections();
  }, []);

  const loadTopCategories = async () => {
    try {
      const response = await api.getCategories({ page_size: 50 });
      const available = new Set(response.results || []);
      const ordered = HOMEPAGE_CATEGORY_ORDER.filter((cat) => available.has(cat));
      setTopCategories(ordered);
      return ordered;
    } catch (err) {
      console.error('Error loading categories:', err);
      return [];
    }
  };

  const loadAllSections = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load top categories first
      const categories = await loadTopCategories();

      // Load products from all retailers for top deals (single API call)
      const dealsRes = await api.getProductsFromBothRetailers({ page_size: 100 });
      const allProducts = dealsRes.results || [];
      console.log(`[Deals] API returned ${allProducts.length} products`);

      // Filter products that have discount values
      const productsWithDiscount = allProducts.filter(p => {
        if (!p.discount) return false;
        // Handle formats like "-15%", "15%", "15", etc.
        const discountStr = String(p.discount).replace(/[^0-9.]/g, '');
        const discount = parseFloat(discountStr);
        return !isNaN(discount) && discount > 0;
      });

      console.log(`[Deals] ${productsWithDiscount.length} products with discount`);

      // Sort by discount value (highest first)
      const sortedByDiscount = [...productsWithDiscount].sort((a, b) => {
        const discountA = parseFloat(String(a.discount).replace(/[^0-9.]/g, '') || '0');
        const discountB = parseFloat(String(b.discount).replace(/[^0-9.]/g, '') || '0');
        return discountB - discountA;
      });

      // Round-robin deals by retailer, then fill remaining slots
      const targetCount = 20;
      const dealsByRetailer: Record<string, Product[]> = {};
      for (const p of sortedByDiscount) {
        const r = p.retailer || 'other';
        if (!dealsByRetailer[r]) dealsByRetailer[r] = [];
        dealsByRetailer[r].push(p);
      }
      const mixedDeals = roundRobin(Object.values(dealsByRetailer)).slice(0, targetCount);

      if (mixedDeals.length < targetCount) {
        const dealIds = new Set(mixedDeals.map(p => p.id));
        const fillersByRetailer: Record<string, Product[]> = {};
        for (const p of allProducts) {
          if (dealIds.has(p.id)) continue;
          const r = p.retailer || 'other';
          if (!fillersByRetailer[r]) fillersByRetailer[r] = [];
          fillersByRetailer[r].push(p);
        }
        const fillers = roundRobin(Object.values(fillersByRetailer))
          .slice(0, targetCount - mixedDeals.length);
        mixedDeals.push(...fillers);
      }
      setTopDeals(mixedDeals);

      // Load products for each top category from all retailers mixed (in parallel)
      const sectionPromises = categories.map(async (category) => {
        const response = await api.getProductsFromBothRetailers({
          category: category,  // category is now a string, not an object
          page_size: 20
        });

        return {
          category,
          saturnProducts: response.results.filter(p => p.retailer === 'saturn'),
          mediamarktProducts: response.results.filter(p => p.retailer === 'mediamarkt'),
          ottoProducts: response.results.filter(p => p.retailer === 'otto'),
          kauflandProducts: response.results.filter(p => p.retailer === 'kaufland')
        };
      });

      const sections = await Promise.all(sectionPromises);
      setCategorySections(sections);
    } catch (err) {
      setError('Fehler beim Laden der Produkte');
      console.error('Error loading sections:', err);
    } finally {
      setLoading(false);
    }
  };

  // Round-robin: alternate products from different retailers
  const roundRobin = (groups: Product[][]): Product[] => {
    const result: Product[] = [];
    const seen = new Set<string>();
    let maxLen = 0;
    for (const g of groups) if (g.length > maxLen) maxLen = g.length;
    for (let i = 0; i < maxLen; i++) {
      for (const g of groups) {
        if (i < g.length && !seen.has(g[i].id)) {
          seen.add(g[i].id);
          result.push(g[i]);
        }
      }
    }
    return result;
  };

  const simplifyGermanName = (categoryName: string): string => {
    // If the name contains " - ", keep only the German part (before the dash)
    if (categoryName.includes(' - ')) {
      return categoryName.split(' - ')[0].trim();
    }

    // Direct translations for French-only names
    const translations: { [key: string]: string } = {
      'PC Bureau Gaming': 'Gaming-PC',
      'PC Portable': 'Laptop',
    };

    return translations[categoryName] || categoryName;
  };

  const getCategoryDescription = (categoryName: string, index: number): string => {
    const descriptions = [
      `Top-Angebote in ${categoryName} vergleichen`,
      `${categoryName} zum besten Preis finden`,
      `Aktuelle ${categoryName}-Deals entdecken`,
      `${categoryName} günstig online kaufen`,
      `Die besten ${categoryName}-Schnäppchen`,
      `${categoryName} im Preisvergleich`,
      `Jetzt ${categoryName} vergleichen & sparen`,
      `Beliebte ${categoryName} im Angebot`,
      `${categoryName}-Highlights der Woche`,
      `Günstige ${categoryName} sofort vergleichen`,
    ];
    return descriptions[index % descriptions.length];
  };

  const getCategoryIcon = (categoryName: string): string => {
    const icons: { [key: string]: string } = {
      'Laptops': '💻',
      'Gaming': '🎮',
      'Handys': '📱',
      'Kopfhörer': '🎧',
      'Fernseher': '📺',
      'Tablets': '📱',
      'Smartwatches': '⌚',
      'Kameras': '📷',
      'Waschmaschinen': '🧺',
      'Kühlschränke': '❄️',
      'PC': '🖥️',
      'Smartphone': '📱',
      'Audio': '🔊',
      'TV': '📺',
    };

    if (!categoryName) return '📦';

    for (const [key, icon] of Object.entries(icons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }

    return '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Seite wird geladen...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-8 text-center dark:bg-red-950">
        <svg
          className="mx-auto h-12 w-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-red-900 dark:text-red-100">
          {error}
        </h3>
        <button
          onClick={loadAllSections}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* ── Deals section — fond distinct (idealo-style) ─────────────── */}
      <section className="deals-section" aria-labelledby="top-angebote-heading">
        <div className="container mx-auto">
          <h2 id="top-angebote-heading" className="sr-only">Aktuelle Top Angebote</h2>
          <ProductSection
            title="Aktuelle Deals"
            description="Die besten Rabatte und Schnäppchen für Sie"
            products={topDeals}
            viewAllLink="/search?sort=discount"
          />
        </div>
      </section>

      {/* ── Hero Carousel — promotional banners ─────────────────── */}
      <HeroCarousel />

      {/* AdSense Display - After Carousel */}
      <AdSenseDisplay
        adSlot="1502312871"
        className="my-6"
      />

      {/* ── Kategorien ─────────────────────────────────────────────── */}
      <h2 className="sr-only">Produkte nach Kategorien</h2>

      {categorySections.map((section, index) => {
        if (!section.category || typeof section.category !== 'string') return null;

        const allProducts = roundRobin([
          section.saturnProducts,
          section.mediamarktProducts,
          section.ottoProducts,
          section.kauflandProducts
        ]);

        const categoryName = section.category;
        const translatedName = simplifyGermanName(categoryName);
        const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        return (
          <ProductSection
            key={section.category}
            title={translatedName}
            description={getCategoryDescription(translatedName, index)}
            products={allProducts}
            viewAllLink={`/kategorien/${categorySlug}`}
          />
        );
      })}

      {/* ── SEO content + USP section ─────────────────────────────── */}
      <section className="my-12 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Preisradio — Ihr Preisvergleich für Elektronik
          </h2>
          <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
            Wir durchsuchen täglich die Angebote der größten deutschen Online-Händler, damit Sie den besten Preis finden — schnell, kostenlos und unabhängig.
          </p>
        </div>

        {/* How it works */}
        <div className="px-6 py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">So funktioniert Preisradio</h3>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">1. Produkt suchen</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Geben Sie den Produktnamen ein oder stöbern Sie in unseren Kategorien und Marken.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">2. Preise vergleichen</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sehen Sie auf einen Blick, welcher Händler den niedrigsten Preis für das gleiche Produkt bietet.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">3. Günstig einkaufen</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Klicken Sie direkt zum günstigsten Angebot und sparen Sie bei jedem Einkauf bares Geld.</p>
            </div>
          </div>
        </div>

        {/* USP grid */}
        <div className="border-t border-gray-100 dark:border-zinc-800 px-6 py-8 bg-gray-50 dark:bg-zinc-800/50">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '⚡', title: 'Echtzeit-Preise', text: 'Preise werden täglich aktualisiert — kein veralteter Vergleich.' },
              { icon: '🛡️', title: 'Nur seriöse Händler', text: 'Saturn, MediaMarkt, Otto, Kaufland — geprüfte deutsche Shops.' },
              { icon: '💶', title: '100 % kostenlos', text: 'Kein Abo, keine Registrierung. Einfach vergleichen und sparen.' },
              { icon: '📱', title: 'Für alle Geräte', text: 'Optimiert für Smartphone, Tablet und Desktop — überall dabei.' },
            ].map((usp) => (
              <div key={usp.title} className="flex gap-3 items-start">
                <span className="text-2xl flex-none mt-0.5">{usp.icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{usp.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{usp.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO text */}
        <div className="border-t border-gray-100 dark:border-zinc-800 px-6 py-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Warum Preisvergleich bei Elektronik wichtig ist</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 max-w-3xl">
            <p>
              Elektronikprodukte wie Laptops, Fernseher, Kopfhörer und Haushaltsgeräte unterscheiden sich im Preis je nach Händler oft um 10 bis 30 Prozent. Ein Fernseher, der bei einem Shop 599&nbsp;€ kostet, kann bei einem anderen bereits für 469&nbsp;€ erhältlich sein — für das gleiche Modell mit identischer Garantie.
            </p>
            <p>
              Preisradio vergleicht automatisch die Preise der großen deutschen Online-Händler Saturn, MediaMarkt, Otto und Kaufland. So finden Sie in Sekunden das günstigste Angebot, ohne jeden Shop einzeln zu besuchen. Unser System aktualisiert die Preise täglich, damit Sie immer den aktuellen Stand sehen.
            </p>
            <p>
              Egal ob Sie ein neues Smartphone, eine Kaffeemaschine oder Gaming-Zubehör suchen — mit Preisradio treffen Sie eine informierte Kaufentscheidung und sparen bei jedem Einkauf.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
