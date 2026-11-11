import { fetchRoundRobin } from '@/lib/blog-utils';

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || 'bestprice2109-21';

const RETAILER_COLORS: Record<string, string> = {
  saturn: '#2563eb',
  mediamarkt: '#dc2626',
  otto: '#f43f5e',
  kaufland: '#b91c1c',
};

const RETAILER_LOGOS: Record<string, string> = {
  saturn: '/retailers/saturn.png',
  mediamarkt: '/retailers/mediamarkt.png',
  otto: '/retailers/otto.png',
  kaufland: '/retailers/kaufland.png',
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

export default async function BlogInlineProduct({ keywords }: { keywords: string[] }) {
  if (!keywords || keywords.length === 0) return null;

  const products = await fetchRoundRobin(keywords[0], 2);
  if (products.length === 0) return null;

  // Show top 2 products side by side (or 1 if only 1 result)
  const topProducts = products.slice(0, Math.min(2, products.length));
  const amazonUrl = `https://www.amazon.de/s?k=${encodeURIComponent(keywords[0])}&tag=${AMAZON_TAG}`;

  return (
    <div className="not-prose my-8 sm:my-10">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1 h-5 rounded-full bg-blue-600 flex-shrink-0" />
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Aktuelle Angebote: {keywords[0]}
        </h3>
      </div>

      {/* Product cards grid */}
      <div className={`grid gap-3 ${topProducts.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
        {topProducts.map((product, idx) => {
          const retailer = product.retailer || '';
          const hasDiscount = product.old_price && product.old_price > product.price;
          const discount = hasDiscount ? discountPercent(product.price, product.old_price!) : 0;
          const retailerColor = RETAILER_COLORS[retailer] || '#2563eb';
          const isTop = idx === 0;

          return (
            <div
              key={product.id}
              className="rounded-2xl border bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: isTop ? '#93c5fd' : '#e5e7eb' }}
            >
              {/* Top bar */}
              <div
                className="px-3 py-2 flex items-center justify-between"
                style={{ background: isTop ? '#eff6ff' : '#f9fafb' }}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-3.5 w-3.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: isTop ? '#2563eb' : '#6b7280' }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isTop ? '#1d4ed8' : '#6b7280' }}
                  >
                    {isTop ? 'Top-Angebot' : 'Weitere Option'}
                  </span>
                </div>
                {hasDiscount && discount > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Product body */}
              <div className="p-3 flex items-start gap-3">
                {/* Image */}
                {product.image && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl bg-gray-50 dark:bg-zinc-800 overflow-hidden border border-gray-100 dark:border-zinc-700">
                    <img
                      loading="lazy"
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {product.brand && (
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-0.5">{product.brand}</p>
                  )}
                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">
                    {product.title}
                  </p>

                  {/* Pros */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3 w-3 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Sofort lieferbar</span>
                    </div>
                    {hasDiscount ? (
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Rabatt ggü. UVP</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3 w-3 flex-shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Tagesaktuelle Preise</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-black text-gray-900 dark:text-white tabular-nums leading-tight">
                    {formatPrice(product.price)}
                  </p>
                  {hasDiscount && (
                    <p className="text-[11px] text-gray-400 line-through tabular-nums mt-0.5">
                      {formatPrice(product.old_price!)}
                    </p>
                  )}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="px-3 pb-3 flex gap-2">
                {/* Amazon */}
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow sponsored"
                  className="flex-1 flex items-center justify-center py-2 px-3 rounded-xl bg-white border border-gray-200 hover:border-[#FF9900]/60 hover:shadow-[0_2px_10px_rgba(255,153,0,0.18)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                >
                  <img loading="lazy" src="/retailers/amazon_new.webp" alt="Amazon" className="h-4 w-auto flex-shrink-0" />
                </a>

                {/* Store */}
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: retailerColor }}
                >
                  {RETAILER_LOGOS[retailer] && (
                    <img
                      loading="lazy"
                      src={RETAILER_LOGOS[retailer]}
                      alt=""
                      className="h-3.5 brightness-0 invert flex-shrink-0"
                    />
                  )}
                  {RETAILER_LABEL[retailer] || retailer || 'Shop'}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-1.5 text-[10px] text-gray-400 dark:text-gray-500 text-right">
        * Affiliate-Link — täglich aktualisierte Preise
      </p>
    </div>
  );
}
