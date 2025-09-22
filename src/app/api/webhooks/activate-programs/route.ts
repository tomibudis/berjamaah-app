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

    // Find all programs with status 'pending' that should be activated
    const currentDate = new Date();

    const programsToActivate = await prisma.program.findMany({
      where: {
        status: 'pending',
        programPeriods: {
          some: {
            startDate: {
              lte: currentDate,
            },
          },
        },
      },
      include: {
        programPeriods: true,
      },
    });

    const activatedPrograms = [];

    for (const program of programsToActivate) {
      // Update program status to active
      await prisma.program.update({
        where: { id: program.id },
        data: { status: 'active' },
      });

      // Update the relevant program period
      const activePeriod = program.programPeriods.find(
        period => period.startDate && period.startDate <= currentDate
      );

      if (activePeriod) {
        await prisma.programPeriod.update({
          where: { id: activePeriod.id },
          data: {
            updatedAt: new Date(),
          },
        });
      }

      activatedPrograms.push({
        id: program.id,
        title: program.title,
        status: 'active',
        activatedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Activated ${activatedPrograms.length} programs`,
      activatedPrograms,
    });
  } catch (error) {
    console.error('Error activating programs:', error);
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

    const pendingPrograms = await prisma.program.findMany({
      where: {
        status: 'pending',
        programPeriods: {
          some: {
            startDate: {
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
      pendingProgramsCount: pendingPrograms.length,
      pendingPrograms: pendingPrograms.map(program => ({
        id: program.id,
        title: program.title,
        status: program.status,
        periods: program.programPeriods,
      })),
    });
  } catch (error) {
    console.error('Error fetching pending programs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
