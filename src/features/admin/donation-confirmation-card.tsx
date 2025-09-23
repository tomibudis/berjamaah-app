'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { useCallback, useState } from 'react';
import { useTRPCClient } from '@/utils/trpc';
import { toast } from 'sonner';
import {
  AdminDonationDetailDrawer,
  AdminDonationDetail,
} from './donation-detail-drawer';

interface DonationConfirmationCardProps {
  donation: {
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
  };
  onStatusChange?: () => void;
}

export function DonationConfirmationCard({
  donation,
  onStatusChange,
}: DonationConfirmationCardProps) {
  const trpcClient = useTRPCClient();
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  const handleVerify = useCallback(async () => {
    try {
      await trpcClient.donation.verifyDonation.mutate({
        donationId: donation.id,
        action: 'verify',
      });

      toast.success('Donasi berhasil diverifikasi');
      onStatusChange?.();
    } catch (error) {
      console.error('Error verifying donation:', error);
      toast.error('Gagal memverifikasi donasi');
    }
  }, [donation.id, trpcClient, onStatusChange]);

  const handleReject = useCallback(async () => {
    try {
      await trpcClient.donation.verifyDonation.mutate({
        donationId: donation.id,
        action: 'reject',
      });

      toast.success('Donasi ditolak');
      onStatusChange?.();
    } catch (error) {
      console.error('Error rejecting donation:', error);
      toast.error('Gagal menolak donasi');
    }
  }, [donation.id, trpcClient, onStatusChange]);

  const handleConfirm = useCallback(async () => {
    try {
      await trpcClient.donation.confirmDonation.mutate({
        donationId: donation.id,
      });

      toast.success('Donasi berhasil dikonfirmasi');
      onStatusChange?.();
      setIsDetailDrawerOpen(false);
    } catch (error) {
      console.error('Error confirming donation:', error);
      toast.error('Gagal mengkonfirmasi donasi');
    }
  }, [donation.id, trpcClient, onStatusChange]);

  const handleVerifyFromDrawer = useCallback(
    async (donationId: string) => {
      try {
        await trpcClient.donation.verifyDonation.mutate({
          donationId,
          action: 'verify',
        });

        toast.success('Donasi berhasil diverifikasi');
        onStatusChange?.();
        setIsDetailDrawerOpen(false);
      } catch (error) {
        console.error('Error verifying donation:', error);
        toast.error('Gagal memverifikasi donasi');
      }
    },
    [trpcClient, onStatusChange]
  );

  const handleRejectFromDrawer = useCallback(
    async (donationId: string) => {
      try {
        await trpcClient.donation.verifyDonation.mutate({
          donationId,
          action: 'reject',
        });

        toast.success('Donasi ditolak');
        onStatusChange?.();
        setIsDetailDrawerOpen(false);
      } catch (error) {
        console.error('Error rejecting donation:', error);
        toast.error('Gagal menolak donasi');
      }
    },
    [trpcClient, onStatusChange]
  );

  const handleConfirmFromDrawer = useCallback(
    async (donationId: string) => {
      try {
        await trpcClient.donation.confirmDonation.mutate({
          donationId,
        });

        toast.success('Donasi berhasil dikonfirmasi');
        onStatusChange?.();
        setIsDetailDrawerOpen(false);
      } catch (error) {
        console.error('Error confirming donation:', error);
        toast.error('Gagal mengkonfirmasi donasi');
      }
    },
    [trpcClient, onStatusChange]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            Menunggu Verifikasi
          </Badge>
        );
      case 'verified':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-blue-50 text-blue-700 border-blue-200'
          >
            Terverifikasi
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-green-50 text-green-700 border-green-200'
          >
            Terkonfirmasi
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='outline'
            className='text-xs bg-red-50 text-red-700 border-red-200'
          >
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge variant='outline' className='text-xs'>
            {status}
          </Badge>
        );
    }
  };

  const getPaymentMethodText = (method?: string | null) => {
    switch (method) {
      case 'bank_transfer':
        return 'Transfer Bank';
      case 'digital_wallet':
        return 'E-Wallet';
      case 'qris':
        return 'QRIS';
      default:
        return method || 'Tidak Diketahui';
    }
  };

  return (
    <>
      <Card className='border border-gray-200 dark:border-gray-700 py-0'>
        <CardContent className='p-4'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='font-semibold text-gray-900 dark:text-white text-base'>
                  {donation.donorName}
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Program: {donation.program.title}
                </p>
              </div>
              {getStatusBadge(donation.status)}
            </div>

            <div className='space-y-2'>
              <div className='flex justify-between text-sm'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Jumlah: {formatCurrency(Number(donation.amount))}
                </span>
                <span className='text-gray-600 dark:text-gray-400'>
                  Metode: {getPaymentMethodText(donation.paymentMethod)}
                </span>
              </div>

              {donation.donationReferenceNumber && (
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Ref: {donation.donationReferenceNumber}
                </div>
              )}

              <div className='text-sm text-gray-600 dark:text-gray-400'>
                Tanggal:{' '}
                {new Date(donation.createdAt).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {donation.bankAccountSender && (
                <div className='text-sm text-gray-600 dark:text-gray-400'>
                  Dari: {donation.bankAccountSender}
                </div>
              )}
            </div>

            <div className='flex gap-2'>
              {donation.status === 'pending_verification' && (
                <>
                  <Button
                    size='sm'
                    onClick={handleVerify}
                    className='text-xs px-3 py-1 h-auto bg-green-500 hover:bg-green-600'
                  >
                    <CheckCircle className='w-3 h-3 mr-1' />
                    Verifikasi
                  </Button>
                  <Button
                    size='sm'
                    onClick={handleReject}
                    variant='outline'
                    className='text-xs px-3 py-1 h-auto border-red-200 text-red-700 hover:bg-red-50'
                  >
                    <XCircle className='w-3 h-3 mr-1' />
                    Tolak
                  </Button>
                </>
              )}

              {donation.status === 'verified' && (
                <Button
                  size='sm'
                  onClick={handleConfirm}
                  className='text-xs px-3 py-1 h-auto bg-blue-500 hover:bg-blue-600'
                >
                  <CheckCircle className='w-3 h-3 mr-1' />
                  Konfirmasi
                </Button>
              )}

              <Button
                size='sm'
                variant='outline'
                className='text-xs px-3 py-1 h-auto'
                onClick={() => setIsDetailDrawerOpen(true)}
              >
                <Eye className='w-3 h-3 mr-1' />
                Detail
              </Button>
            </div>

            {donation.verifiedByAdmin && (
              <div className='text-xs text-gray-500 pt-2 border-t border-gray-100'>
                Diverifikasi oleh:{' '}
                {donation.verifiedByAdmin.name ||
                  donation.verifiedByAdmin.email}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Donation Detail Drawer */}
      <AdminDonationDetailDrawer
        donation={donation as AdminDonationDetail}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onVerify={handleVerifyFromDrawer}
        onReject={handleRejectFromDrawer}
        onConfirm={handleConfirmFromDrawer}
      />
    </>
  );
}
