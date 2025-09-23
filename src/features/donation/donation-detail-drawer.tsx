'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatCurrency } from '@/lib/currency-utils';
import { trpc } from '@/utils/trpc';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Target,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';

export interface DonationDetail {
  id: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string | null;
  amount: number;
  status: 'pending_verification' | 'verified' | 'confirmed' | 'rejected';
  donationReferenceNumber: string;
  bankAccountSender: string | null;
  bankAccountReceiver: string | null;
  transferDate: string | null;
  transferReference: string | null;
  adminNotes: string | null;
  verificationAttempts: number;
  verifiedAt: string | null;
  createdAt: string;
  program: {
    id: string;
    title: string;
    description: string;
    category: string | null;
    bannerImage: string | null;
    targetAmount: number;
  };
  programPeriod: {
    id: string;
    startDate: string;
    endDate: string;
    cycleNumber: number | null;
    currentAmount: number;
  };
  donationProofImage?: string | null;
  verifiedByAdmin: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface DonationDetailDrawerProps {
  donationId: string | null;
  isOpen: boolean;
  onCloseAction: () => void;
}

export function DonationDetailDrawer({
  donationId,
  isOpen,
  onCloseAction,
}: DonationDetailDrawerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch donation details
  const { data: donationData, isLoading } =
    trpc.donation.getDonationById.useQuery(
      { id: donationId! },
      { enabled: !!donationId && isOpen }
    );

  // Transform data to match DonationDetail interface
  const donation = donationData
    ? {
        ...donationData,
        amount: Number(donationData.amount),
        status: donationData.status as
          | 'pending_verification'
          | 'verified'
          | 'confirmed'
          | 'rejected',
        transferDate: donationData.verifiedAt || null,
        transferReference: null,
        adminNotes: null,
        verificationAttempts: 1,
        program: {
          ...donationData.program,
          targetAmount: Number(donationData.program.targetAmount),
        },
        programPeriod: donationData.programPeriod
          ? {
              ...donationData.programPeriod,
              startDate: donationData.programPeriod.startDate || '',
              endDate: donationData.programPeriod.endDate || '',
              currentAmount: Number(
                donationData.programPeriod.currentAmount || 0
              ),
            }
          : {
              id: '',
              startDate: '',
              endDate: '',
              cycleNumber: null,
              currentAmount: 0,
            },
        verifiedByAdmin: donationData.verifiedByAdmin
          ? {
              ...donationData.verifiedByAdmin,
              name: donationData.verifiedByAdmin.name || 'Unknown',
            }
          : null,
      }
    : null;

  if (!donationId || !isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'confirmed':
        return <CheckCircle className='w-5 h-5' />;
      case 'pending_verification':
        return <Clock className='w-5 h-5' />;
      case 'rejected':
        return <XCircle className='w-5 h-5' />;
      default:
        return <AlertCircle className='w-5 h-5' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Terverifikasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'pending_verification':
        return 'Menunggu Verifikasi';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const progressPercentage = donation
    ? Math.round(
        (donation.programPeriod.currentAmount / donation.program.targetAmount) *
          100
      )
    : 0;

  return (
    <Drawer open={isOpen} onOpenChange={onCloseAction}>
      <DrawerContent className='max-h-[90vh]'>
        <DrawerHeader>
          <DrawerTitle className='text-lg font-semibold'>
            Detail Donasi
          </DrawerTitle>
          <DrawerDescription>Informasi lengkap donasi Anda</DrawerDescription>
        </DrawerHeader>

        <div className='px-4 pb-4 space-y-6 overflow-auto'>
          {isLoading ? (
            <div className='space-y-4'>
              <Skeleton className='h-48 w-full' />
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-32 w-full' />
              <Skeleton className='h-32 w-full' />
            </div>
          ) : donation ? (
            <>
              {/* Banner Image */}
              {donation.program.bannerImage && (
                <div className='w-full h-48 overflow-hidden rounded-lg'>
                  <img
                    src={donation.program.bannerImage}
                    alt={`Banner ${donation.program.title}`}
                    className='w-full h-full object-cover'
                    onError={e => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Status Badge */}
              <div className='flex items-center justify-center'>
                <Badge
                  className={`text-sm px-4 py-2 ${getStatusColor(donation.status)}`}
                >
                  <div className='flex items-center gap-2'>
                    {getStatusIcon(donation.status)}
                    {getStatusText(donation.status)}
                  </div>
                </Badge>
              </div>

              {/* Program Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Target className='w-4 h-4' />
                    Program Donasi
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <h3 className='font-semibold text-gray-900 dark:text-white'>
                      {donation.program.title}
                    </h3>
                    {donation.program.category && (
                      <Badge variant='outline' className='mt-1'>
                        {donation.program.category}
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {donation.program.description}
                  </p>
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Target:
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(donation.program.targetAmount)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Terkumpul:
                      </span>
                      <span className='font-medium'>
                        {formatCurrency(donation.programPeriod.currentAmount)}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600 dark:text-gray-400'>
                        Progress:
                      </span>
                      <span className='font-medium'>{progressPercentage}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Donation Details */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <FileText className='w-4 h-4' />
                    Detail Donasi
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Jumlah:
                      </span>
                      <p className='font-semibold text-green-600 dark:text-green-500'>
                        {formatCurrency(donation.amount)}
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        No. Referensi:
                      </span>
                      <p className='font-mono text-sm'>
                        {donation.donationReferenceNumber}
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Tanggal Donasi:
                      </span>
                      <p className='text-sm'>
                        {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    {donation.verifiedAt && (
                      <div>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Tanggal Verifikasi:
                        </span>
                        <p className='text-sm'>
                          {formatDate(donation.verifiedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Donor Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <User className='w-4 h-4' />
                    Informasi Donatur
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <User className='w-4 h-4 text-gray-500' />
                    <span className='text-sm'>{donation.donorName}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    <span className='text-sm'>{donation.donorEmail}</span>
                  </div>
                  {donation.donorPhone && (
                    <div className='flex items-center gap-2'>
                      <Phone className='w-4 h-4 text-gray-500' />
                      <span className='text-sm'>{donation.donorPhone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transfer Information */}
              {(donation.bankAccountSender ||
                donation.transferReference ||
                donation.transferDate) && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <Building2 className='w-4 h-4' />
                      Informasi Transfer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {donation.bankAccountSender && (
                      <div>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Rekening Pengirim:
                        </span>
                        <p className='text-sm font-mono'>
                          {donation.bankAccountSender}
                        </p>
                      </div>
                    )}
                    {donation.transferReference && (
                      <div>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Referensi Transfer:
                        </span>
                        <p className='text-sm font-mono'>
                          {donation.transferReference}
                        </p>
                      </div>
                    )}
                    {donation.transferDate && (
                      <div>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          Tanggal Transfer:
                        </span>
                        <p className='text-sm'>
                          {formatDate(donation.transferDate)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              {donation.adminNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Catatan Admin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription>{donation.adminNotes}</AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              )}

              {/* Verification Information */}
              {donation.verifiedByAdmin && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>Verifikasi</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <div>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Diverifikasi oleh:
                      </span>
                      <p className='text-sm font-medium'>
                        {donation.verifiedByAdmin.name}
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Email:
                      </span>
                      <p className='text-sm'>
                        {donation.verifiedByAdmin.email}
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>
                        Percobaan Verifikasi:
                      </span>
                      <p className='text-sm'>{donation.verificationAttempts}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Donation Proof (single image) */}
              {donation.donationProofImage && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <ImageIcon className='w-4 h-4' />
                      Bukti Transfer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-3'>
                      <div className='space-y-2'>
                        <div className='relative'>
                          <img
                            src={donation.donationProofImage}
                            alt='Bukti Transfer'
                            className='w-full h-40 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity'
                            onClick={() =>
                              setSelectedImage(donation.donationProofImage!)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Image Modal */}
              {selectedImage && (
                <div className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'>
                  <div className='relative max-w-4xl max-h-full'>
                    <img
                      src={selectedImage}
                      alt='Bukti Transfer'
                      className='max-w-full max-h-full object-contain rounded-lg'
                    />
                    <Button
                      variant='outline'
                      size='sm'
                      className='absolute top-4 right-4'
                      onClick={() => setSelectedImage(null)}
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-8'>
              <p className='text-gray-500'>Donasi tidak ditemukan</p>
            </div>
          )}
        </div>

        <div className='px-4 pb-4'>
          <DrawerClose asChild>
            <Button variant='outline' className='w-full'>
              Tutup
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
