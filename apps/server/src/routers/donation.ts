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
          donationProofs: {
            select: {
              id: true,
              imagePath: true,
              imageName: true,
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
        const transformedPrograms = programs.map((program: any) => {
          const activePeriod = program.programPeriods[0];
          const totalDonations = program.donations.reduce(
            (sum, donation) => sum + Number(donation.amount),
            0
          );
          const uniqueDonors = new Set(program.donations.map(d => d.userId))
            .size;
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
            endDate:
              activePeriod?.endDate.toISOString() ||
              program.createdAt.toISOString(),
            status: program.status,
            bannerImage: program.bannerImage,
          };
        });

        return transformedPrograms;
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
          include: {
            programPeriods: {
              where: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
              orderBy: { startDate: 'desc' },
              take: 1,
            },
          },
        });

        if (!program) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Program not found or not active',
          });
        }

        const activePeriod = program.programPeriods[0];
        if (!activePeriod) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'No active period found for this program',
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
            programPeriodId: activePeriod.id,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            bankAccountSender: input.bankAccountSender,
            bankAccountReceiver: input.bankAccountReceiver,
            donationReferenceNumber,
            status: 'pending_verification',
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
            programPeriod: {
              select: {
                id: true,
                startDate: true,
                endDate: true,
                cycleNumber: true,
                currentAmount: true,
              },
            },
          },
        });

        return donation;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create donation',
        });
      }
    }),

  // Upload donation proof
  uploadDonationProof: protectedProcedure
    .input(
      z.object({
        donationId: z.string(),
        imagePath: z.string(),
        imageName: z.string(),
        fileSize: z.number().int().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Verify donation belongs to user
        const donation = await prisma.donation.findFirst({
          where: {
            id: input.donationId,
            userId: ctx.session.user.id,
          },
        });

        if (!donation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Donation not found or access denied',
          });
        }

        // Create donation proof
        const donationProof = await prisma.donationProof.create({
          data: {
            donationId: input.donationId,
            imagePath: input.imagePath,
            imageName: input.imageName,
            fileSize: input.fileSize,
          },
        });

        return donationProof;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to upload donation proof',
        });
      }
    }),

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
          (sum, donation) => sum + Number(donation.amount),
          0
        );
        const uniqueDonors = new Set(program.donations.map(d => d.userId)).size;
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
