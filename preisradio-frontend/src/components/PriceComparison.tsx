'use client';

import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Image from 'next/image';
import { getRetailerInfo } from '@/lib/retailerUtils';

interface PriceComparisonProps {
  currentProduct: Product;
}

type SortKey = 'price';

// Static retailer data: payment methods + delivery
const RETAILER_DATA: Record<string, {
  payment: string[];
  delivery: string;
  returns: string;
}> = {
  saturn: {
    payment: ['PayPal', 'VISA', 'MC', 'AMEX', 'Klarna', 'Rechnung', 'Ratenkauf'],
    delivery: '1–2 Werktage · ab 59 € kostenlos',
    returns: '14 Tage kostenlos',
  },
  mediamarkt: {
    payment: ['PayPal', 'VISA', 'MC', 'AMEX', 'Klarna', 'Rechnung', 'Ratenkauf'],
    delivery: '1–2 Werktage · ab 59 € kostenlos',
    returns: '30 Tage kostenlos',
  },
  otto: {
    payment: ['PayPal', 'VISA', 'MC', 'AMEX', 'Rechnung', 'Ratenkauf', 'Lastschrift'],
    delivery: '1–2 Werktage · ab 59,95 € kostenlos',
    returns: '30 Tage kostenlos',
  },
  kaufland: {
    payment: ['PayPal', 'VISA', 'MC', 'AMEX', 'Klarna', 'Rechnung', 'Ratenkauf'],
    delivery: '2–4 Werktage · ab ~29 € kostenlos',
    returns: '14 Tage (ab 40 € kostenlos)',
  },
};

const PAYMENT_COLORS: Record<string, string> = {
  PayPal: 'bg-[#003087] text-white',
  VISA: 'bg-[#1a1f71] text-white',
  MC: 'bg-[#eb001b] text-white',
  AMEX: 'bg-[#2E77BC] text-white',
  Klarna: 'bg-[#FFB3C7] text-[#1a1a1a]',
  Rechnung: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-300',
  Ratenkauf: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-300',
  Lastschrift: 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-gray-300',
};

export default function PriceComparison({ currentProduct }: PriceComparisonProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentProduct.gtin) loadPriceComparison();
    else setLoading(false);
  }, [currentProduct.gtin]);

  const loadPriceComparison = async () => {
    if (!currentProduct.gtin) return;
    try {
      setLoading(true);
      const response = await api.getProductsByGtin(currentProduct.gtin);
      const uniqueRetailers = new Map<string, Product>();
      response.results.forEach((p: Product) => {
        const r = p.retailer || 'unknown';
        if (!uniqueRetailers.has(r) || uniqueRetailers.get(r)!.price > p.price)
          uniqueRetailers.set(r, p);
      });
      setProducts(Array.from(uniqueRetailers.values()));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  if (loading || products.length < 2) return null;

  const sorted = [...products].sort((a, b) => a.price - b.price);
  const lowestPrice = sorted[0].price;

  return (
    <div className="mb-8 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Preisvergleich</h2>
        <span className="text-xs text-gray-400 dark:text-gray-500">{sorted.length} Angebote · sortiert nach Preis</span>
      </div>

      {/* Column headers — desktop only */}
      <div className="hidden lg:grid grid-cols-[2fr_1.4fr_2fr_1.6fr_auto] gap-4 px-4 py-2 border-b border-gray-100 dark:border-zinc-800 text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <span>Angebotsbezeichnung</span>
        <span>Preis &amp; Versand</span>
        <span>Zahlungsarten</span>
        <span>Lieferung</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
        {sorted.map((product) => {
          const retailerInfo = getRetailerInfo(product.retailer);
          const isBest = product.price === lowestPrice;
          const hasDiscount = product.old_price && product.old_price > product.price;
          const rData = RETAILER_DATA[product.retailer || ''] ?? RETAILER_DATA['saturn'];

          return (
            <div key={product.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${isBest ? 'bg-orange-50/40 dark:bg-orange-900/10' : ''}`}>

              {/* ── DESKTOP layout ── */}
              <div className="hidden lg:grid grid-cols-[2fr_1.4fr_2fr_1.6fr_auto] gap-4 items-center px-4 py-4">

                {/* Col 1 — Store + title */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`flex items-center gap-1.5 shrink-0 rounded px-2 py-1.5 ${retailerInfo.color}`}>
                    {retailerInfo.logo && (
                      <Image src={retailerInfo.logo} alt={retailerInfo.name} width={60} height={20} className="h-4 w-auto object-contain brightness-0 invert" />
                    )}
                    <span className="text-xs font-semibold text-white">{retailerInfo.name}</span>
                  </div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 line-clamp-2 leading-snug pt-0.5">
                    {product.title}
                  </p>
                </div>

                {/* Col 2 — Preis */}
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.price.toFixed(2).replace('.', ',')} €
                  </div>
                  {hasDiscount && product.old_price && (
                    <div className="text-xs text-gray-400 line-through">{product.old_price.toFixed(2).replace('.', ',')} €</div>
                  )}
                  {isBest ? (
                    <span className="inline-block mt-1 rounded px-1.5 py-0.5 text-[11px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                      Günstigster Preis
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">inkl. Versand</span>
                  )}
                </div>

                {/* Col 3 — Zahlungsarten */}
                <div className="flex flex-wrap gap-1">
                  {rData.payment.map(p => (
                    <span key={p} className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${PAYMENT_COLORS[p] ?? 'bg-gray-100 text-gray-700'}`}>
                      {p}
                    </span>
                  ))}
                </div>

                {/* Col 4 — Lieferung */}
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500 shrink-0"></span>
                    <span>{rData.delivery}</span>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500">Rückgabe: {rData.returns}</div>
                </div>

                {/* Col 5 — CTA */}
                <a href={product.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm">
                  Zum Shop
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* ── MOBILE layout — single line ── */}
              <div className="flex lg:hidden items-center gap-3 px-4 py-3">
                {/* Store badge */}
                <div className={`flex items-center gap-1 shrink-0 rounded px-2 py-1 ${retailerInfo.color}`}>
                  {retailerInfo.logo && (
                    <Image src={retailerInfo.logo} alt={retailerInfo.name} width={50} height={16} className="h-3.5 w-auto object-contain brightness-0 invert" />
                  )}
                  <span className="text-[11px] font-semibold text-white">{retailerInfo.name}</span>
                </div>

                {/* Price */}
                <div className="flex-1 min-w-0">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {product.price.toFixed(2).replace('.', ',')} €
                  </span>
                  {isBest && (
                    <span className="ml-1.5 inline-block rounded px-1 py-0.5 text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                      Bester Preis
                    </span>
                  )}
                </div>

                {/* CTA */}
                <a href={product.url} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">
                  Zum Shop
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
