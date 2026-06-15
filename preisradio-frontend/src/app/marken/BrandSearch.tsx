'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BrandEntry {
  name: string;
  slug: string;
  count: number;
}

interface BrandSearchProps {
  brands: BrandEntry[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function BrandSearch({ brands }: BrandSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery
    ? brands.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands;

  // Group by first letter
  const grouped = new Map<string, BrandEntry[]>();
  filtered.forEach((brand) => {
    const firstChar = brand.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    if (!grouped.has(letter)) grouped.set(letter, []);
    grouped.get(letter)!.push(brand);
  });

  // Available letters for navigation
  const availableLetters = new Set(grouped.keys());

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="mx-auto max-w-xl">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Marke suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alphabet Navigation */}
      {!searchQuery && (
        <nav className="mb-8 flex flex-wrap gap-1 justify-center" aria-label="Alphabet-Navigation">
          {ALPHABET.map((letter) => {
            const hasEntries = availableLetters.has(letter);
            return hasEntries ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400 transition-colors"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-gray-300 dark:text-zinc-600"
              >
                {letter}
              </span>
            );
          })}
          {availableLetters.has('#') && (
            <a
              href="#letter-other"
              className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400 transition-colors"
            >
              #
            </a>
          )}
        </nav>
      )}

      {/* Brand Directory */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-900 p-12 text-center border border-gray-200 dark:border-zinc-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Keine Marken fuer &quot;{searchQuery}&quot; gefunden.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Alle Marken anzeigen
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()]
            .sort(([a], [b]) => {
              if (a === '#') return 1;
              if (b === '#') return -1;
              return a.localeCompare(b);
            })
            .map(([letter, letterBrands]) => (
              <section
                key={letter}
                id={letter === '#' ? 'letter-other' : `letter-${letter}`}
                className="scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">
                    {letter}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {letterBrands.length} {letterBrands.length === 1 ? 'Marke' : 'Marken'}
                  </span>
                  <div className="flex-1 border-t border-gray-200 dark:border-zinc-800" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
                  {letterBrands.map((brand) => (
                    <Link
                      key={brand.slug}
                      href={`/marken/${encodeURIComponent(brand.slug)}`}
                      className="group flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-zinc-800/60 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {brand.name}
                      </span>
                      <svg className="h-3.5 w-3.5 ml-2 shrink-0 text-gray-300 dark:text-zinc-600 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
