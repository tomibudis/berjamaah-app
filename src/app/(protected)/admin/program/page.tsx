'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import Loader from '@/components/shared/loader';
import { useQuery } from '@tanstack/react-query';
import { ProgramDetailDrawer } from '@/features/program/program-detail-drawer';
import { ProgramFilterDrawer } from '@/features/program/program-filter-drawer';
import { ProgramList } from '@/features/program/program-list';
import { useQueryParams } from '@/hooks/use-query-params';
import { formatCurrencyCompact } from '@/lib/currency-utils';
import { trpcClient } from '@/utils/trpc';

function ProgramPageContent() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Use query params for filters
  const [filters, setFilters] = useQueryParams({
    status: 'all',
    category: 'all',
  });

  // TRPC query for program statistics
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['programStats'],
    queryFn: async () => {
      return await trpcClient.program.getProgramStats.query();
    },
  });

  const formatCurrency = (amount: number) => {
    return formatCurrencyCompact(amount);
  };

  const handleApplyFilters = () => {
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  const handleResetFilters = () => {
    // Reset filters to default
    setFilters({ status: 'all', category: 'all' });
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
  };

  // Handle program selection
  const handleProgramSelect = (programId: string) => {
    setSelectedProgramId(programId);
    setIsDrawerOpen(true);
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedProgramId(null);
  };

  // Handle program deletion
  const handleProgramDelete = () => {
    // Close drawer and let the ProgramList component handle refetching
    setIsDrawerOpen(false);
    setSelectedProgramId(null);
  };

  return (
    <div>
      <div>
        <div className='space-y-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Program Aktif
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Sedang berjalan
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {isStatsLoading ? (
                    <div className='animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-12 mx-auto rounded'></div>
                  ) : statsError ? (
                    <span className='text-red-500 text-sm'>Error</span>
                  ) : (
                    statsData?.totalActivePrograms || 0
                  )}
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Total Donatur
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Semua program
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {isStatsLoading ? (
                    <div className='animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-12 mx-auto rounded'></div>
                  ) : statsError ? (
                    <span className='text-red-500 text-sm'>Error</span>
                  ) : (
                    statsData?.totalDonators || 0
                  )}
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Program Selesai
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Berhasil diselesaikan
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {isStatsLoading ? (
                    <div className='animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-12 mx-auto rounded'></div>
                  ) : statsError ? (
                    <span className='text-red-500 text-sm'>Error</span>
                  ) : (
                    statsData?.totalEndedPrograms || 0
                  )}
                </div>
              </div>
            </div>

            <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Total Terkumpul
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Sepanjang waktu
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {isStatsLoading ? (
                    <div className='animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded'></div>
                  ) : statsError ? (
                    <span className='text-red-500 text-sm'>Error</span>
                  ) : (
                    formatCurrency(statsData?.totalDonationAmount || 0)
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Header */}
          <div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
              List Program
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Buat program baru, edit yang sudah ada, dan pantau
              perkembangannya.
            </p>
          </div>

          {/* Add Program Button and Filter */}
          <div className='flex justify-between items-center gap-2'>
            <Link href='/admin/program/add'>
              <Button
                size='sm'
                className='bg-green-600 hover:bg-green-700 text-white'
              >
                <svg
                  className='w-4 h-4 mr-2'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                Tambah Program
              </Button>
            </Link>

            <Drawer
              direction='bottom'
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  className='flex items-center gap-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                    />
                  </svg>
                  Filter
                  {Object.keys(filters).some(key => {
                    const value = filters[key as keyof typeof filters];
                    return value && value !== 'all';
                  }) && (
                    <span className='bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                      {
                        Object.entries(filters).filter(([, value]) => {
                          return value && value !== 'all';
                        }).length
                      }
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
                  <DrawerHeader className='flex-shrink-0'>
                    <DrawerTitle>Filter Program</DrawerTitle>
                    <DrawerDescription>
                      Saring program berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='flex-1 px-4 pb-4'>
                    <ProgramFilterDrawer
                      filters={filters}
                      onFiltersChange={setFilters}
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                    />
                  </div>
                  <DrawerFooter className='flex-shrink-0'>
                    <DrawerClose asChild>
                      <Button variant='outline'>Tutup</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Program List */}
          <ProgramList
            status={
              filters.status as
                | 'all'
                | 'draft'
                | 'pending'
                | 'active'
                | 'paused'
                | 'ended'
            }
            category={filters.category}
            onProgramSelect={handleProgramSelect}
          />
        </div>
      </div>

      {/* Program Detail Drawer */}
      {selectedProgramId && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className='mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto'>
              <DrawerHeader className='flex-shrink-0'>
                <DrawerTitle>Detail Program</DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap tentang program ini
                </DrawerDescription>
              </DrawerHeader>
              <div className='flex-1 px-4 pb-4'>
                <ProgramDetailDrawer
                  programId={selectedProgramId}
                  isOpen={isDrawerOpen}
                  onCloseAction={handleDrawerClose}
                  onDelete={handleProgramDelete}
                />
              </div>
              <DrawerFooter className='flex-shrink-0'>
                <DrawerClose asChild>
                  <Button variant='outline'>Tutup</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

export default function ProgramPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ProgramPageContent />
    </Suspense>
  );
}
