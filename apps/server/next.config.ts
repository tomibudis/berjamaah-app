import type { NextConfig } from 'next';
import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin';

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['@prisma/client', 'better-auth'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins.push(new PrismaPlugin());
    }
    return config;
  },
};

export default nextConfig;
