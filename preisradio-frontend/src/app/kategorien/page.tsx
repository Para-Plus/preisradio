import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { Product } from '@/lib/types';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 43200; // 12h ISR

// Priority order for categories (shown first in grid)
const PRIORITY_CATEGORIES = [
  'Smartphones', 'Laptops', 'Fernseher', 'Kopfhörer', 'Tablets',
  'Waschmaschinen', 'Kühlschränke', 'Gaming', 'Kameras', 'Smartwatches',
  'Staubsauger', 'Drucker', 'Lautsprecher', 'Kaffeemaschinen',
  'Geschirrspüler', 'Monitore', 'Mikrowellen', 'Klimageräte',
  'E-Scooter', 'Haartrockner',
];

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Alle Kategorien – Preisvergleich | Preisradio';
  const description = 'Alle Produktkategorien im Preisvergleich entdecken: Smartphones, Laptops, Fernseher, Haushaltsgeräte und mehr. Täglich aktualisierte Preise und Top-Angebote.';

  return {
    title,
    description,
    keywords: ['Preisvergleich', 'Kategorien', 'Saturn', 'MediaMarkt', 'Otto', 'Kaufland', 'günstig kaufen'],
    openGraph: {
      title,
      description,
      url: `${baseUrl}/kategorien`,
      type: 'website',
      locale: 'de_DE',
      siteName: 'Preisradio',
    },
    alternates: {
      canonical: `${baseUrl}/kategorien`,
    },
  };
}

interface CategoryData {
  name: string;
  slug: string;
  count: number;
  image: string | null;
  topProducts: { id: string; title: string; price: number; brand: string }[];
  topBrands: { name: string; slug: string }[];
}

