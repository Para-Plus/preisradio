'use client';

import { useState } from 'react';

export default function ProductDescription({ data }: { data?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;

  return (
    <section aria-label="Produktbeschreibung" className="mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Produktbeschreibung</h2>
      <div className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed overflow-hidden ${expanded ? '' : 'line-clamp-5'}`}>
        {data}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
      >
        {expanded ? (
          <>Weniger anzeigen <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
        ) : (
          <>Mehr lesen <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
        )}
      </button>
    </section>
  );
}
