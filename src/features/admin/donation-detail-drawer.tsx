'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatCurrency } from '@/lib/currency-utils';
import {
  CheckCircle,
  Clock,
  XCircle,
  Target,
  User,
  Mail,
  Phone,
  Building2,
  Image as ImageIcon,
  Eye,
  Calendar,
  CreditCard,
  Hash,
  Shield,
} from 'lucide-react';

export interface AdminDonationDetail {
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
  verifiedAt?: string | Date | null;
  program: {
    id: string;
    title: string;
    description: string;
    category?: string | null;
    bannerImage?: string | null;
    targetAmount: number | string;
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

interface AdminDonationDetailDrawerProps {
  donation: AdminDonationDetail | null;
  isOpen: boolean;
  onCloseAction: () => void;
  onVerify?: (donationId: string) => void;
  onReject?: (donationId: string) => void;
  onConfirm?: (donationId: string) => void;
}

export function AdminDonationDetailDrawer({
  donation,
  isOpen,
  onCloseAction,
  onVerify,
  onReject,
  onConfirm,
}: AdminDonationDetailDrawerProps) {
  const [imageError, setImageError] = useState(false);

  if (!donation) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200'
          >
            <Clock className='w-3 h-3 mr-1' />
            Menunggu Verifikasi
          </Badge>
        );
      case 'verified':
        return (
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-200'
          >
            <CheckCircle className='w-3 h-3 mr-1' />
            Terverifikasi
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200'
          >
            <CheckCircle className='w-3 h-3 mr-1' />
            Terkonfirmasi
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant='outline'
            className='bg-red-50 text-red-700 border-red-200'
          >
            <XCircle className='w-3 h-3 mr-1' />
            Ditolak
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={onCloseAction}>
      <DrawerContent className='max-h-[85vh] flex flex-col'>
        <div className='max-w-2xl mx-auto w-full px-4 flex-1 flex flex-col min-h-0'>
          <DrawerHeader className='pb-4 flex-shrink-0'>
            <div className='flex items-center justify-between'>
              <div>
                <DrawerTitle className='text-lg font-semibold'>
                  Detail Donasi
                </DrawerTitle>
                <DrawerDescription>
                  Informasi lengkap donasi dari {donation.donorName}
                </DrawerDescription>
              </div>
              {getStatusBadge(donation.status)}
            </div>
          </DrawerHeader>

          <div className='space-y-6 overflow-y-auto flex-1 min-h-0 pr-2'>
            {/* Donor Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <User className='w-4 h-4' />
                  Informasi Donatur
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='flex items-center gap-3'>
                    <User className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.donorName}
                      </p>
                      <p className='text-xs text-gray-500'>Nama Donatur</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.donorEmail}
                      </p>
                      <p className='text-xs text-gray-500'>Email</p>
                    </div>
                  </div>

                  {donation.donorPhone && (
                    <div className='flex items-center gap-3'>
                      <Phone className='w-4 h-4 text-gray-500' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {donation.donorPhone}
                        </p>
                        <p className='text-xs text-gray-500'>Nomor Telepon</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Donation Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Target className='w-4 h-4' />
                  Informasi Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-1 gap-3'>
                  <div className='flex items-center gap-3'>
                    <Hash className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.donationReferenceNumber}
                      </p>
                      <p className='text-xs text-gray-500'>Nomor Referensi</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <CreditCard className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {formatCurrency(Number(donation.amount))}
                      </p>
                      <p className='text-xs text-gray-500'>Jumlah Donasi</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Building2 className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {getPaymentMethodText(donation.paymentMethod)}
                      </p>
                      <p className='text-xs text-gray-500'>Metode Pembayaran</p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {formatDate(donation.createdAt)}
                      </p>
                      <p className='text-xs text-gray-500'>Tanggal Donasi</p>
                    </div>
                  </div>

                  {donation.verifiedAt && (
                    <div className='flex items-center gap-3'>
                      <Shield className='w-4 h-4 text-gray-500' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {formatDate(donation.verifiedAt)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Tanggal Verifikasi
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {donation.bankAccountSender && (
                  <div className='pt-3 border-t border-gray-100'>
                    <div className='flex items-center gap-3'>
                      <Building2 className='w-4 h-4 text-gray-500' />
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {donation.bankAccountSender}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Rekening Pengirim
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Information */}
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Target className='w-4 h-4' />
                  Program Donasi
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <h4 className='font-medium text-gray-900 mb-1'>
                    {donation.program.title}
                  </h4>
                  <p className='text-sm text-gray-600 mb-2'>
                    {donation.program.description}
                  </p>
                  {donation.program.category && (
                    <Badge variant='outline' className='text-xs'>
                      {donation.program.category}
                    </Badge>
                  )}
                </div>

                {donation.programPeriod && (
                  <div className='pt-3 border-t border-gray-100'>
                    <p className='text-sm font-medium text-gray-900 mb-1'>
                      Periode Program
                    </p>
                    <p className='text-sm text-gray-600'>
                      Siklus #{donation.programPeriod.cycleNumber} -{' '}
                      {donation.programPeriod.startDate &&
                      donation.programPeriod.endDate
                        ? `${formatDate(donation.programPeriod.startDate)} - ${formatDate(donation.programPeriod.endDate)}`
                        : 'Periode aktif'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Proof */}
            {donation.donationProofImage && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <ImageIcon className='w-4 h-4' />
                    Bukti Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='relative'>
                    {!imageError ? (
                      <img
                        src={donation.donationProofImage}
                        alt='Bukti Pembayaran'
                        className='w-full max-w-md mx-auto rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity'
                        onError={() => setImageError(true)}
                        onClick={() =>
                          window.open(donation.donationProofImage!, '_blank')
                        }
                      />
                    ) : (
                      <div className='w-full max-w-md mx-auto h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center'>
                        <div className='text-center text-gray-500'>
                          <ImageIcon className='w-8 h-8 mx-auto mb-2' />
                          <p className='text-sm'>Gagal memuat gambar</p>
                        </div>
                      </div>
                    )}
                    <div className='mt-2 text-center'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          window.open(donation.donationProofImage!, '_blank')
                        }
                        className='text-xs'
                      >
                        <Eye className='w-3 h-3 mr-1' />
                        Lihat Full Size
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Information */}
            {donation.verifiedByAdmin && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm font-medium flex items-center gap-2'>
                    <Shield className='w-4 h-4' />
                    Informasi Verifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex items-center gap-3'>
                    <User className='w-4 h-4 text-gray-500' />
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {donation.verifiedByAdmin.name ||
                          donation.verifiedByAdmin.email}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Diverifikasi oleh Admin
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className='flex gap-3 pt-4 pb-2'>
              <DrawerClose asChild>
                <Button variant='outline' className='flex-1'>
                  Tutup
                </Button>
              </DrawerClose>

              {donation.status === 'pending_verification' && (
                <>
                  {onVerify && (
                    <Button
                      onClick={() => onVerify(donation.id)}
                      className='flex-1 bg-green-500 hover:bg-green-600'
                    >
                      <CheckCircle className='w-4 h-4 mr-2' />
                      Verifikasi
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      onClick={() => onReject(donation.id)}
                      variant='outline'
                      className='flex-1 border-red-200 text-red-700 hover:bg-red-50'
                    >
                      <XCircle className='w-4 h-4 mr-2' />
                      Tolak
                    </Button>
                  )}
                </>
              )}

              {donation.status === 'verified' && onConfirm && (
                <Button
                  onClick={() => onConfirm(donation.id)}
                  className='flex-1 bg-blue-500 hover:bg-blue-600'
                >
                  <CheckCircle className='w-4 h-4 mr-2' />
                  Konfirmasi
                </Button>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
