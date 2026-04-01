'use client';

import { useState } from 'react';

const LIMIT = 8;

function parseSpecs(text: string): { key: string; value: string }[] | null {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('['));
  const pairs = lines.flatMap(l => {
    const idx = l.indexOf(': ');
    if (idx > 1 && idx < 60) return [{ key: l.substring(0, idx), value: l.substring(idx + 2) }];
    return [];
  });
  return pairs.length >= 3 ? pairs : null;
}

export default function ProductSpecs({ data }: { data?: string }) {
  const [expanded, setExpanded] = useState(false);
  if (!data) return null;

  const specs = parseSpecs(data);

  return (
    <section aria-label="Technische Daten" className="mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Technische Daten</h2>
      {specs ? (
        <>
          <dl className="divide-y divide-gray-100 dark:divide-zinc-800">
            {(expanded ? specs : specs.slice(0, LIMIT)).map(({ key, value }, i) => (
              <div key={i} className="flex gap-4 py-2 text-sm">
                <dt className="w-2/5 shrink-0 font-medium text-gray-500 dark:text-gray-400">{key}</dt>
                <dd className="text-gray-800 dark:text-gray-200">{value}</dd>
              </div>
            ))}
          </dl>
          {specs.length > LIMIT && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {expanded ? (
                <>Weniger anzeigen <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
              ) : (
                <>Alle {specs.length} Daten anzeigen <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
              )}
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{data}</p>
      )}
    </section>
  );
}
