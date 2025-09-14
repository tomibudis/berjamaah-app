'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import Loader from '@/components/shared/loader';
import { authClient } from '@/lib/auth-client';
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

interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string; // Changed from number to string to match database
  category: string | null;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'ended';
  programType: 'one_time' | 'multiple' | 'selected_date';
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  programPeriods: Array<{
    id: string;
    startDate: string;
    endDate: string;
    currentAmount: string; // Changed from number to string to match database
    cycleNumber?: number | null;
    recurringFrequency?: string | null;
    recurringDay?: number | null;
    recurringDurationDays?: number | null;
    totalCycles?: number | null;
    nextActivationDate?: string | null;
  }>;
  _count: {
    donations: number;
  };
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

  const { data: session } = authClient.useSession();
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
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menghapus program');
    },
  });

  const handleDeleteProgram = () => {
    if (program) {
      deleteProgramMutation.mutate(program.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  const formatRecurringSchedule = (period: Program['programPeriods'][0]) => {
    if (!period.recurringFrequency) return '';

    const frequencyText = {
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      quarterly: 'Triwulan',
      yearly: 'Tahunan',
    };

    const dayText = period.recurringDay
      ? ` pada hari ke-${period.recurringDay}`
      : '';
    const durationText = period.recurringDurationDays
      ? ` selama ${period.recurringDurationDays} hari`
      : '';
    const cyclesText = period.totalCycles
      ? ` (${period.totalCycles} siklus)`
      : ' (tanpa batas)';

    return `Berulang ${frequencyText[period.recurringFrequency as keyof typeof frequencyText] || period.recurringFrequency}${dayText}${durationText}${cyclesText}`;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const minute = parseInt(minutes, 10);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading program: {error.message}</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Program not found</p>
      </div>
    );
  }

  // Calculate current amount from all periods
  const currentAmount = program.programPeriods.reduce(
    (sum: number, period: Program['programPeriods'][0]) =>
      sum + Number(period.currentAmount),
    0
  );

  // Get the latest period for date information
  const latestPeriod = program.programPeriods[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {program.title}
        </h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(program.status)}`}
        >
          {getStatusText(program.status)}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {Math.round((currentAmount / Number(program.targetAmount)) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${(currentAmount / Number(program.targetAmount)) * 100}%`,
            }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Terkumpul: {formatCurrency(currentAmount)}</span>
          <span>Target: {formatCurrency(Number(program.targetAmount))}</span>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Deskripsi
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {program.description}
          </p>
        </div>

        {program.details && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Detail Program
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.details}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Kategori
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.category}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Tipe Program
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.programType === 'one_time' && 'Sekali Jalan'}
              {program.programType === 'multiple' && 'Berulang'}
              {program.programType === 'selected_date' && 'Tanggal Terpilih'}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Donatur
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program._count.donations} orang
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              Periode
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.programPeriods.length} periode
            </p>
          </div>
        </div>

        {program.contact && (
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              Kontak
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.contact}
            </p>
          </div>
        )}

        {latestPeriod && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                Tanggal Mulai
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(latestPeriod.startDate)}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                Tanggal Selesai
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(latestPeriod.endDate)}
              </p>
            </div>
          </div>
        )}

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
            Dibuat
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(program.createdAt)}
          </p>
        </div>
      </div>

      {/* Program Periods */}
      {program.programPeriods.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Periode Program
          </h3>
          <div className="space-y-3">
            {program.programType === 'one_time' &&
              // One-time program: display period as current
              program.programPeriods.map(
                (period: Program['programPeriods'][0], index: number) => (
                  <div
                    key={period.id}
                    className="border-l-2 border-green-500 pl-4"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Periode Program
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(Number(period.currentAmount))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(period.startDate)} -{' '}
                      {formatDate(period.endDate)}
                    </p>
                  </div>
                )
              )}

            {program.programType === 'selected_date' &&
              // Selected date program: display all selected dates
              program.programPeriods.map(
                (period: Program['programPeriods'][0], index: number) => (
                  <div
                    key={period.id}
                    className="border-l-2 border-blue-500 pl-4"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Periode {index + 1}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(Number(period.currentAmount))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(period.startDate)} -{' '}
                      {formatDate(period.endDate)}
                    </p>
                  </div>
                )
              )}

            {program.programType === 'multiple' &&
              // Recurring program: display descriptive text about schedule
              program.programPeriods.map(
                (period: Program['programPeriods'][0], index: number) => (
                  <div
                    key={period.id}
                    className="border-l-2 border-purple-500 pl-4"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Penjadwalan
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(Number(period.currentAmount))}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatRecurringSchedule(period)}
                      </p>
                      {period.nextActivationDate && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Aktivasi berikutnya:{' '}
                          {formatDate(period.nextActivationDate)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Periode saat ini: {formatDate(period.startDate)} -{' '}
                        {formatDate(period.endDate)}
                      </p>
                    </div>
                  </div>
                )
              )}
          </div>
        </div>
      )}

      {/* Delete Button - Only show if user is the creator */}
      {session?.user?.id === program?.createdBy && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                disabled={deleteProgramMutation.isPending}
              >
                {deleteProgramMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2">
                      <Loader />
                    </div>
                    Menghapus...
                  </>
                ) : (
                  <>
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
                  className="bg-red-600 hover:bg-red-700"
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
