import { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getPublishedArticles, BLOG_CATEGORIES } from '@/lib/blog-db';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 3600; // 1h ISR

export const metadata: Metadata = {
  title: 'Blog — Ratgeber, Kaufberatung & Spartipps',
  description: 'Kaufberatung, Spartipps und Technik-News: Der Preisradio Blog hilft dir, die besten Deals zu finden und smarter einzukaufen.',
  openGraph: {
    title: 'Blog — Ratgeber, Kaufberatung & Spartipps',
    description: 'Kaufberatung, Spartipps und Technik-News: Der Preisradio Blog hilft dir, die besten Deals zu finden und smarter einzukaufen.',
    url: `${baseUrl}/blog`,
    type: 'website',
    locale: 'de_DE',
    siteName: 'Preisradio',
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPage() {
  const allArticles = await getPublishedArticles();

  if (allArticles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Navigation />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog</h1>
          <p className="text-gray-500 dark:text-gray-400">Bald erscheinen hier spannende Artikel.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const [hero, ...rest] = allArticles;
  const gridArticles = rest.slice(0, 4);
  const remaining = rest.slice(4);
  const categories = Object.keys(BLOG_CATEGORIES);

  const meistgelesen = [...allArticles]
    .sort((a, b) => a.readTime - b.readTime)
    .slice(0, 5);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${baseUrl}/blog` },
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
        {/* Header + Category Pills */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Ratgeber & News
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Kaufberatung, Spartipps und Technik-Trends — damit du immer den besten Deal findest.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-gray-900 cursor-default">
              Alle
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-default ${BLOG_CATEGORIES[cat]}`}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Hero Article */}
        <Link
          href={`/blog/${hero.slug}`}
          className="group block mb-8 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800"
        >
          <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
            <img
              fetchPriority="high"
              src={hero.image}
              alt={hero.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-10">
              <span className={`inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium ${hero.categoryColor}`}>
                {hero.category}
              </span>
              <h2 className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-3xl font-bold text-white leading-snug max-w-3xl">
                {hero.title}
              </h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl line-clamp-2">
                {hero.excerpt}
              </p>
              <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-400">
                <time dateTime={hero.date}>{formatDate(hero.date)}</time>
                <span className="w-1 h-1 rounded-full bg-gray-500" />
                <span>{hero.readTime} Min. Lesezeit</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Main content: Grid + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid gap-5 sm:grid-cols-2">
              {gridArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-zinc-800 hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      loading="lazy"
                      src={article.image}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${article.categoryColor}`}>
                      {article.category}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 p-3 sm:p-4">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h2>
                    <p className="mt-1 sm:mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="mt-2 sm:mt-3 flex items-center justify-between text-[11px] sm:text-xs text-gray-400 dark:text-gray-500">
                      <time dateTime={article.date}>{formatDate(article.date)}</time>
                      <span>{article.readTime} Min.</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Newsletter CTA */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-4 sm:p-6 md:p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Die besten Deals direkt ins Postfach</h3>
                  <p className="mt-1 text-xs sm:text-sm text-blue-100">
                    Kaufberatung, Spartipps und exklusive Angebote — kostenlos und jederzeit kündbar.
                  </p>
                </div>
                <form className="flex gap-2 w-full md:w-auto">
                  <input
                    type="email"
                    placeholder="E-Mail-Adresse"
                    className="flex-1 md:w-56 rounded-lg border-0 bg-white/20 px-4 py-2.5 text-sm text-white placeholder-blue-200 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    Abonnieren
                  </button>
                </form>
              </div>
            </div>

            {/* Remaining articles */}
            {remaining.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Weitere Artikel</h2>
                {remaining.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="group flex gap-4 rounded-xl bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-zinc-800"
                  >
                    <div className="relative w-24 sm:w-32 flex-shrink-0 rounded-lg overflow-hidden aspect-video">
                      <img
                        loading="lazy"
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-medium ${article.categoryColor}`}>
                        {article.category}
                      </span>
                      <h3 className="mt-1 text-sm font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {article.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                        <time dateTime={article.date}>{formatDate(article.date)}</time>
                        <span>{article.readTime} Min.</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-5 shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                Meistgelesen
              </h3>
              <ol className="space-y-4">
                {meistgelesen.map((article, idx) => (
                  <li key={article.slug}>
                    <Link href={`/blog/${article.slug}`} className="group flex gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/40 dark:group-hover:text-blue-400 transition-colors">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <span className="text-xs text-gray-400">{article.readTime} Min.</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-5 shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                Themen
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const count = allArticles.filter((a) => a.category === cat).length;
                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 dark:border-zinc-800 last:border-0"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white dark:bg-zinc-900 p-5 shadow-sm border border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
                Preisvergleich
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/kategorien/smartphones" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Smartphones vergleichen
                  </Link>
                </li>
                <li>
                  <Link href="/kategorien/laptops" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Laptops vergleichen
                  </Link>
                </li>
                <li>
                  <Link href="/kategorien/fernseher" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    Fernseher vergleichen
                  </Link>
                </li>
                <li>
                  <Link href="/kategorien" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                    Alle Kategorien &rarr;
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
