import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://preisradio.de';

  const commonAllow = [
    '/',
    '/*.js$',
    '/*.css$',
    '/*.xml$',
    '/sitemap.xml',
    '/favicon.ico',
  ];

  const commonDisallow = [
    '/api/',
    '/admin/',
    '/search*',
    '/*?*',
    '/_next/static/*/pages/_app*.js',
    '/_next/static/*/pages/_error*.js',
    '/*.json$',
    '/*.map$',
  ];

  return {
    rules: [
      // Standard search engines
      {
        userAgent: '*',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      // AI Search crawlers — generate citations in ChatGPT, Claude, Perplexity
      {
        userAgent: 'OAI-SearchBot',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: 'Claude-SearchBot',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: 'PerplexityBot',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: 'Perplexity-User',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: 'Google-Extended',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      {
        userAgent: 'Applebot-Extended',
        allow: commonAllow,
        disallow: commonDisallow,
      },
      // AI Training-only crawlers — block (no direct citation benefit)
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ClaudeBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Bytespider',
        disallow: ['/'],
      },
      {
        userAgent: 'meta-externalagent',
        disallow: ['/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