async function fetchCategoryData(categoryName: string): Promise<CategoryData | null> {
  try {
    const response = await api.getProducts({
      category: categoryName,
      page_size: 10,
    });

    const products = response?.results || [];
    const count = response?.count || 0;
    if (count === 0) return null;

    // First product with an image
    const image = products.find((p: Product) => p.image)?.image || null;

    // Top 3 products by lowest price (with brand + id for links)
    const topProducts = products
      .filter((p: Product) => p.brand && p.price > 0)
      .sort((a: Product, b: Product) => a.price - b.price)
      .slice(0, 3)
      .map((p: Product) => ({
        id: p.id,
        title: p.title.length > 40 ? p.title.substring(0, 37) + '...' : p.title,
        price: p.price,
        brand: p.brand || '',
      }));

    // Top 3 brands by frequency (with slug for links)
    const brandCounts: Record<string, number> = {};
    products.forEach((p: Product) => {
      if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([brand]) => ({
        name: brand,
        slug: brand.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      }));

    const slug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return { name: categoryName, slug, count, image, topProducts, topBrands };
  } catch {
    return null;
  }
}

export default async function KategorienPage() {
  // Fetch all categories from API
  let allCategories: string[] = [];
  try {
    const catResponse = await api.getCategories({ page_size: 1000 });
    allCategories = catResponse.results || [];
  } catch {
    allCategories = PRIORITY_CATEGORIES; // fallback
  }

  // Sort: priority categories first, then the rest alphabetically
  const prioritySet = new Set(PRIORITY_CATEGORIES);
  const sortedCategories = [
    ...PRIORITY_CATEGORIES.filter(c => allCategories.includes(c)),
    ...allCategories.filter(c => !prioritySet.has(c)).sort((a, b) => a.localeCompare(b, 'de')),
  ];

  // Fetch data for categories in batches of 5 to avoid overwhelming the API
  const categoryResults: PromiseSettledResult<CategoryData | null>[] = [];
  for (let i = 0; i < sortedCategories.length; i += 5) {
    const batch = sortedCategories.slice(i, i + 5);
    const batchResults = await Promise.allSettled(
      batch.map(cat => fetchCategoryData(cat))
    );
    categoryResults.push(...batchResults);
  }

  const categoriesData: CategoryData[] = categoryResults
    .filter((r): r is PromiseFulfilledResult<CategoryData | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((d): d is CategoryData => d !== null && d.count > 0);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Kategorien', item: `${baseUrl}/kategorien` },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navigation />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Alle Kategorien
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {categoriesData.length} Kategorien mit täglich aktualisierten Preisen und Top-Angeboten
          </p>
        </div>

        {/* Categories Grid — 2 mobile / 3 tablet / 4 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {categoriesData.map((cat) => (
            <div
              key={cat.slug}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-900/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image area with gradient overlay — links to category */}
              <Link href={`/kategorien/${cat.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-6xl text-gray-200 dark:text-zinc-700">
                      📦
                    </div>
                  )}
                  {/* Bottom gradient fade */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-900 dark:via-zinc-900/90" />

                  {/* Category name overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                    <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {cat.name}
                    </h2>
                  </div>
                </div>
              </Link>

              {/* Content below image */}
              <div className="px-3 md:px-4 pb-3 md:pb-4 -mt-1">
                {/* Top Brands — clickable links */}
                {cat.topBrands.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {cat.topBrands.map((brand) => (
                      <Link
                        key={brand.slug}
                        href={`/marken/${brand.slug}`}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                      >
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Top products — clickable links */}
                {cat.topProducts.length > 0 && (
                  <ul className="space-y-1">
                    {cat.topProducts.map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.id}`}
                          className="flex items-center justify-between text-xs md:text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span className="text-gray-600 dark:text-gray-400 truncate mr-2">
                            {product.title}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
                            ab {product.price.toFixed(0)} €
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* FAQ — visible HTML only (no FAQPage JSON-LD) */}
        <section aria-label="Häufig gestellte Fragen zum Preisvergleich" className="mt-12 rounded-2xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Häufig gestellte Fragen
          </h2>
          <div className="space-y-3">
            <details className="group border-b border-gray-100 dark:border-zinc-800 pb-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                Was ist ein Preisvergleich und wie funktioniert er?
                <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Ein Preisvergleich zeigt Ihnen auf einen Blick, bei welchem Händler ein Produkt am günstigsten ist.
                Preisradio durchsucht täglich die Angebote von Saturn, MediaMarkt, Otto und Kaufland und listet
                die aktuellen Preise übersichtlich auf — so finden Sie schnell das beste Angebot, ohne jeden Shop
                einzeln besuchen zu müssen.
              </p>
            </details>
            <details className="group border-b border-gray-100 dark:border-zinc-800 pb-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                Welche Shops werden bei Preisradio verglichen?
                <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Aktuell vergleicht Preisradio die Preise von vier großen deutschen Händlern: Saturn, MediaMarkt,
                Otto und Kaufland. Diese Shops decken ein breites Sortiment ab — von Smartphones und Laptops über
                Haushaltsgeräte bis hin zu Gaming-Zubehör. Weitere Händler werden in Zukunft hinzugefügt.
              </p>
            </details>
            <details className="group border-b border-gray-100 dark:border-zinc-800 pb-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                Wie oft werden die Preise aktualisiert?
                <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Die Preise bei Preisradio werden täglich aktualisiert. Unser System überprüft regelmäßig die
                Angebote aller Händler, damit Sie stets die aktuellsten Preise sehen. Besonders bei
                zeitlich begrenzten Aktionen wie Black Friday oder Cyber Monday lohnt sich ein häufiger Blick.
              </p>
            </details>
            <details className="group border-b border-gray-100 dark:border-zinc-800 pb-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                Ist der Preisvergleich bei Preisradio kostenlos?
                <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Ja, Preisradio ist für alle Nutzer vollständig kostenlos. Sie können beliebig viele Produkte
                vergleichen, Filter nutzen und direkt zum günstigsten Angebot weitergeleitet werden —
                ohne Registrierung und ohne versteckte Kosten.
              </p>
            </details>
            <details className="group pb-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-900 dark:text-white flex items-center justify-between">
                Wie finde ich das günstigste Angebot für ein Produkt?
                <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9660;</span>
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Wählen Sie zunächst eine Kategorie aus, die Sie interessiert. Auf der Kategorieseite können Sie
                nach Marke, Preis und Händler filtern. Die Produkte werden mit dem günstigsten Preis angezeigt,
                sodass Sie sofort sehen, wo Sie am meisten sparen. Mit einem Klick gelangen Sie direkt zum Shop.
              </p>
            </details>
          </div>
        </section>

        {/* SEO Editorial Content — Kaufberatung & Trends */}
        <section aria-label="Kaufberatung und Trends" className="mt-8 rounded-2xl bg-white dark:bg-zinc-900 p-6 md:p-8 shadow-sm border border-gray-100 dark:border-zinc-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Elektronik & Haushaltsgeräte kaufen — worauf es 2026 ankommt
          </h2>
          <div className="space-y-4 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              Der Markt für Elektronik und Haushaltsgeräte verändert sich 2026 spürbar. KI-gestützte Smartphones,
              RGB-Mini-LED-Fernseher und smarte Haushaltsgeräte mit Matter-Standard setzen neue Maßstäbe.
              Wer vor einer Anschaffung steht, profitiert von einem gezielten Preisvergleich — denn die
              Preisunterschiede zwischen den Händlern betragen bei größeren Geräten oft über 100 Euro.
            </p>

            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
              Smartphones 2026: KI wird zum Standard
            </h3>
            <p>
              Samsung Galaxy S26 Ultra, Xiaomi 17 Ultra, Google Pixel 11 und iPhone 18 — die Smartphone-Neuheiten
              2026 setzen massiv auf KI-Funktionen. Von der automatischen Bildbearbeitung über Echtzeit-Übersetzung
              bis zur intelligenten Akku-Optimierung: KI ist nicht mehr nur ein Feature, sondern das zentrale
              Verkaufsargument. Erstmals bringt Samsung zudem faltbare Smartphones unter 1.000 Euro auf den Markt.
              Tipp: Vorjahresmodelle wie das Galaxy S25 oder iPhone 17 werden nach dem Launch der Nachfolger
              deutlich günstiger — oft 30 bis 40 % unter dem Einführungspreis.
            </p>

            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
              Fernseher: RGB-Mini-LED und OLED ab 999 Euro
            </h3>
            <p>
              Die größte Neuheit der CES 2026 sind RGB-Mini-LED-Fernseher, die erstmals in den Verkauf kommen
              und besonders hohe Helligkeit bieten. OLED ist 2026 keine reine Premium-Technologie mehr:
              55-Zoll-OLED-Fernseher starten ab 999 Euro, 65-Zoll-Modelle mit 120 Hz und 4K liegen zwischen
              1.500 und 2.000 Euro. Für Gaming sollten Sie auf HDMI 2.1 und eine variable Bildwiederholrate (VRR) achten.
              Der Trend geht klar zu größeren Bildschirmen ab 65 Zoll — ideal für das Kino-Erlebnis zu Hause.
            </p>

            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
              Haushaltsgeräte: Neues EU-Energielabel beachten
            </h3>
            <p>
              Das neue EU-Energielabel (A bis G statt A+++ bis D) macht Effizienzvergleiche endlich transparent.
              Seit 2025 gilt es auch für Wäschetrockner, 2026 folgen Heizungen und Warmwasserbereiter.
              Bei Kühlgeräten wird der Verbrauch pro Jahr angegeben, bei Waschmaschinen pro 100 Waschgänge.
              Praktisch: Jedes Label enthält einen QR-Code zur EU-Datenbank EPREL mit offiziellen Verbrauchsdaten.
              Laut Finanztip spart eine Waschmaschine der Klasse A in fünf Jahren fast 200 Euro an Stromkosten.
              Moderne Geräte wie die AEG 7000 erkennen automatisch Textilart und Beladung und wählen
              selbstständig das passende Programm.
            </p>

            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
              Smart Home: Matter-Standard vereinfacht alles
            </h3>
            <p>
              2026 wird der Matter-Standard zum Gamechanger: Geräte verschiedener Hersteller — ob Philips Hue,
              Sonos oder Bosch — lassen sich endlich über eine zentrale Plattform steuern. Das bedeutet
              weniger Apps, weniger Kompatibilitätsprobleme und eine einfachere Einrichtung. Wer jetzt
              Smart-Home-Geräte kauft, sollte auf Matter-Kompatibilität achten.
            </p>

            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 pt-2">
              Beste Kaufzeitpunkte 2026
            </h3>
            <p>
              Der <strong className="text-gray-800 dark:text-gray-200">Black Friday 2026</strong> fällt auf den 27. November,
              der <strong className="text-gray-800 dark:text-gray-200">Cyber Monday</strong> auf den 30. November.
              Laut Analysen entstehen die besten Technik-Schnäppchen oft in den 72 Stunden vor dem Black Friday
              oder am Cyber Monday selbst — nicht am Freitag im Trubel. Durchschnittliche Rabatte liegen bei
              6 Prozent, einzelne Deals bei Kopfhörern, Gaming-Peripherie und Vorjahres-Smartphones
              erreichen 20 bis 30 Prozent. Im Januar-Ausverkauf und beim Saisonwechsel werden Haushaltsgeräte
              ebenfalls stark reduziert. Neue Smartphone-Modelle erscheinen meist im Frühjahr — dann sinken
              die Preise der Vorgänger erheblich.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
