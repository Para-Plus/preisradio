'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  old_price?: number;
  retailer: string;
  image?: string;
  link: string;
  brand?: string;
  category?: string;
}

interface AISearchProps {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = [
  'Samsung TV 55 Zoll unter 500€',
  'Laptop für Studenten unter 600€',
  'Noise Cancelling Kopfhörer',
  'iPhone günstigster Preis',
];

export default function AISearch({ open, onClose }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setText('');
      setProducts([]);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setLoading(true);
    setText('');
    setProducts([]);

    try {
      const res = await fetch('/api/ai-search/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();
      setText(data.text || '');
      setProducts(data.products || []);
    } catch {
      setText('Fehler beim Laden. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-zinc-800">
          <span className="text-lg">✨</span>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">KI-Preissuche</span>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Input */}
        <div className="px-4 py-3">
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="z.B. bester TV unter 400€, Laptop für Studenten..."
                className="flex-1 rounded-xl border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  'Suchen'
                )}
              </button>
            </div>
          </form>

          {/* Suggestions (only when no results) */}
          {!text && !loading && (
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="rounded-full border border-gray-200 dark:border-zinc-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <svg className="h-4 w-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Preise werden verglichen...
            </div>
          </div>
        )}

        {/* AI Answer */}
        {text && !loading && (
          <div className="px-4 pb-3">
            <div className="flex gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex-shrink-0">🤖</span>
              <p>{text}</p>
            </div>
          </div>
        )}

        {/* Product Cards */}
        {products.length > 0 && !loading && (
          <div className="px-4 pb-4">
            <p className="mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
              {products.length} Produkte gefunden
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {products.map((p, i) => (
                <Link
                  key={i}
                  href={p.link}
                  onClick={onClose}
                  className="flex flex-col rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-2.5 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  {p.image && (
                    <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-gray-50 dark:bg-zinc-700">
                      <Image
                        src={p.image}
                        alt={p.title}
                        width={120}
                        height={120}
                        className="h-full w-full object-contain p-1"
                        unoptimized
                      />
                    </div>
                  )}
                  <p className="line-clamp-2 text-[11px] font-medium text-gray-800 dark:text-gray-200 leading-snug mb-1">
                    {p.title}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {p.price?.toFixed(2)}€
                    </span>
                    <span className="text-[9px] text-gray-400 truncate ml-1">{p.retailer}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
