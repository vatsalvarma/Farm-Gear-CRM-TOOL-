import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const isGithubPages = process.env.GITHUB_PAGES === 'true'
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const baseConfig: NextConfig = {
  reactStrictMode: true,
  output: isGithubPages ? 'export' : 'standalone',
  basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'https', hostname: '*.minio.farmgearconnect.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  ...(!isGithubPages && {
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
      ]
    },
    async rewrites() {
      const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'
      return [
        // /backend/* → Spring Boot's /api/*
        // This prefix never conflicts with NextAuth's /api/auth/* routes.
        {
          source: '/backend/:path*',
          destination: `${BACKEND}/:path*`,
        },
      ]
    },
  }),
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})

export default isGithubPages ? baseConfig : pwaConfig(baseConfig)
