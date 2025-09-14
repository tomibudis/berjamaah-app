'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trpcClient } from '@/utils/trpc';
import Loader from '@/components/shared/loader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface Program {
  id: string;
  title: string;
  description: string;
  targetAmount: string;
  category: string | null;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'ended' | 'rejected';
  programType: 'one_time' | 'multiple' | 'selected_date';
  contact?: string | null;
  details?: string | null;
  bannerImage?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  programPeriods: Array<{
    id: string;
    startDate: string;
    endDate: string;
    currentAmount: string;
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

interface ProgramConfirmationDrawerProps {
  programId: string;
  isOpen: boolean;
  onClose: () => void;
  onApprovalChange?: () => void;
}

export function ProgramConfirmationDrawer({
  programId,
  isOpen,
  onClose,
  onApprovalChange,
}: ProgramConfirmationDrawerProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const queryClient = useQueryClient();

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

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await trpcClient.program.approveProgram.mutate({ id });
    },
    onSuccess: () => {
      toast.success('Program berhasil disetujui');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['draftPrograms'] });
      onApprovalChange?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menyetujui program');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      return await trpcClient.program.rejectProgram.mutate({ id, reason });
    },
    onSuccess: () => {
      toast.success('Program berhasil ditolak');
      queryClient.invalidateQueries({ queryKey: ['programs'] });
      queryClient.invalidateQueries({ queryKey: ['draftPrograms'] });
      onApprovalChange?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gagal menolak program');
    },
  });

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
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
        return 'Menunggu Persetujuan';
      case 'pending':
        return 'Menunggu Aktivasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return 'Tidak Diketahui';
    }
  };

  const handleApprove = () => {
    if (program) {
      approveMutation.mutate(program.id);
    }
  };

  const handleReject = () => {
    if (program) {
      rejectMutation.mutate({
        id: program.id,
        reason: rejectionReason || undefined,
      });
    }
  };

  const handleRejectClick = () => {
    setIsRejecting(true);
  };

  const handleCancelReject = () => {
    setIsRejecting(false);
    setRejectionReason('');
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

  const isDraft = program.status === 'draft';

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
              {program.category || 'Tidak ada'}
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

        {/* Approval/Rejection Info */}
        {program.approvedBy && program.approvedAt && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-green-800 dark:text-green-200 text-sm mb-1">
              Disetujui oleh Admin
            </h4>
            <p className="text-sm text-green-600 dark:text-green-400">
              {formatDate(program.approvedAt)}
            </p>
          </div>
        )}

        {program.rejectedBy && program.rejectedAt && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 text-sm mb-1">
              Ditolak oleh Admin
            </h4>
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">
              {formatDate(program.rejectedAt)}
            </p>
            {program.rejectionReason && (
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>Alasan:</strong> {program.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Program Periods */}
      {program.programPeriods.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Periode Program
          </h3>
          <div className="space-y-3">
            {program.programPeriods.map(
              (period: Program['programPeriods'][0], index: number) => (
                <div
                  key={period.id}
                  className="border-l-2 border-green-500 pl-4"
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
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {isDraft && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {!isRejecting ? (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {approveMutation.isPending ? 'Menyetujui...' : 'Setujui'}
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={rejectMutation.isPending}
                variant="outline"
                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Tolak
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label
                  htmlFor="rejection-reason"
                  className="text-sm font-medium"
                >
                  Alasan Penolakan (Opsional)
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Masukkan alasan penolakan program..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {rejectMutation.isPending ? 'Menolak...' : 'Tolak Program'}
                </Button>
                <Button
                  onClick={handleCancelReject}
                  variant="outline"
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
