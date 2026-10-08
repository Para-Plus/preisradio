import Link from 'next/link';
import api from '@/lib/api';

// ── SVG Icons ────────────────────────────────────────────────────────────────

function IconDeals() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

function IconSmartphone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
}

function IconLaptop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M3 19h18M5 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
      <path d="M3 19l2-3h14l2 3" />
    </svg>
  );
}

function IconTV() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" />
    </svg>
  );
}

function IconHeadphones() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function IconGaming() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M2 6h20v12H2z" />
      <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
    </svg>
  );
}

function IconTablet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function IconWatch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <circle cx="12" cy="12" r="6" />
      <path d="M12 9v3l1.5 1.5M9 2h6M9 22h6M16.5 4.5l1-1M7.5 4.5l-1-1M16.5 19.5l1 1M7.5 19.5l-1 1" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSpeaker() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M11 5L6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function IconAppliance() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <rect x="3" y="2" width="18" height="20" rx="2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 8v1M12 15v1M8 12h1M15 12h1" />
    </svg>
  );
}

function IconPrinter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function IconNetwork() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="category-bar-icon">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
    </svg>
  );
}

// ── Icon mapping by keyword ──────────────────────────────────────────────────

type IconComponent = () => React.JSX.Element;

const ICON_KEYWORDS: [string[], IconComponent][] = [
  [['smartphone', 'handy', 'mobiltelefon', 'iphone', 'galaxy'], IconSmartphone],
  [['laptop', 'notebook', 'computer', 'pc', 'desktop'], IconLaptop],
  [['fernseher', 'tv', 'television', 'monitor', 'bildschirm'], IconTV],
  [['kopfhörer', 'kopfhoerer', 'headphone', 'earbuds', 'in-ear'], IconHeadphones],
  [['gaming', 'spielkonsol', 'playstation', 'xbox', 'nintendo', 'konsol'], IconGaming],
  [['tablet', 'ipad'], IconTablet],
  [['smartwatch', 'watch', 'uhr', 'fitness', 'tracker'], IconWatch],
  [['kamera', 'camera', 'foto', 'objektiv'], IconCamera],
  [['audio', 'lautsprecher', 'speaker', 'soundbar', 'sound'], IconSpeaker],
  [['waschmaschine', 'trockner', 'kühlschrank', 'kuehlschrank', 'haushalt', 'spülmaschine', 'geschirrspüler', 'staubsauger', 'backofen', 'herd', 'mikrowelle'], IconAppliance],
  [['drucker', 'printer', 'scanner'], IconPrinter],
  [['netzwerk', 'router', 'wlan', 'wifi', 'nas', 'switch'], IconNetwork],
];

function getIconForCategory(categoryName: string): IconComponent {
  const lower = categoryName.toLowerCase();
  for (const [keywords, Icon] of ICON_KEYWORDS) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return Icon;
    }
  }
  return IconBox; // fallback
}

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Fixed display order for the homepage bar (curated, not alphabetical).
const HOMEPAGE_CATEGORY_ORDER = [
  'Fernseher',
  'Kopfhörer',
  'Kühlschränke',
  'Backöfen',
  'Waschmaschinen',
  'Kaffeemaschinen',
  'Airfryer',
  'Heizung & Klima',
  'E-Bikes',
  'Staubsauger',
];

// ── Component (async server component) ───────────────────────────────────────

export default async function HomeCategoryBar() {
  let categories: string[] = [];

  try {
    const res = await api.getCategories({ page_size: 50 });
    categories = res.results || [];
  } catch {
    // Fallback: show nothing if API fails (Deals link still shows)
  }

  const availableCategories = new Set(categories);
  const visibleCategories = HOMEPAGE_CATEGORY_ORDER.filter((cat) => availableCategories.has(cat));

  return (
    <nav className="category-bar" aria-label="Kategorien">
      <div className="category-bar-scroll scrollbar-hide">
        {/* Deals — always first, hardcoded */}
        <Link href="/search?sort=discount" className="category-bar-item">
          <IconDeals />
          <span className="category-bar-label">Deals</span>
        </Link>

        {/* Dynamic categories from API */}
        {visibleCategories.map((cat) => {
          const Icon = getIconForCategory(cat);
          const slug = toSlug(cat);
          return (
            <Link
              key={cat}
              href={`/kategorien/${slug}`}
              className="category-bar-item"
            >
              <Icon />
              <span className="category-bar-label">{cat}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
