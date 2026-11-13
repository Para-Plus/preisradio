import { MetadataRoute } from 'next';

// Rendered per request so the weekday rule for SEO-tool crawlers stays current.
export const dynamic = 'force-dynamic';

// SEO-tool crawlers made up ~14% of all Worker requests, so they may only crawl on Sundays (UTC).
const SEO_TOOL_CRAWLERS = ['AhrefsBot', 'SemrushBot'];

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://preisradio.de';
  const seoToolsAllowedToday = new Date().getUTCDay() === 0;

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
      {
        userAgent: SEO_TOOL_CRAWLERS,
        ...(seoToolsAllowedToday
          ? { allow: commonAllow, disallow: commonDisallow }
          : { disallow: ['/'] }),
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap/blog.xml`,
    ],
  };
}
