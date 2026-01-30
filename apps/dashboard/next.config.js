/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@narrify/shared', '@narrify/sdk'],
  images: {
    domains: [],
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
};

module.exports = nextConfig;
