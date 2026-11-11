import Link from 'next/link';
import { fetchRoundRobin } from '@/lib/blog-utils';

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'bestprice2109-21';

const RETAILER_LOGOS: Record<string, string> = {
  saturn: '/retailers/saturn.png',
  mediamarkt: '/retailers/mediamarkt.png',
  otto: '/retailers/otto.png',
  kaufland: '/retailers/kaufland.png',
};

const RETAILER_COLORS: Record<string, string> = {
  saturn: 'bg-blue-600 hover:bg-blue-700',
  mediamarkt: 'bg-red-600 hover:bg-red-700',
  otto: 'bg-rose-500 hover:bg-rose-600',
  kaufland: 'bg-red-700 hover:bg-red-800',
};

const RETAILER_LABEL: Record<string, string> = {
  saturn: 'Saturn',
  mediamarkt: 'MediaMarkt',
  otto: 'Otto',
  kaufland: 'Kaufland',
};



function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
}

function discountPercent(price: number, oldPrice: number): number {
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export default async function BlogProductSection({
  keywords,
}: {
  keywords: string[];
}) {
  const searchTerm = keywords[0];
  if (!searchTerm) return null;

  // Round-robin: 1 product per retailer (Saturn → MediaMarkt → Otto → Kaufland)
  const products = await fetchRoundRobin(searchTerm, 4);
  if (products.length === 0) return null;

  const topProducts = products;
  const amazonUrl = `https://www.amazon.de/s?k=${encodeURIComponent(searchTerm)}&tag=${AMAZON_TAG}`;

  return (
    <div className="mt-10 space-y-10 not-prose">

      {/* ── Comparison Table ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-blue-600 flex-shrink-0" />
            Preisvergleich: {searchTerm}
          </h2>
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{products.length} Angebote gefunden</span>
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block rounded-2xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-800/80 border-b border-gray-200 dark:border-zinc-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[40%]">
                  Produkt
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Preis
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Shop
                </th>
                {/* Tâche 2: two shop columns */}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide w-[200px]">
                  Zum Angebot
                </th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => {
                const isTop = idx === 0;
                const retailer = product.retailer || '';
                const hasDiscount = product.old_price && product.old_price > product.price;
                const retailerLabel = RETAILER_LABEL[retailer] || retailer;
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 dark:border-zinc-800 last:border-0 transition-colors ${
                      isTop
                        ? 'bg-blue-50/60 dark:bg-blue-950/20'
                        : 'hover:bg-gray-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Product */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {isTop && (
                          <span className="flex-shrink-0 text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none">
                            TOP
                          </span>
                        )}
                        {product.image && (
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                            <img loading="lazy" src={product.image} alt={product.title} className="w-full h-full object-contain p-1" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                            {product.title}
                          </p>
                          {product.brand && (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{product.brand}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 text-center">
                      <p className="font-bold text-gray-900 dark:text-white tabular-nums">
                        {formatPrice(product.price)}
                      </p>
                      {hasDiscount && (
                        <div className="flex items-center justify-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-gray-400 line-through tabular-nums">
                            {formatPrice(product.old_price!)}
                          </span>
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1 rounded">
                            -{discountPercent(product.price, product.old_price!)}%
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Retailer logo */}
                    <td className="px-4 py-3.5 text-center">
                      {RETAILER_LOGOS[retailer] ? (
                        <img loading="lazy" src={RETAILER_LOGOS[retailer]} alt={retailerLabel} className="h-5 mx-auto object-contain" />
                      ) : (
                        <span className="text-xs text-gray-500 capitalize">{retailer}</span>
                      )}
                    </td>

                    {/* Tâche 2: store name button + Amazon button */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1.5 items-end">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition-colors ${
                            RETAILER_COLORS[retailer] || 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          {RETAILER_LOGOS[retailer] && (
                            <img loading="lazy" src={RETAILER_LOGOS[retailer]} alt="" className="h-3 brightness-0 invert flex-shrink-0" />
                          )}
                          {retailerLabel}
                        </a>
                        <a
                          href={amazonUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow sponsored"
                          className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#FF9900]/60 hover:shadow-[0_2px_10px_rgba(255,153,0,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                        >
                          <img loading="lazy" src="/retailers/amazon_new.webp" alt="Amazon" className="h-3.5 w-auto flex-shrink-0" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/60 border-t border-gray-100 dark:border-zinc-700 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">Preise inkl. MwSt. — täglich aktualisiert</p>
            <Link href="/kategorien" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Alle Preise vergleichen →
            </Link>
          </div>
        </div>

        {/* Mobile stacked cards */}
        <div className="sm:hidden space-y-3">
          {topProducts.map((product, idx) => {
            const isTop = idx === 0;
            const retailer = product.retailer || '';
            const hasDiscount = product.old_price && product.old_price > product.price;
            const retailerLabel = RETAILER_LABEL[retailer] || retailer;
            return (
              <div
                key={product.id}
                className={`rounded-xl border p-3 ${
                  isTop
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-950/20'
                    : 'border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {product.image && (
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <img loading="lazy" src={product.image} alt={product.title} className="w-full h-full object-contain p-1.5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {isTop && (
                      <span className="inline-block text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded leading-none mb-1">
                        TOP
                      </span>
                    )}
                    <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                      {product.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{formatPrice(product.price)}</span>
                      {hasDiscount && (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-1 rounded">
                          -{discountPercent(product.price, product.old_price!)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Tâche 2: store + Amazon buttons on mobile */}
                <div className="mt-3 flex gap-2">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-white transition-colors ${
                      RETAILER_COLORS[retailer] || 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {RETAILER_LOGOS[retailer] && (
                      <img loading="lazy" src={RETAILER_LOGOS[retailer]} alt="" className="h-3.5 brightness-0 invert" />
                    )}
                    {retailerLabel}
                  </a>
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex-1 flex items-center justify-center py-2 rounded-lg bg-white border border-gray-200 hover:border-[#FF9900]/60 hover:shadow-[0_2px_10px_rgba(255,153,0,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  >
                    <img loading="lazy" src="/retailers/amazon_new.webp" alt="Amazon" className="h-4 w-auto" />
                  </a>
                </div>
              </div>
            );
          })}

          <Link href="/kategorien" className="block text-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline py-1">
            Alle Preise vergleichen →
          </Link>
        </div>
      </section>

    </div>
  );
}
