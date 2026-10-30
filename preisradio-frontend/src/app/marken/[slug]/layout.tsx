import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://preisradio.de';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.toLowerCase();
  const brandName = decodeURIComponent(slug)
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: `${brandName} Produkte`,
    description: `Alle ${brandName} Produkte im Preisvergleich. Finden Sie die besten Angebote für ${brandName} bei Saturn, MediaMarkt und Otto.`,
    alternates: {
      canonical: `${baseUrl}/marken/${slug}`,
      languages: {
        'de-DE': `${baseUrl}/marken/${slug}`,
        'x-default': `${baseUrl}/marken/${slug}`,
      },
    },
    openGraph: {
      title: `${brandName} Produkte | Preisradio`,
      description: `Finden Sie alle ${brandName} Produkte im Preisvergleich bei Saturn, MediaMarkt und Otto.`,
      url: `${baseUrl}/marken/${slug}`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}/favicon.ico`,
          width: 512,
          height: 512,
          alt: `${brandName} Produkte bei Preisradio`,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: `${brandName} Produkte | Preisradio`,
      description: `Finden Sie alle ${brandName} Produkte im Preisvergleich.`,
      images: [`${baseUrl}/favicon.ico`],
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
