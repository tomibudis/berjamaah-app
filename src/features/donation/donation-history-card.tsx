'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency-utils';

export interface DonationHistoryItem {
  id: string;
  amount: number;
  status: 'pending_verification' | 'verified' | 'confirmed' | 'rejected';
  donationReferenceNumber: string;
  createdAt: string;
  program: {
    id: string;
    title: string;
    category: string | null;
    bannerImage: string | null;
  };
  programPeriod: {
    id: string;
    startDate: string;
    endDate: string;
    cycleNumber: number | null;
  };
}

interface DonationHistoryCardProps {
  donation: DonationHistoryItem;
  onViewDetails?: (donationId: string) => void;
}

export function DonationHistoryCard({
  donation,
  onViewDetails,
}: DonationHistoryCardProps) {
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
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Card
      className={`border border-gray-200 dark:border-gray-700 shadow-sm bg-gray-50 dark:bg-gray-800 py-0 ${
        onViewDetails ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={() => onViewDetails?.(donation.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Title and Date */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
              {donation.program.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {formatDate(donation.createdAt)}
            </p>
          </div>

          {/* Right side - Amount and Status */}
          <div className="flex flex-col items-end space-y-1">
            <span className="font-semibold text-green-600 dark:text-green-500 text-sm">
              {formatCurrency(donation.amount)}
            </span>
            <Badge
              className={`text-xs px-2 py-1 ${getStatusColor(donation.status)}`}
            >
              {getStatusText(donation.status)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
