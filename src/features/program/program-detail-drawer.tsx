'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import Loader from '@/components/shared/loader';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string; // Changed from number to string to match database
  category: string | null;
  status: string; // Changed to string to match database return type
  programType: string; // Changed to string to match database return type
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByUser?: {
    id: string;
    name: string | null;
    fullName: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
  programPeriods: Array<{
    id: string;
    startDate: string | null;
    endDate: string | null;
    currentAmount: string; // Changed from number to string to match database
    cycleNumber?: number | null;
    recurringFrequency?: string | null;
    recurringDay?: number | null;
    recurringDurationDays?: number | null;
    totalCycles?: number | null;
    nextActivationDate?: string | null;
  }>;
  // donations array is not included in getById query, only _count.donations
  _count: {
    donations: number;
  };
  totalRaisedAmount: number;
  totalDonationCount: number;
  progressPercentage: number;
}

interface ProgramDetailDrawerProps {
  programId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function ProgramDetailDrawer({
  programId,
  isOpen,
  onClose,
  onDelete,
}: ProgramDetailDrawerProps) {
  const {
    data: program,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      return await trpcClient.program.getById.query({ id: programId });
    },
    enabled: isOpen && !!programId,
  });

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteProgramMutation = useMutation({
    mutationFn: async (programId: string) => {
      return await trpcClient.program.delete.mutate({ id: programId });
    },
    onSuccess: () => {
      toast.success('Program berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      setIsDeleteDialogOpen(false);
      onClose();
      onDelete?.();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus program');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      programId,
      status,
    }: {
      programId: string;
      status: string;
    }) => {
      return await trpcClient.program.updateProgramStatus.mutate({
        id: programId,
        status: status as 'draft' | 'pending' | 'active' | 'paused' | 'ended',
      });
    },
    onSuccess: () => {
      toast.success('Status program berhasil diperbarui');
      // Invalidate all relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['program', programId] });
      queryClient.invalidateQueries({ queryKey: ['programStats'] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || 'Gagal memperbarui status program');
    },
  });

  const handleDeleteProgram = () => {
    if (program) {
      deleteProgramMutation.mutate(program.id);
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (program) {
      updateStatusMutation.mutate({ programId: program.id, status: newStatus });
    }
  };

  const getAvailableStatusActions = (currentStatus: string) => {
    const statusActions: Record<
      string,
      Array<{ status: string; label: string; variant: string }>
    > = {
      draft: [
        { status: 'pending', label: 'Ajukan untuk Review', variant: 'default' },
        { status: 'active', label: 'Aktifkan', variant: 'default' },
      ],
      pending: [
        { status: 'active', label: 'Aktifkan', variant: 'default' },
        { status: 'draft', label: 'Kembali ke Draft', variant: 'outline' },
      ],
      active: [
        { status: 'paused', label: 'Jeda Program', variant: 'outline' },
        { status: 'ended', label: 'Akhiri Program', variant: 'destructive' },
      ],
      paused: [
        { status: 'active', label: 'Lanjutkan Program', variant: 'default' },
        { status: 'ended', label: 'Akhiri Program', variant: 'destructive' },
      ],
      ended: [{ status: 'active', label: 'Buka Kembali', variant: 'default' }],
    };

    return statusActions[currentStatus] || [];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const getCreatorDisplayName = (program: Program) => {
    if (!program.createdByUser) return 'Tidak diketahui';

    const { name, fullName, firstName, lastName } = program.createdByUser;

    // Priority: fullName > name > firstName + lastName > firstName > 'Tidak diketahui'
    if (fullName) return fullName;
    if (name) return name;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;

    return 'Tidak diketahui';
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className='flex justify-center py-8'>
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-500'>Error loading program: {error.message}</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>Program not found</p>
      </div>
    );
  }

  // Get the latest period for date information
  const latestPeriod = program.programPeriods[0];

  const displayPeriodDate = (date: string | null) => {
    if (date !== '1970-01-01T00:00:00.000Z' && date !== null)
      return formatDateTime(date);
    return '~';
  };

  const getDateAlertInfo = (
    startDate: string | null,
    endDate: string | null
  ) => {
    const isStartEmpty = !startDate || startDate === '1970-01-01T00:00:00.000Z';
    const isEndEmpty = !endDate || endDate === '1970-01-01T00:00:00.000Z';

    if (isStartEmpty && isEndEmpty) {
      return {
        type: 'warning' as const,
        message:
          '⚠️ Tanggal mulai dan selesai belum ditentukan. Program dapat berjalan tanpa batas waktu.',
      };
    } else if (isStartEmpty) {
      return {
        type: 'info' as const,
        message:
          'ℹ️ Tanggal mulai belum ditentukan. Program akan dimulai kapan saja.',
      };
    } else if (isEndEmpty) {
      return {
        type: 'info' as const,
        message:
          'ℹ️ Tanggal selesai belum ditentukan. Program akan berjalan tanpa batas waktu.',
      };
    } else {
      return {
        type: 'success' as const,
        message:
          '✅ Program memiliki jadwal yang jelas dengan tanggal mulai dan selesai.',
      };
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>
          {program.title}
        </h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(program.status)}`}
        >
          {getStatusText(program.status)}
        </span>
      </div>

      {/* Banner Image */}
      {program.bannerImage && (
        <div className='w-full'>
          <img
            src={program.bannerImage}
            alt={`Banner ${program.title}`}
            className='w-full object-cover rounded-lg border border-gray-200 dark:border-gray-700'
            onError={e => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Progress */}
      <div className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span className='text-gray-600 dark:text-gray-400'>Progress</span>
          <span className='text-gray-900 dark:text-white font-medium'>
            {program.progressPercentage?.toFixed(2)}%
          </span>
        </div>
        <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3'>
          <div
            className='bg-green-600 h-3 rounded-full transition-all duration-300'
            style={{
              width: `${program.progressPercentage?.toFixed(2)}%`,
            }}
          ></div>
        </div>
        <div className='flex justify-between text-sm text-gray-600 dark:text-gray-400'>
          <span>Terkumpul: {formatCurrency(program.totalRaisedAmount)}</span>
          <span>Target: {formatCurrency(Number(program.targetAmount))}</span>
        </div>
      </div>

      {/* Basic Info */}
      <div className='space-y-4'>
        <div>
          <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
            Deskripsi
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {program.description}
          </p>
        </div>

        {program.details && (
          <div>
            <h3 className='font-semibold text-gray-900 dark:text-white mb-2'>
              Detail Program
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {program.details}
            </p>
          </div>
        )}

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <h4 className='font-medium text-gray-900 dark:text-white text-sm'>
              Kategori
            </h4>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {program.category}
            </p>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 dark:text-white text-sm'>
              Donatur
            </h4>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {program._count.donations} orang
            </p>
          </div>
        </div>

        {program.contact && (
          <div>
            <h4 className='font-medium text-gray-900 dark:text-white text-sm mb-1'>
              Kontak
            </h4>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              {program.contact}
            </p>
          </div>
        )}

        {latestPeriod && (
          <div className='space-y-3'>
            {/* Date Alert Information */}
            <Alert
              className={`${
                getDateAlertInfo(latestPeriod.startDate, latestPeriod.endDate)
                  .type === 'warning'
                  ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  : getDateAlertInfo(
                        latestPeriod.startDate,
                        latestPeriod.endDate
                      ).type === 'info'
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                    : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
              }`}
            >
              <AlertDescription className='text-sm'>
                {
                  getDateAlertInfo(latestPeriod.startDate, latestPeriod.endDate)
                    .message
                }
              </AlertDescription>
            </Alert>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-white text-sm'>
                  Tanggal Mulai
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {displayPeriodDate(latestPeriod.startDate)}
                </p>
              </div>
              <div>
                <h4 className='font-medium text-gray-900 dark:text-white text-sm'>
                  Tanggal Selesai
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  {displayPeriodDate(latestPeriod.endDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h4 className='font-medium text-gray-900 dark:text-white text-sm mb-1'>
            Dibuat
          </h4>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {getCreatorDisplayName(program)} |{' '}
            {formatDateTime(program.createdAt)}
          </p>
        </div>
      </div>

      {/* Status Update Buttons - Only show if user is the creator */}
      {session?.user?.id === program?.createdBy && (
        <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
          <h3 className='font-semibold text-gray-900 dark:text-white mb-3'>
            Kelola Status Program
          </h3>
          <div className='space-y-2'>
            {getAvailableStatusActions(program.status).map(action => (
              <Button
                key={action.status}
                variant={
                  action.variant as 'default' | 'outline' | 'destructive'
                }
                size='sm'
                className='w-full'
                onClick={() => handleUpdateStatus(action.status)}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <div className='w-4 h-4 mr-2'>
                      <Loader />
                    </div>
                    Memproses...
                  </>
                ) : (
                  action.label
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Delete Button - Only show if user is the creator */}
      {session?.user?.id === program?.createdBy && (
        <div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant='destructive'
                size='sm'
                className='w-full'
                disabled={deleteProgramMutation.isPending}
              >
                {deleteProgramMutation.isPending ? (
                  <>
                    <div className='w-4 h-4 mr-2'>
                      <Loader />
                    </div>
                    Menghapus...
                  </>
                ) : (
                  <>
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
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                    Hapus Program
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus Program</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus program "{program?.title}"?
                  Tindakan ini tidak dapat dibatalkan dan akan menghapus semua
                  data program termasuk periode dan donasi yang terkait.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProgram}
                  className='bg-red-600 hover:bg-red-700'
                  disabled={deleteProgramMutation.isPending}
                >
                  {deleteProgramMutation.isPending ? 'Menghapus...' : 'Hapus'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
