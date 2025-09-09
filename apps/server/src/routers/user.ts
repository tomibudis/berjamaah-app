import { z } from 'zod';
import { protectedProcedure, router } from '../lib/trpc';
import prisma from '../../prisma/index';

export const userRouter = router({
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
});
