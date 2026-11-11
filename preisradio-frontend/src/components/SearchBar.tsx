'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Product } from '@/lib/types';

interface SearchBarProps {
  initialQuery?: string;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  initialQuery = '',
  autoFocus = false,
  placeholder = 'Produkt suchen (z.B. iPhone, Samsung TV, MacBook)...',
  className = ''
}: SearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-focus if specified
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load suggestions when query changes
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        const response = await api.getProductsFromBothRetailers({
          search: searchQuery,
          page_size: 8,
        });
        setSuggestions(response.results || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const product = suggestions[selectedIndex];
          router.push(`/product/${product.id}`);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 font-semibold">{part}</mark>
        : part
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 md:pl-6">
          <svg
            className="h-5 w-5 md:h-6 md:w-6 text-gray-400"
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
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full rounded-xl border-2 border-gray-200 bg-white pl-12 md:pl-16 pr-24 md:pr-28 py-3 md:py-4 text-sm md:text-base text-gray-900 placeholder-gray-500 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400 transition-all"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-20 md:right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute right-20 md:right-24 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Suchen
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border-2 border-gray-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="p-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Vorschläge
            </p>
            {suggestions.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                onClick={() => setShowSuggestions(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800'
                }`}
              >
                {/* Product Image */}
                {product.image && (
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                    <img
                      loading="lazy"
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {highlightMatch(product.title, searchQuery)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {product.category}
                    </span>
                    {product.brand && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {product.brand}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {product.price.toFixed(2)} €
                  </p>
                  {product.discount && (
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {product.discount} OFF
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* View All Results Link */}
          <div className="border-t border-gray-200 dark:border-zinc-800 p-3">
            <Link
              href={`/search?q=${encodeURIComponent(searchQuery)}`}
              onClick={() => setShowSuggestions(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
            >
              Alle Ergebnisse anzeigen für "{searchQuery}"
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && !isLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border-2 border-gray-200 bg-white p-6 text-center shadow-2xl dark:border-zinc-700 dark:bg-zinc-900">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-3 text-sm font-medium text-gray-900 dark:text-white">
            Keine Vorschläge gefunden
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Versuchen Sie eine andere Suchanfrage
          </p>
        </div>
      )}
    </div>
  );
}
