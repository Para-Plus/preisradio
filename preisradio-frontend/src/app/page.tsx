import { Suspense } from 'react';
import { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import HomeContent from '@/components/HomeContent';
import HomeBrandShowcase from '@/components/HomeBrandShowcase';
import HomeCategoryBar from '@/components/HomeCategoryBar';
import { generateOrganizationSchema, generateFAQSchema } from '@/lib/schema';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export const revalidate = 86400; // 24h

export const metadata: Metadata = {
  description: 'Vergleichen Sie Elektronik-Preise von Saturn, MediaMarkt, Otto und Kaufland in Echtzeit. Finden Sie täglich die besten Angebote und sparen Sie beim Shopping.',
  alternates: {
    canonical: baseUrl,
    languages: {
      'de-DE': baseUrl,
      'x-default': baseUrl,
    },
  },
  other: {
    'verify-admitad': 'daf3c79d55',
  },
};

function HomeLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-40">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Seite wird geladen...
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const organizationSchema = generateOrganizationSchema(baseUrl);
  const faqSchema = generateFAQSchema(baseUrl);
  const faqEntries = (faqSchema as any).mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Organization JSON-LD - Only on homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <Navigation />

      {/* Category quick-access bar — idealo-style (SSR) */}
      <HomeCategoryBar />

      <main className="container mx-auto px-4 py-4">
        {/* H1 — signal SEO principal */}
        <h1 className="mb-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          Preisvergleich für Elektronik in Deutschland
        </h1>

        {/* Bandeau marques — style Geizhals showrooms (SSR, indexé Google) */}
        <HomeBrandShowcase />

        <Suspense fallback={<HomeLoadingFallback />}>
          <HomeContent />
        </Suspense>

        {/* Visible FAQ matching the FAQPage JSON-LD above — structured data must reflect on-page content */}
        <section className="mt-12 max-w-3xl">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Häufig gestellte Fragen</h2>
          <div className="space-y-4">
            {faqEntries.map((faq) => (
              <div key={faq.name}>
                <h3 className="font-semibold text-gray-900 dark:text-white">{faq.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
