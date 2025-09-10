'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { trpc, trpcClient, queryClient } from '@/utils/trpc';
import Loader from '@/components/shared/loader';
import { useQuery } from '@tanstack/react-query';
import { ProgramDetailDrawer } from '@/features/program/program-detail-drawer';
import { ProgramFilterDrawer } from '@/features/program/program-filter-drawer';
import { useQueryParams } from '@/hooks/use-query-params';

// Types for program data
interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string; // Changed from number to string to match database
  category: string | null;
  status: string;
  programType: string;
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  programPeriods: Array<{
    id: string;
    startDate: string;
    endDate: string;
    currentAmount: string; // Changed from number to string to match database
    cycleNumber?: number | null;
    recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
    recurringDay?: number | null;
    recurringDurationDays?: number | null;
    totalCycles?: number | null;
    nextActivationDate?: string | null;
  }>;
  _count: {
    donations: number;
  };
}

export default function ProgramPage() {
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);

  // Use query params for filters
  const [filters, setFilters] = useQueryParams({
    status: 'all',
    category: 'all',
  });

  const LIMIT = 10;

  // TRPC query for programs with pagination
  const {
    data: programsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['programs', filters.status, filters.category, offset],
    queryFn: async () => {
      return await trpcClient.program.getAll.query({
        status:
          filters.status !== 'all'
            ? (filters.status as
                | 'draft'
                | 'pending'
                | 'active'
                | 'paused'
                | 'ended')
            : undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        limit: LIMIT,
        offset: offset,
      });
    },
  });

  // Load more programs
  const loadMore = useCallback(async () => {
    if (programsData && programsData.hasMore && !isLoading) {
      setOffset(prev => prev + LIMIT);
    }
  }, [programsData, isLoading]);

  // Update programs when data changes
  useEffect(() => {
    if (programsData) {
      if (offset === 0) {
        setAllPrograms(programsData.programs);
      } else {
        setAllPrograms(prev => [...prev, ...programsData.programs]);
      }
    }
  }, [programsData, offset]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      loadMore();
    }
  }, [loadMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ended':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'ended':
        return 'Selesai';
      case 'paused':
        return 'Dijeda';
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Menunggu';
      default:
        return 'Tidak Diketahui';
    }
  };

  const handleApplyFilters = () => {
    // Reset pagination when filters change
    setOffset(0);
    setAllPrograms([]);
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
    // Refetch the query
    refetch();
  };

  const handleResetFilters = () => {
    // Reset pagination when filters change
    setOffset(0);
    setAllPrograms([]);
    // Close the filter drawer
    setIsFilterDrawerOpen(false);
    // Refetch the query
    refetch();
  };

  // Calculate current amount for a program
  const getCurrentAmount = (program: Program) => {
    return program.programPeriods.reduce(
      (sum, period) => sum + Number(period.currentAmount),
      0
    );
  };

  // Get progress percentage for a program
  const getProgressPercentage = (program: Program) => {
    const currentAmount = getCurrentAmount(program);
    return Math.round((currentAmount / Number(program.targetAmount)) * 100);
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
    // Reset pagination and refetch programs
    setOffset(0);
    setAllPrograms([]);
    refetch();
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Program Aktif
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Sedang berjalan
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allPrograms.filter(p => p.status === 'active').length}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Total Donatur
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Semua program
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allPrograms.reduce((sum, p) => sum + p._count.donations, 0)}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Program Selesai
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Berhasil diselesaikan
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allPrograms.filter(p => p.status === 'ended').length}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Total Terkumpul
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Sepanjang waktu
                </p>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(
                    allPrograms.reduce((sum, p) => sum + getCurrentAmount(p), 0)
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Header */}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              List Program
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Buat program baru, edit yang sudah ada, dan pantau
              perkembangannya.
            </p>
          </div>

          {/* Add Program Button and Filter */}
          <div className="flex justify-between items-center gap-2">
            <Link href="/admin/program/add">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Program
              </Button>
            </Link>

            <Drawer
              direction="bottom"
              open={isFilterDrawerOpen}
              onOpenChange={setIsFilterDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                  {Object.keys(filters).some(key => {
                    const value = filters[key as keyof typeof filters];
                    return value && value !== 'all';
                  }) && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {
                        Object.entries(filters).filter(([key, value]) => {
                          return value && value !== 'all';
                        }).length
                      }
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto">
                  <DrawerHeader className="flex-shrink-0">
                    <DrawerTitle>Filter Program</DrawerTitle>
                    <DrawerDescription>
                      Saring program berdasarkan kriteria yang diinginkan
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex-1 px-4 pb-4">
                    <ProgramFilterDrawer
                      onApply={handleApplyFilters}
                      onReset={handleResetFilters}
                    />
                  </div>
                  <DrawerFooter className="flex-shrink-0">
                    <DrawerClose asChild>
                      <Button variant="outline">Tutup</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Program Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">
                  Error loading programs: {error.message}
                </p>
              </div>
            ) : allPrograms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No programs found</p>
              </div>
            ) : (
              allPrograms.map(program => {
                const currentAmount = getCurrentAmount(program);
                const progressPercentage = getProgressPercentage(program);

                return (
                  <Card
                    key={program.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleProgramSelect(program.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                            {program.title}
                          </CardTitle>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}
                        >
                          {getStatusText(program.status)}
                        </span>
                      </div>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {program.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              Progress
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {progressPercentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${progressPercentage}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <span>
                              Terkumpul: {formatCurrency(currentAmount)}
                            </span>
                            <span>
                              Target:{' '}
                              {formatCurrency(Number(program.targetAmount))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}

            {/* Loading indicator for infinite scroll */}
            {isLoading && offset > 0 && (
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Detail Drawer */}
      {selectedProgramId && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent>
            <div className="mx-auto w-full max-w-md h-[80vh] flex flex-col overflow-y-auto">
              <DrawerHeader className="flex-shrink-0">
                <DrawerTitle>Detail Program</DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap tentang program ini
                </DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 px-4 pb-4">
                <ProgramDetailDrawer
                  programId={selectedProgramId}
                  isOpen={isDrawerOpen}
                  onClose={handleDrawerClose}
                  onDelete={handleProgramDelete}
                />
              </div>
              <DrawerFooter className="flex-shrink-0">
                <DrawerClose asChild>
                  <Button variant="outline">Tutup</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
