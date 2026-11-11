import Link from 'next/link';
import { fetchRoundRobin, fetchBrandRoundRobin } from '@/lib/blog-utils';

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
function discountPct(price: number, old: number): number {
  return Math.round(((old - price) / old) * 100);
}

export default async function BlogSimilarProducts({ keywords }: { keywords: string[] }) {
  const keyword = keywords[0];
  if (!keyword) return null;

  // Get first product to find the brand (round-robin fetch)
  const topProducts = await fetchRoundRobin(keyword, 4);
  const top = topProducts[0];
  if (!top?.brand) return null;

  const brand = top.brand;
  // Similar = same brand, round-robin across retailers, exclude already shown products
  const similar = await fetchBrandRoundRobin(brand, topProducts.map((p) => p.id), 4);
  if (similar.length === 0) return null;

  return (
    <section className="not-prose mt-10">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          Weitere {brand}-Produkte
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 ml-3 mt-0.5">
          Andere Modelle und Alternativen von {brand}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {similar.map((product) => {
          const retailer = product.retailer || '';
          const amazonUrl = `https://www.amazon.de/s?k=${encodeURIComponent(product.title.slice(0, 60))}&tag=${AMAZON_TAG}`;
          return (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link href={`/product/${product.id}`} className="group block">
                <div className="aspect-square bg-gray-50 dark:bg-zinc-800 relative overflow-hidden">
                  {product.image ? (
                    <img
                      loading="lazy"
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-zinc-700">
                      <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {product.old_price && product.old_price > product.price && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                      -{discountPct(product.price, product.old_price)}%
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-2.5 flex flex-col flex-1">
                <Link href={`/product/${product.id}`}>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {product.title}
                  </p>
                </Link>
                <div className="mt-2 flex items-end justify-between gap-1">
                  <span className="font-bold text-gray-900 dark:text-white text-sm tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  {RETAILER_LOGOS[retailer] && (
                    <img
                      loading="lazy"
                      src={RETAILER_LOGOS[retailer]}
                      alt={RETAILER_LABEL[retailer] || retailer}
                      className="h-3.5 object-contain flex-shrink-0"
                      style={{ maxWidth: '52px' }}
                    />
                  )}
                </div>
                <div className="mt-2 flex gap-1">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-[10px] font-bold text-white transition-colors ${
                      RETAILER_COLORS[retailer] || 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {RETAILER_LABEL[retailer] || retailer || 'Shop'}
                  </a>
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex-1 flex items-center justify-center py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#FF9900]/60 hover:shadow-[0_2px_10px_rgba(255,153,0,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  >
                    <img loading="lazy" src="/retailers/amazon_new.webp" alt="Amazon" className="h-3.5 w-auto" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <Link
          href="/kategorien"
          className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          Mehr {brand} Produkte entdecken →
        </Link>
      </div>
    </section>
  );
}
