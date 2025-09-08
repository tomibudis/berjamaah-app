import { TRPCError } from '@trpc/server';
import z from 'zod';
import prisma from '../../prisma/index';
import { protectedProcedure, router } from '../lib/trpc';

export const donationRouter = router({
  getUserDonations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const donations = await prisma.donation.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              bannerImage: true,
            },
          },
          programPeriod: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              cycleNumber: true,
            },
          },
          donationProofs: {
            select: {
              id: true,
              imagePath: true,
              imageName: true,
              isPrimary: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return donations;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch user donations',
      });
    }
  }),

  getDonationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const donation = await prisma.donation.findFirst({
          where: {
            id: input.id,
            userId: ctx.session.user.id,
          },
          include: {
            program: {
              select: {
                id: true,
                title: true,
                description: true,
                category: true,
                bannerImage: true,
                targetAmount: true,
              },
            },
            programPeriod: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                cycleNumber: true,
                currentAmount: true,
              },
            },
            donationProofs: {
              select: {
                id: true,
                imagePath: true,
                imageName: true,
                fileSize: true,
                uploadedAt: true,
                isPrimary: true,
              },
            },
            verifiedByAdmin: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        if (!donation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Donation not found',
          });
        }

        return donation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch donation details',
        });
      }
    }),
});
