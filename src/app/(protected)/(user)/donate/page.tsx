'use client';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { History, Plus } from 'lucide-react';
import {
  DonationHistoryCard,
  type DonationHistoryItem,
} from '@/features/donation/donation-history-card';
import {
  DonationDetailDrawer,
  type DonationDetail,
} from '@/features/donation/donation-detail-drawer';

export default function DonatePage() {
  const { isPending } = authClient.useSession();
  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(
    null
  );

  const donationsQuery = useQuery(
    trpc.donation.getUserDonations.queryOptions()
  );

  const handleViewDetails = (donationId: string) => {
    setSelectedDonationId(donationId);
  };

  const handleCloseDrawer = () => {
    setSelectedDonationId(null);
  };

  if (isPending) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
          <div className="space-y-6">
            <Skeleton className="h-6 w-3/4" />
            <div className="grid grid-cols-1 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock data for testing - remove when real data is available
  const mockDonations: DonationHistoryItem[] = [
    {
      id: '1',
      amount: 500000,
      status: 'confirmed',
      donationReferenceNumber: 'REF001',
      createdAt: '2024-01-20T10:00:00Z',
      program: {
        id: '1',
        title: 'Bantu Pendidikan Anak',
        category: 'Pendidikan',
        bannerImage: null,
      },
      programPeriod: {
        id: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cycleNumber: 1,
      },
    },
    {
      id: '2',
      amount: 300000,
      status: 'confirmed',
      donationReferenceNumber: 'REF002',
      createdAt: '2024-01-18T14:30:00Z',
      program: {
        id: '2',
        title: 'Bantuan Makanan untuk Lansia',
        category: 'Sosial',
        bannerImage: null,
      },
      programPeriod: {
        id: '2',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cycleNumber: 1,
      },
    },
    {
      id: '3',
      amount: 1000000,
      status: 'confirmed',
      donationReferenceNumber: 'REF003',
      createdAt: '2024-01-15T09:15:00Z',
      program: {
        id: '3',
        title: 'Renovasi Masjid',
        category: 'Infrastruktur',
        bannerImage: null,
      },
      programPeriod: {
        id: '3',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cycleNumber: 1,
      },
    },
  ];

  // Mock detailed donation data for drawer
  const mockDonationDetails: Record<string, DonationDetail> = {
    '1': {
      id: '1',
      donorName: 'Ahmad Budiman',
      donorEmail: 'ahmad.budiman@email.com',
      donorPhone: '+6281234567890',
      amount: 500000,
      status: 'confirmed',
      donationReferenceNumber: 'REF001',
      bankAccountSender: '1234567890',
      bankAccountReceiver: '0987654321',
      transferDate: '2024-01-20T10:00:00Z',
      transferReference: 'TRF20240120001',
      adminNotes:
        'Donasi telah diverifikasi dan dikonfirmasi. Terima kasih atas partisipasinya.',
      verificationAttempts: 1,
      verifiedAt: '2024-01-20T11:30:00Z',
      createdAt: '2024-01-20T10:00:00Z',
      program: {
        id: '1',
        title: 'Bantu Pendidikan Anak',
        description:
          'Program untuk membantu pendidikan anak-anak yang kurang mampu dengan menyediakan beasiswa, buku, dan perlengkapan sekolah.',
        category: 'Pendidikan',
        bannerImage: null,
        targetAmount: 100000000,
      },
      programPeriod: {
        id: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cycleNumber: 1,
        currentAmount: 75000000,
      },
      donationProofs: [
        {
          id: '1',
          imagePath:
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
          imageName: 'bukti_transfer_001.jpg',
          fileSize: 245760,
          uploadedAt: '2024-01-20T10:05:00Z',
          isPrimary: true,
        },
        {
          id: '2',
          imagePath:
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
          imageName: 'screenshot_transfer_001.png',
          fileSize: 189440,
          uploadedAt: '2024-01-20T10:06:00Z',
          isPrimary: false,
        },
      ],
      verifiedByAdmin: {
        id: 'admin1',
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@berjamaah.org',
      },
    },
    '2': {
      id: '2',
      donorName: 'Ahmad Budiman',
      donorEmail: 'ahmad.budiman@email.com',
      donorPhone: '+6281234567890',
      amount: 300000,
      status: 'confirmed',
      donationReferenceNumber: 'REF002',
      bankAccountSender: '1234567890',
      bankAccountReceiver: '0987654321',
      transferDate: '2024-01-18T14:30:00Z',
      transferReference: 'TRF20240118002',
      adminNotes: null,
      verificationAttempts: 1,
      verifiedAt: '2024-01-18T15:45:00Z',
      createdAt: '2024-01-18T14:30:00Z',
      program: {
        id: '2',
        title: 'Bantuan Makanan untuk Lansia',
        description:
          'Program pemberian bantuan makanan bergizi untuk lansia yang membutuhkan di berbagai panti jompo dan komunitas.',
        category: 'Sosial',
        bannerImage: null,
        targetAmount: 50000000,
      },
      programPeriod: {
        id: '2',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cycleNumber: 1,
        currentAmount: 32000000,
      },
      donationProofs: [
        {
          id: '3',
          imagePath:
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
          imageName: 'bukti_transfer_002.jpg',
          fileSize: 198720,
          uploadedAt: '2024-01-18T14:35:00Z',
          isPrimary: true,
        },
      ],
      verifiedByAdmin: {
        id: 'admin2',
        name: 'Budi Santoso',
        email: 'budi.santoso@berjamaah.org',
      },
    },
    '3': {
      id: '3',
      donorName: 'Ahmad Budiman',
      donorEmail: 'ahmad.budiman@email.com',
      donorPhone: '+6281234567890',
      amount: 1000000,
      status: 'confirmed',
      donationReferenceNumber: 'REF003',
      bankAccountSender: '1234567890',
      bankAccountReceiver: '0987654321',
      transferDate: '2024-01-15T09:15:00Z',
      transferReference: 'TRF20240115003',
      adminNotes:
        'Donasi besar untuk renovasi masjid. Proses verifikasi membutuhkan waktu lebih lama karena nominal yang besar.',
      verificationAttempts: 2,
      verifiedAt: '2024-01-15T16:20:00Z',
      createdAt: '2024-01-15T09:15:00Z',
      program: {
        id: '3',
        title: 'Renovasi Masjid',
        description:
          'Program renovasi dan perbaikan masjid-masjid yang membutuhkan perbaikan infrastruktur, penambahan fasilitas, dan pemeliharaan.',
        category: 'Infrastruktur',
        bannerImage: null,
        targetAmount: 200000000,
      },
      programPeriod: {
        id: '3',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        cycleNumber: 1,
        currentAmount: 150000000,
      },
      donationProofs: [
        {
          id: '4',
          imagePath:
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
          imageName: 'bukti_transfer_003.jpg',
          fileSize: 312480,
          uploadedAt: '2024-01-15T09:20:00Z',
          isPrimary: true,
        },
        {
          id: '5',
          imagePath:
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
          imageName: 'screenshot_mbanking_003.png',
          fileSize: 156240,
          uploadedAt: '2024-01-15T09:22:00Z',
          isPrimary: false,
        },
        {
          id: '6',
          imagePath:
            'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
          imageName: 'receipt_transfer_003.jpg',
          fileSize: 278960,
          uploadedAt: '2024-01-15T09:25:00Z',
          isPrimary: false,
        },
      ],
      verifiedByAdmin: {
        id: 'admin1',
        name: 'Siti Nurhaliza',
        email: 'siti.nurhaliza@berjamaah.org',
      },
    },
  };

  const donations = mockDonations;

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Riwayat Donasi
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Lihat riwayat donasi Anda dan status verifikasinya.
            </p>
          </div>

          {/* Donation History List */}
          {donationsQuery.isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : donations.length === 0 ? (
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-0">
              <CardContent className="p-8 text-center">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Belum Ada Donasi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Anda belum melakukan donasi apapun. Mulai donasi pertama Anda
                  sekarang!
                </p>
                <Button className="bg-green-500 hover:bg-green-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Mulai Donasi
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {donations.map((donation: DonationHistoryItem) => (
                <DonationHistoryCard
                  key={donation.id}
                  donation={donation}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Donation Detail Drawer */}
      <DonationDetailDrawer
        donation={
          selectedDonationId ? mockDonationDetails[selectedDonationId] : null
        }
        isOpen={!!selectedDonationId}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
