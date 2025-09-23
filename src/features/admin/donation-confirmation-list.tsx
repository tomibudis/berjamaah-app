'use client';

import { useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useTRPCClient } from '@/utils/trpc';
import { DonationConfirmationCard } from './donation-confirmation-card';
import { ListCard, ListCardContent } from '@/components/shared/list-card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

// Define proper types for donation data
interface DonationData {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  amount: number | string;
  paymentMethod?: string | null;
  bankAccountSender?: string | null;
  bankAccountReceiver?: string | null;
  donationReferenceNumber: string;
  donationProofImage?: string | null;
  status: string;
  createdAt: string | Date;
  program: {
    id: string;
    title: string;
    description: string;
    category?: string | null;
    bannerImage?: string | null;
  };
  programPeriod?: {
    id: string;
    startDate?: string | Date | null;
    endDate?: string | Date | null;
    cycleNumber?: number | null;
  } | null;
  verifiedByAdmin?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}

interface DonationResponse {
  donations: DonationData[];
  pagination: {
    totalCount: number;
    hasMore: boolean;
  };
}

interface DonationConfirmationListProps {
  status?: 'pending_verification' | 'verified' | 'confirmed' | 'rejected';
  search?: string;
  className?: string;
}

export function DonationConfirmationList({
  status = 'pending_verification',
  search,
  className,
}: DonationConfirmationListProps) {
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  const limit = 10;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<DonationResponse>({
      queryKey: ['admin-donations', status, search, limit],
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
        return trpcClient.donation.getPendingDonations.query({
          status,
          search,
          limit,
          offset: typeof pageParam === 'number' ? pageParam : 0,
        });
      },
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage?.pagination?.hasMore) return undefined;
        const loaded = allPages.reduce(
          (sum, p) => sum + (p?.donations?.length ?? 0),
          0
        );
        return loaded;
      },
    });

  // Get all donations from all pages
  const donations: DonationData[] =
    data?.pages.flatMap(page => page?.donations ?? []) ?? [];

  const handleStatusChange = useCallback(() => {
    // Invalidate and refetch the query to ensure data consistency
    queryClient.invalidateQueries({
      queryKey: ['admin-donations', status, search, limit],
    });
  }, [queryClient, status, search, limit]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'Donasi Menunggu Verifikasi';
      case 'verified':
        return 'Donasi Terverifikasi';
      case 'confirmed':
        return 'Donasi Terkonfirmasi';
      case 'rejected':
        return 'Donasi Ditolak';
      default:
        return 'Donasi';
    }
  };

  const getStatusCount = () => {
    return data?.pages?.[0]?.pagination?.totalCount ?? 0;
  };

  return (
    <div className={className}>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
            {getStatusTitle(status)}
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Kelola donasi yang memerlukan persetujuan admin
          </p>
        </div>
        <Badge
          variant='secondary'
          className='h-6 w-auto px-2 rounded-full text-xs flex items-center justify-center'
        >
          {getStatusCount()}
        </Badge>
      </div>

      <ListCard onLoadMore={handleLoadMore}>
        <ListCardContent className='px-0'>
          <div className='space-y-3'>
            {donations.map(donation => (
              <DonationConfirmationCard
                key={donation.id}
                donation={donation}
                onStatusChange={handleStatusChange}
              />
            ))}

            {isLoading && (
              <div className='text-center text-sm text-gray-500 py-4'>
                Memuat donasi...
              </div>
            )}

            {!isLoading && donations.length === 0 && (
              <div className='text-center py-8'>
                <AlertCircle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                <p className='text-sm text-gray-500'>
                  {status === 'pending_verification'
                    ? 'Belum ada donasi yang menunggu verifikasi'
                    : 'Belum ada donasi dengan status ini'}
                </p>
              </div>
            )}

            {isFetchingNextPage && (
              <div className='text-center text-sm text-gray-500 py-4'>
                Memuat lebih banyak...
              </div>
            )}
          </div>
        </ListCardContent>
      </ListCard>
    </div>
  );
}
