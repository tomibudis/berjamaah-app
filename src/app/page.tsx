'use client';

import { ProgramCard } from '@/features/donation/program-card';
import { useSession } from 'next-auth/react';
import BottomNavigationUser from '@/components/layout/bottom-navigation-user';
import { useCallback } from 'react';
import { useTRPCClient, queryClient } from '@/utils/trpc';
import PullToRefresh from '@/components/shared/pull-to-refresh';
import { ListCard, ListCardContent } from '@/components/shared/list-card';
import { useInfiniteQuery } from '@tanstack/react-query';

export default function Home() {
  const { data: session, status } = useSession();
  const trpcClient = useTRPCClient();

  type ProgramCardModel = Parameters<typeof ProgramCard>[0]['program'];

  const limit = 10;
  // sentinel handled in ListCardContent

  const handleDonationSubmit = (programId: string, amount: string) => {
    // TODO: Implement actual donation submission
    console.log('Donating:', {
      programId,
      amount,
    });
  };

  // Map API program to ProgramCard props
  const mapToProgramCardModel = useCallback(
    (p: {
      id: string;
      title: string;
      description: string;
      targetAmount: number | string | null;
      bannerImage?: string | null;
      category?: string | null;
      status?: string | null;
      programPeriods?: Array<{
        id: string;
        startDate: string | Date;
        endDate: string | Date;
        currentAmount?: number | string | null;
        cycleNumber?: number | null;
      }>;
      _count?: { donations?: number };
    }): ProgramCardModel => {
      const latestPeriod =
        Array.isArray(p.programPeriods) && p.programPeriods.length > 0
          ? p.programPeriods[0]
          : null;
      const targetAmount = Number(p.targetAmount || 0);
      const collected = Number(latestPeriod?.currentAmount || 0);
      const progress =
        targetAmount > 0
          ? Math.min(100, Math.round((collected / targetAmount) * 100))
          : 0;
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        target: targetAmount,
        collected,
        progress,
        period: latestPeriod
          ? `${new Date(latestPeriod.startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(latestPeriod.endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
          : '-',
        category: p.category || 'Lainnya',
        donorCount: Number(p._count?.donations ?? 0),
        endDate: latestPeriod
          ? new Date(latestPeriod.endDate).toISOString()
          : new Date().toISOString(),
        status: p.status || 'active',
        bannerImage: p.bannerImage ?? undefined,
      } satisfies ProgramCardModel;
    },
    []
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['programs', 'active', limit],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      return trpcClient.program.getAll.query({
        status: 'active',
        limit,
        offset: typeof pageParam === 'number' ? pageParam : 0,
      });
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage?.hasMore) return undefined;
      const loaded = allPages.reduce(
        (sum, p) => sum + (p?.programs?.length ?? 0),
        0
      );
      return loaded;
    },
  });

  const items: ProgramCardModel[] = (
    data?.pages.flatMap(p => p?.programs ?? []) ?? []
  ).map(mapToProgramCardModel);

  // IntersectionObserver handled inside ListCardContent now

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['programs', 'active', limit],
    });
    await refetch();
  }, [refetch, limit]);

  return (
    <div>
      <div
        className={`${session && status === 'authenticated' ? 'pb-20' : ''}`}
      >
        <PullToRefresh onRefreshAction={handleRefresh}>
          <div className='space-y-6'>
            {/* Daftar Program Aktif Section */}
            <ListCard
              onLoadMore={() => {
                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            >
              <ListCardContent>
                <div className='space-y-4'>
                  {items.map(program => (
                    <ProgramCard
                      key={program.id}
                      program={program}
                      onDonationSubmit={handleDonationSubmit}
                    />
                  ))}
                  {isLoading && (
                    <div className='text-center text-sm text-gray-500 py-4'>
                      Memuat…
                    </div>
                  )}
                  {!isLoading && items.length === 0 && (
                    <div className='text-center text-sm text-gray-500 py-8'>
                      Belum ada program aktif.
                    </div>
                  )}
                </div>
              </ListCardContent>
            </ListCard>
          </div>
        </PullToRefresh>
      </div>

      {/* Bottom Navigation - Only show if user is logged in */}
      {session && status === 'authenticated' && <BottomNavigationUser />}
    </div>
  );
}
