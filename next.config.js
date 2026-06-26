/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  typescript: {
    // Skip type checking during build (prevents OOM)
    ignoreBuildErrors: true,
  },

  eslint: {
    // Skip linting during build (prevents OOM)
    ignoreDuringBuilds: true,
  },

  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },

  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;