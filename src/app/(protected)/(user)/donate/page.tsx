'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { trpc } from '@/utils/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Plus } from 'lucide-react';
import {
  DonationHistoryCard,
  type DonationHistoryItem,
} from '@/features/donation/donation-history-card';
import { DonationDetailDrawer } from '@/features/donation/donation-detail-drawer';
import { ListCard, ListCardContent } from '@/components/shared/list-card';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';

type DonationFromAPI = {
  id: string;
  amount: string;
  status: string;
  donationReferenceNumber: string;
  createdAt: string;
  program: {
    id: string;
    title: string;
    category: string | null;
    bannerImage: string | null;
  };
  programPeriod: {
    id: string;
    startDate: string | null;
    endDate: string | null;
    cycleNumber: number | null;
  } | null;
} & Record<string, unknown>;

export default function DonatePage() {
  const { status } = useSession();
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = trpc.donation.getUserDonations.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: lastPage => lastPage.nextCursor,
    }
  );

  const donations =
    data?.pages.flatMap(page =>
      page.donations.map((donation: DonationFromAPI) => ({
        ...donation,
        amount: Number(donation.amount),
        status: donation.status as
          | 'pending_verification'
          | 'verified'
          | 'confirmed'
          | 'rejected',
        programPeriod: donation.programPeriod
          ? {
              ...donation.programPeriod,
              startDate: donation.programPeriod.startDate || '',
              endDate: donation.programPeriod.endDate || '',
            }
          : {
              id: 'no-period',
              startDate: '',
              endDate: '',
              cycleNumber: null,
            },
      }))
    ) ?? [];

  const handleViewDetails = (donationId: string) => {
    setSelectedDonationId(donationId);
  };

  const handleCloseDrawer = () => {
    setSelectedDonationId(null);
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const handleLoadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  if (status === 'loading') {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='space-y-6 px-4'>
          <Skeleton className='h-6 w-3/4' />
          <div className='grid grid-cols-1 gap-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-32 w-full' />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefreshAction={handleRefresh}>
      <div>
        <div className='space-y-6 px-4'>
          {/* Header */}
          <div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              Riwayat Donasi
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Lihat riwayat donasi Anda dan status verifikasinya.
            </p>
          </div>

          {/* Donation History List */}
          {isLoading ? (
            <div className='space-y-4'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-32 w-full' />
              ))}
            </div>
          ) : donations.length === 0 ? (
            <Card className='border border-gray-200 dark:border-gray-700 shadow-sm py-0'>
              <CardContent className='p-8 text-center'>
                <History className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                  Belum Ada Donasi
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                  Anda belum melakukan donasi apapun. Mulai donasi pertama Anda
                  sekarang!
                </p>
                <Button className='bg-green-500 hover:bg-green-600 text-white'>
                  <Plus className='w-4 h-4 mr-2' />
                  Mulai Donasi
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ListCard onLoadMore={hasNextPage ? handleLoadMore : undefined}>
              <ListCardContent className='px-0'>
                {donations.map(donation => (
                  <DonationHistoryCard
                    key={donation.id}
                    donation={donation as DonationHistoryItem}
                    onViewDetails={handleViewDetails}
                  />
                ))}
                {isFetchingNextPage && (
                  <div className='flex justify-center py-4'>
                    <Skeleton className='h-32 w-full' />
                  </div>
                )}
              </ListCardContent>
            </ListCard>
          )}
        </div>

        {/* Donation Detail Drawer */}
        <DonationDetailDrawer
          donationId={selectedDonationId}
          isOpen={!!selectedDonationId}
          onCloseAction={handleCloseDrawer}
        />
      </div>
    </PullToRefresh>
  );
}
