import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    SERVICE_ACCOUNT_PRIVATE_KEY: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    // REMOVED: Grok AI environment variables
    // RESTORED: MegaETH testnet configuration
    MEGAETH_RPC_URL: process.env.MEGAETH_RPC_URL,
    MEGAETH_EXPLORER_URL: process.env.MEGAETH_EXPLORER_URL,
  },
  poweredByHeader: false,
};

export default nextConfig;
