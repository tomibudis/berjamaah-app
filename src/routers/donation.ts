import { TRPCError } from '@trpc/server';
import z from 'zod';
import prisma from '../../prisma/index';
import { protectedProcedure, publicProcedure, router } from '../lib/trpc';

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
          // removed donationProofs in favor of single image string
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return donations;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            // single image now stored on donation
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

  // Get available programs for donation
  getPrograms: publicProcedure
    .input(
      z.object({
        status: z
          .enum(['active', 'paused', 'ended'])
          .optional()
          .default('active'),
        category: z.string().optional(),
        limit: z.number().int().positive().optional().default(10),
        offset: z.number().int().min(0).optional().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const programs = await prisma.program.findMany({
          where: {
            status: input.status,
            ...(input.category && { category: input.category }),
          },
          include: {
            programPeriods: {
              where: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
              orderBy: { startDate: 'desc' },
              take: 1,
            },
            donations: {
              where: {
                status: { in: ['verified', 'confirmed'] },
              },
              select: {
                amount: true,
                userId: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          skip: input.offset,
        });

        // Transform data to match frontend expectations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformedPrograms = programs.map((program: any) => {
          const activePeriod = program.programPeriods[0];
          const totalDonations = program.donations.reduce(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (sum: number, donation: any) => sum + Number(donation.amount),
            0
          );
          const uniqueDonors = new Set(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            program.donations.map((d: any) => d.userId)
          ).size;
          const progress =
            Number(program.targetAmount) > 0
              ? Math.round(
                  (totalDonations / Number(program.targetAmount)) * 100
                )
              : 0;

          return {
            id: program.id,
            title: program.title,
            description: program.description,
            target: Number(program.targetAmount),
            collected: totalDonations,
            progress: Math.min(progress, 100),
            period: activePeriod
              ? `${activePeriod.startDate.toLocaleDateString('id-ID')} - ${activePeriod.endDate.toLocaleDateString('id-ID')}`
              : 'N/A',
            category: program.category || 'Umum',
            donorCount: uniqueDonors,
            startDate: activePeriod?.startDate.toISOString() || null,
            endDate:
              activePeriod?.endDate.toISOString() ||
              program.createdAt.toISOString(),
            status: program.status,
            bannerImage: program.bannerImage,
          };
        });

        return transformedPrograms;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch programs',
        });
      }
    }),

  // Create a new donation
  createDonation: protectedProcedure
    .input(
      z.object({
        programId: z.string(),
        amount: z.number().positive('Amount must be positive'),
        donorName: z.string().min(1, 'Donor name is required'),
        donorEmail: z.string().email('Valid email is required'),
        donorPhone: z.string().optional(),
        paymentMethod: z.enum(['bank_transfer', 'digital_wallet', 'qris']),
        bankAccountSender: z.string().optional(),
        bankAccountReceiver: z.string().optional(),
        transferDate: z.coerce.date().optional(),
        donationProofImage: z.string().url('Valid image URL is required'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify program exists and is active
        const program = await prisma.program.findFirst({
          where: {
            id: input.programId,
            status: 'active',
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found or not active',
          });
        }

        // Generate unique donation reference number
        const donationReferenceNumber = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create donation
        const donation = await prisma.donation.create({
          data: {
            userId: ctx.session.user.id,
            donorName: input.donorName,
            donorEmail: input.donorEmail,
            donorPhone: input.donorPhone,
            programId: input.programId,
            programPeriodId: null,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            bankAccountSender: input.bankAccountSender,
            bankAccountReceiver: input.bankAccountReceiver,
            donationReferenceNumber,
            status: 'pending_verification',
            donationProofImage: input.donationProofImage,
            ...(input.transferDate && { verifiedAt: input.transferDate }),
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
          },
        });

        return donation;
      } catch (error) {
        console.log('error', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create donation',
        });
      }
    }),

  // Removed uploadDonationProof in favor of passing image URL during creation

  // Get donation statistics for a program
  getProgramDonationStats: publicProcedure
    .input(z.object({ programId: z.string() }))
    .query(async ({ input }) => {
      try {
        const program = await prisma.program.findFirst({
          where: { id: input.programId },
          include: {
            donations: {
              where: {
                status: { in: ['verified', 'confirmed'] },
              },
              select: {
                amount: true,
                userId: true,
                createdAt: true,
              },
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found',
          });
        }

        const totalDonations = program.donations.reduce(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (sum: number, donation: any) => sum + Number(donation.amount),
          0
        );
        const uniqueDonors = new Set(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          program.donations.map((d: any) => d.userId)
        ).size;
        const progress =
          Number(program.targetAmount) > 0
            ? Math.round((totalDonations / Number(program.targetAmount)) * 100)
            : 0;

        return {
          totalDonations,
          uniqueDonors,
          progress: Math.min(progress, 100),
          targetAmount: Number(program.targetAmount),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch donation statistics',
        });
      }
    }),
});
