import type { NextConfig } from "next";

// ImageKit migration: Cloudinary removed, images served via ik.imagekit.io
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/sitemap/:slug.xml',
        headers: [
          {
            key: 'Vercel-CDN-Cache-Control',
            value: 's-maxage=86400, stale-while-revalidate=43200'
          }
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
              "style-src 'self' 'unsafe-inline' https: http:",
              "img-src 'self' data: https: http:",
              "font-src 'self' data: https: http:",
              "connect-src 'self' https: http: wss://mc.yandex.ru",
              "frame-src 'self' https: http:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
