import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';
import prisma from '../../prisma/index';

import { hash } from 'bcryptjs';

export const userRouter = router({
  // Schedule bulk users (admin only)
  scheduleBulkUsers: protectedProcedure
    .input(
      z.object({
        emails: z.array(z.string().email()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const normalizedUniqueEmails = Array.from(
        new Set(input.emails.map(e => e.trim().toLowerCase()))
      );

      const results = await prisma.$transaction(
        normalizedUniqueEmails.map(email =>
          prisma.user.upsert({
            where: { email },
            update: {
              status: 'scheduled' as const,
              // Ensure password stays empty for scheduled accounts
              password: null,
              role: 'user',
              updatedAt: new Date(),
            },
            create: {
              email,
              status: 'scheduled' as const,
              password: null,
              role: 'user',
            },
            select: { id: true, email: true },
          })
        )
      );

      return { count: results.length };
    }),
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        bio: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        bio: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          bio: input.bio,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          image: true,
          role: true,
        },
      });

      return user;
    }),

  // Get user by ID (for admin purposes)
  getUserById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.session.user.role !== 'admin') {
        throw new Error('Unauthorized');
      }

      const user = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          image: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    }),

  // Complete registration via token (public)
  completeRegistration: publicProcedure
    .input(
      z
        .object({
          token: z.string().min(10),
          uniqueId: z.string().min(3),
          username: z.string().min(3),
          fullName: z.string().min(3),
          dob: z.string(),
          phone: z.string().min(6),
          password: z.string().min(8),
          confirmPassword: z.string().min(8),
        })
        .refine(v => v.password === v.confirmPassword, {
          message: 'Password confirmation does not match',
          path: ['confirmPassword'],
        })
    )
    .mutation(async ({ input }) => {
      // Find verification record by token
      const verification = await prisma.verification.findFirst({
        where: {
          value: input.token,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verification) {
        throw new Error('Invalid or expired token');
      }

      const email = verification.identifier;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      const hashedPassword = await hash(input.password, 12);

      const updated = await prisma.user.update({
        where: { email },
        data: {
          uniqueId: input.uniqueId,
          username: input.username,
          fullName: input.fullName,
          phone: input.phone,
          dob: new Date(input.dob),
          password: hashedPassword,
          status: 'active' as const,
          updatedAt: new Date(),
        },
        select: { id: true, email: true },
      });

      // Remove token after successful completion
      await prisma.verification.delete({
        where: { id: verification.id },
      });

      return { userId: updated.id };
    }),
});
