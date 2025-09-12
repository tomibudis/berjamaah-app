import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import prisma from '../../prisma/index';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || '',
    process.env.BETTER_AUTH_URL || '',
  ],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      // Add domain and path for better Vercel compatibility
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
      path: '/',
    },
    // Add logging for debugging
    logLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info',
  },
  // Add baseURL for better Vercel compatibility
  baseURL: process.env.BETTER_AUTH_URL || process.env.CORS_ORIGIN,
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
});
