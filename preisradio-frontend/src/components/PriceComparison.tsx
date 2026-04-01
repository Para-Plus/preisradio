'use client';

import { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Image from 'next/image';
import { getRetailerInfo } from '@/lib/retailerUtils';

interface PriceComparisonProps {
  currentProduct: Product;
}

type SortKey = 'price' | 'total';

export default function PriceComparison({ currentProduct }: PriceComparisonProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('price');

  useEffect(() => {
    if (currentProduct.gtin) {
      loadPriceComparison();
    } else {
      setLoading(false);
    }
  }, [currentProduct.gtin]);

  const loadPriceComparison = async () => {
    if (!currentProduct.gtin) return;
    try {
      setLoading(true);
      const response = await api.getProductsByGtin(currentProduct.gtin);
      const uniqueRetailers = new Map<string, Product>();
      response.results.forEach((p: Product) => {
        const r = p.retailer || 'unknown';
        if (!uniqueRetailers.has(r) || uniqueRetailers.get(r)!.price > p.price) {
          uniqueRetailers.set(r, p);
        }
      });
      setProducts(Array.from(uniqueRetailers.values()));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length < 2) return null;

  const sorted = [...products].sort((a, b) => a.price - b.price);
  const lowestPrice = sorted[0].price;

  return (
    <div className="mb-8 rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Preisvergleich</h2>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-gray-500 dark:text-gray-400 mr-1">Sortieren nach:</span>
          <button
            onClick={() => setSort('price')}
            className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${sort === 'price' ? 'bg-white dark:bg-zinc-900 border-gray-800 dark:border-white text-gray-900 dark:text-white' : 'border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-gray-400 hover:border-gray-500'}`}
          >
            Preis
          </button>
          <button
            onClick={() => setSort('total')}
            className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${sort === 'total' ? 'bg-white dark:bg-zinc-900 border-gray-800 dark:border-white text-gray-900 dark:text-white' : 'border-gray-300 dark:border-zinc-600 text-gray-500 dark:text-gray-400 hover:border-gray-500'}`}
          >
            Gesamtpreis
          </button>
        </div>
      </div>

      {/* Column headers — hidden on mobile */}
      <div className="hidden md:grid grid-cols-[2fr_1.2fr_1fr_1.5fr_auto] gap-4 px-4 py-2 border-b border-gray-100 dark:border-zinc-800 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        <span>Angebotsbezeichnung</span>
        <span>Preis &amp; Versand</span>
        <span>Lieferung</span>
        <span>Shop</span>
        <span></span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-zinc-800">
        {sorted.map((product) => {
          const retailerInfo = getRetailerInfo(product.retailer);
          const isBest = product.price === lowestPrice;
          const hasDiscount = product.old_price && product.old_price > product.price;

          return (
            <div key={product.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_1fr_1.5fr_auto] gap-3 md:gap-4 items-center px-4 py-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">

              {/* Col 1 — Angebotsbezeichnung */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 line-clamp-2 leading-snug">
                  {product.title}
                </p>
              </div>

              {/* Col 2 — Preis & Versand */}
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {product.price.toFixed(2).replace('.', ',')} €
                  </span>
                </div>
                {hasDiscount && product.old_price && (
                  <span className="text-xs text-gray-400 line-through">{product.old_price.toFixed(2).replace('.', ',')} €</span>
                )}
                <div className="mt-1">
                  {isBest ? (
                    <span className="inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                      Günstigster Gesamtpreis
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">inkl. Versand</span>
                  )}
                </div>
              </div>

              {/* Col 3 — Lieferung */}
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 shrink-0"></span>
                  <span>Auf Lager</span>
                </div>
                <div className="text-gray-400 dark:text-gray-500">Kostenlose Rücksendung</div>
              </div>

              {/* Col 4 — Shop */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center rounded px-2 py-1.5 ${retailerInfo.color} min-w-[80px]`}>
                  {retailerInfo.logo ? (
                    <Image src={retailerInfo.logo} alt={retailerInfo.name} width={70} height={22} className="h-5 w-auto object-contain brightness-0 invert" />
                  ) : (
                    <span className="text-xs font-bold text-white">{retailerInfo.name}</span>
                  )}
                </div>
              </div>

              {/* Col 5 — CTA */}
              <div>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm"
                >
                  Zum Shop
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
