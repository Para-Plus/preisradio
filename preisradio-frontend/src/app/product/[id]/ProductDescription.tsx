export default function ProductDescription({ data }: { data?: string }) {
  if (!data) return null;
  const paragraphs = data.split(/\n|•/).map(p => p.trim()).filter(Boolean);
  return (
    <section aria-label="Produktbeschreibung" className="mb-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Produktbeschreibung</h2>
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1.5">
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}
