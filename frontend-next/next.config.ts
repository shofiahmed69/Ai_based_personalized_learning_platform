import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // In dev, proxy API to Express backend when NEXT_PUBLIC_API_URL is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) return [];
    return [
      { source: '/api/:path*', destination: 'http://localhost:3000/api/:path*' },
      { source: '/health', destination: 'http://localhost:3000/health' },
    ];
  },
};

export default nextConfig;
