import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../prisma/index';

export async function POST(request: NextRequest) {
  try {
    // Optional: verify secret header from GitHub Actions
    const secret = process.env.WEBHOOK_SECRET;
    if (secret) {
      const header = request.headers.get('x-webhook-secret');
      if (header !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Find all programs with status 'active' that should be deactivated
    const currentDate = new Date();

    const programsToDeactivate = await prisma.program.findMany({
      where: {
        status: 'active',
        programPeriods: {
          some: {
            endDate: {
              lte: currentDate,
            },
          },
        },
      },
      include: {
        programPeriods: true,
      },
    });

    const deactivatedPrograms = [];

    for (const program of programsToDeactivate) {
      // Update program status to ended
      await prisma.program.update({
        where: { id: program.id },
        data: { status: 'ended' },
      });

      // Update the relevant program period
      const expiredPeriod = program.programPeriods.find(
        period => period.endDate !== null && period.endDate <= currentDate
      );

      if (expiredPeriod) {
        await prisma.programPeriod.update({
          where: { id: expiredPeriod.id },
          data: {
            updatedAt: new Date(),
          },
        });
      }

      deactivatedPrograms.push({
        id: program.id,
        title: program.title,
        status: 'ended',
        endedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Deactivated ${deactivatedPrograms.length} programs`,
      deactivatedPrograms,
    });
  } catch (error) {
    console.error('Error deactivating programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  try {
    const currentDate = new Date();

    const activePrograms = await prisma.program.findMany({
      where: {
        status: 'active',
        programPeriods: {
          some: {
            endDate: {
              lte: currentDate,
            },
          },
        },
      },
      include: {
        programPeriods: true,
      },
    });

    return NextResponse.json({
      success: true,
      activeProgramsCount: activePrograms.length,
      activePrograms: activePrograms.map(program => ({
        id: program.id,
        title: program.title,
        status: program.status,
        periods: program.programPeriods,
      })),
    });
  } catch (error) {
    console.error('Error fetching active programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
