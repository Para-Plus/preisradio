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
  if (!data) return null;
  const specs = parseSpecs(data);
  return (
    <section aria-label="Technische Daten" className="mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Technische Daten</h2>
      {specs ? (
        <dl className="divide-y divide-gray-100 dark:divide-zinc-800">
          {specs.map(({ key, value }, i) => (
            <div key={i} className="flex gap-4 py-2 text-sm">
              <dt className="w-2/5 shrink-0 font-medium text-gray-500 dark:text-gray-400">{key}</dt>
              <dd className="text-gray-800 dark:text-gray-200">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{data}</p>
      )}
    </section>
  );
}
