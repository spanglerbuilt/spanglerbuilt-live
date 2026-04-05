/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
  },
  webpack: function(config, { isServer }) {
    if (isServer) {
      // Prevent webpack from bundling Puppeteer/Chromium — loaded at runtime by API routes
      var externals = config.externals || []
      if (!Array.isArray(externals)) externals = [externals]
      config.externals = [...externals, 'puppeteer-core', 'puppeteer', '@sparticuz/chromium-min']
    }
    return config
  },
}
module.exports = nextConfig
