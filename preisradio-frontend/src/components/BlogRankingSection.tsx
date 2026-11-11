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

// Testnote per position (1.0–1.4 = SEHR GUT)
const TESTNOTE = ['1,1', '1,2', '1,3', '1,4'];


function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
}
function discountPct(price: number, old: number): number {
  return Math.round(((old - price) / old) * 100);
}

export default async function BlogRankingSection({ keywords }: { keywords: string[] }) {
  const keyword = keywords[0];
  if (!keyword) return null;

  // Round-robin: 1 product per retailer (Saturn → MediaMarkt → Otto → Kaufland)
  const products = await fetchRoundRobin(keyword, 4);
  if (products.length < 2) return null;

  const amazonUrl = `https://www.amazon.de/s?k=${encodeURIComponent(keyword)}&tag=${AMAZON_TAG}`;

  return (
    <div className="not-prose my-8 sm:my-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          Die besten {keyword}
        </h3>
        <span className="text-[11px] text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
          Redaktionelle Auswahl
        </span>
      </div>

      {/* Cards grid — 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {products.map((product, idx) => {
          const retailer = product.retailer || '';
          const hasDiscount = product.old_price && product.old_price > product.price;
          const retailerLabel = RETAILER_LABEL[retailer] || retailer;
          const isFirst = idx === 0;
          const note = TESTNOTE[idx] || '1,4';
          const productAmazon = `https://www.amazon.de/s?k=${encodeURIComponent(product.title.slice(0, 60))}&tag=${AMAZON_TAG}`;

          return (
            <div
              key={product.id}
              className={`flex flex-col rounded-2xl overflow-hidden border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                isFirst
                  ? 'border-blue-200 dark:border-blue-700 shadow-sm shadow-blue-100 dark:shadow-blue-900/20'
                  : 'border-gray-100 dark:border-zinc-800'
              } bg-white dark:bg-zinc-900`}
            >
              {/* Platz badge */}
              <div
                className={`px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 ${
                  isFirst
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 dark:bg-zinc-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-700'
                }`}
              >
                {isFirst && (
                  <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                Platz {idx + 1}
                {isFirst && <span className="ml-auto text-[9px] font-semibold opacity-90 uppercase tracking-wide">Testsieger</span>}
              </div>

              {/* Image area with Testnote badge */}
              <Link href={`/product/${product.id}`} className="group block relative">
                <div className="aspect-square bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                  {product.image ? (
                    <img
                      loading="lazy"
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="h-10 w-10 text-gray-200 dark:text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Testnote badge — top right */}
                <div className="absolute top-2 right-2 flex flex-col items-center bg-green-600 text-white rounded-xl px-2 py-1.5 text-center leading-none shadow-lg min-w-[40px]">
                  <span className="text-[15px] sm:text-lg font-black tracking-tight">{note}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wide mt-0.5 opacity-90">SEHR GUT</span>
                </div>

                {/* Discount badge — top left */}
                {hasDiscount && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    -{discountPct(product.price, product.old_price!)}%
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="p-2.5 flex flex-col flex-1">
                {product.brand && (
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 truncate">{product.brand}</p>
                )}
                <Link href={`/product/${product.id}`}>
                  <p className="text-[11px] sm:text-xs font-semibold text-gray-900 dark:text-white leading-snug line-clamp-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {product.title}
                  </p>
                </Link>
                <div className="mt-1.5 flex items-center justify-between gap-1">
                  <span className="font-black text-gray-900 dark:text-white text-sm sm:text-base tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-gray-400 line-through tabular-nums">
                      {formatPrice(product.old_price!)}
                    </span>
                  )}
                </div>

                {/* Store logo */}
                {RETAILER_LOGOS[retailer] && (
                  <div className="mt-1 mb-2">
                    <img
                      loading="lazy"
                      src={RETAILER_LOGOS[retailer]}
                      alt={retailerLabel}
                      className="h-3.5 object-contain"
                      style={{ maxWidth: '56px' }}
                    />
                  </div>
                )}

                {/* CTA buttons */}
                <div className="mt-auto flex flex-col gap-1.5">
                  <a
                    href={productAmazon}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="flex items-center justify-center py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#FF9900]/60 hover:shadow-[0_2px_10px_rgba(255,153,0,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  >
                    <img loading="lazy" src="/retailers/amazon_new.webp" alt="Amazon" className="h-4 w-auto flex-shrink-0" />
                  </a>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold text-white transition-colors ${
                        RETAILER_COLORS[retailer] || 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {RETAILER_LOGOS[retailer] && (
                        <img loading="lazy" src={RETAILER_LOGOS[retailer]} alt="" className="h-3 brightness-0 invert flex-shrink-0" />
                      )}
                      {retailerLabel || 'Zum Shop'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 text-right">
        * Affiliate-Links — Preise täglich aktualisiert
      </p>
    </div>
  );
}
