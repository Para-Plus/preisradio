import Link from 'next/link';
import AdSenseDisplay from '@/components/AdSenseDisplay';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Über Preisradio',
      links: [
        { href: '/', label: 'Startseite' },
        { href: '/blog', label: 'Blog' },
        { href: '/impressum', label: 'Impressum' },
        { href: '/datenschutz', label: 'Datenschutz' },
        { href: '/kontakt', label: 'Kontakt' },
      ],
    },
    {
      title: 'Kategorien',
      links: [
        { href: '/kategorien/smartphones', label: 'Smartphones' },
        { href: '/kategorien/laptops', label: 'Laptops' },
        { href: '/kategorien/fernseher', label: 'Fernseher' },
        { href: '/kategorien/spielkonsolen', label: 'Gaming' },
        { href: '/kategorien', label: 'Alle Kategorien' },
      ],
    },
    {
      title: 'Marken',
      links: [
        { href: '/marken', label: 'Alle Marken' },
        { href: '/marken/samsung', label: 'Samsung' },
        { href: '/marken/apple', label: 'Apple' },
        { href: '/marken/sony', label: 'Sony' },
      ],
    },
    {
      title: 'Händler',
      links: [
        { href: '/haendler', label: 'Alle Händler' },
        { href: '/search?retailer=saturn', label: 'Saturn' },
        { href: '/search?retailer=mediamarkt', label: 'MediaMarkt' },
        { href: '/search?retailer=otto', label: 'Otto' },
        { href: '/search?retailer=kaufland', label: 'Kaufland' },
      ],
    },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-transparent text-xl font-bold text-white shadow-none overflow-hidden">
                <img
                  loading="lazy"
                  src="/favicon.ico"
                  alt="Preisradio Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Preisradio
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Preisvergleich
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ihr deutscher Preisvergleich für Elektronik, Haushaltsgeräte und mehr.
              Vergleichen Sie Preise von Top-Händlern und sparen Sie Geld!
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="https://www.linkedin.com/company/preisradio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="Preisradio auf LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a
                href="https://www.youtube.com/@PreisRadio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                aria-label="Preisradio auf YouTube"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </a>
              <a
                href="https://www.crunchbase.com/organization/preisradio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="Preisradio auf Crunchbase"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.6 0H2.4A2.4 2.4 0 000 2.4v19.2A2.4 2.4 0 002.4 24h19.2a2.4 2.4 0 002.4-2.4V2.4A2.4 2.4 0 0021.6 0zM7.045 14.465c.26.39.67.63 1.115.66a1.472 1.472 0 001.21-.48l1.36 1.015a3.24 3.24 0 01-2.57 1.2 3.226 3.226 0 01-2.745-1.59 3.737 3.737 0 010-3.63 3.226 3.226 0 012.745-1.59 3.24 3.24 0 012.57 1.2L9.37 12.265a1.472 1.472 0 00-1.21-.48 1.395 1.395 0 00-1.115.66 2.013 2.013 0 000 2.02zm9.21 1.86a3.226 3.226 0 01-2.745-1.59 3.737 3.737 0 010-3.63 3.226 3.226 0 012.745-1.59 3.194 3.194 0 012.205.87V7.2h1.77v9.6h-1.77v-.645a3.194 3.194 0 01-2.205.87zm.39-5.085a1.395 1.395 0 00-1.115.66 2.013 2.013 0 000 2.02c.26.39.67.63 1.115.66a1.395 1.395 0 001.115-.66 2.013 2.013 0 000-2.02 1.395 1.395 0 00-1.115-.66z"/>
                </svg>
                Crunchbase
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* AdSense Display Ad - Before Footer */}
        <div className="mt-12 mb-8">
          <AdSenseDisplay adSlot="6054157785" />
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bleiben Sie auf dem Laufenden
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Erhalten Sie die besten Deals direkt in Ihr Postfach
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2 md:w-auto">
              <input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Abonnieren
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 pt-8 dark:border-zinc-800">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} Preisradio. Alle Rechte vorbehalten.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/impressum"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Impressum
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/datenschutz"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Datenschutz
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/kontakt"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              >
                Kontakt
              </Link>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Entwickelt mit Django REST Framework & Next.js
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
