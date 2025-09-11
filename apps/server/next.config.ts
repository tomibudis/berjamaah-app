import type { NextConfig } from 'next';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['@prisma/client', 'prisma'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma binaries are copied to the correct location
      const prismaGeneratedPath = join(process.cwd(), 'prisma', 'generated');
      const binaryName = 'libquery_engine-rhel-openssl-3.0.x.so.node';
      const sourcePath = join(prismaGeneratedPath, binaryName);

      if (existsSync(sourcePath)) {
        const targetDir = join(process.cwd(), '.next', 'server', 'chunks');
        if (!existsSync(targetDir)) {
          mkdirSync(targetDir, { recursive: true });
        }
        const targetPath = join(targetDir, binaryName);

        try {
          copyFileSync(sourcePath, targetPath);
          console.log(`✅ Copied Prisma binary to: ${targetPath}`);
        } catch (error) {
          console.warn(`⚠️ Failed to copy Prisma binary:`, error);
        }
      }
    }

    return config;
  },
};

export default nextConfig;
