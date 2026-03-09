/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,

  // 🚀 Performance Optimizations
  experimental: {
    // Optimize package imports (tree-shaking)
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'date-fns'],
    // Externalize server-only packages to avoid webpack bundling issues
    serverComponentsExternalPackages: ['puppeteer', 'handlebars'],
  },

  // 🖼️ Image Optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.githubusercontent.com' },
    ],
    // Use modern formats
    formats: ['image/avif', 'image/webp'],
    // Minimize image sizes
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ⚡ Compiler Optimizations (SWC)
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 📦 Bundle Optimizations
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{ kebabCase member }}',
    },
  },

  // 🔧 Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // 🔧 Webpack Externals (don't bundle server-only packages)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('puppeteer', 'puppeteer-core');
    }
    return config;
  },
}

module.exports = nextConfig

