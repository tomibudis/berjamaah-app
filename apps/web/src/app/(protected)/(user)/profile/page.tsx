'use client';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  Heart,
  Settings,
  LogOut,
  Edit3,
  Shield,
  CreditCard,
  History,
  Bell,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const { signOut } = authClient;

  const privateData = useQuery(trpc.privateData.queryOptions());

  if (isPending) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mock user data - replace with actual API call
  const userStats = {
    totalDonations: 5,
    totalAmount: 2500000,
    favoriteCategory: 'Pendidikan',
    memberSince: '2024-01-15',
  };

  const recentDonations = [
    {
      id: '1',
      programTitle: 'Bantu Pendidikan Anak',
      amount: 500000,
      date: '2024-01-20',
      status: 'confirmed',
    },
    {
      id: '2',
      programTitle: 'Bantuan Makanan untuk Lansia',
      amount: 300000,
      date: '2024-01-18',
      status: 'confirmed',
    },
    {
      id: '3',
      programTitle: 'Renovasi Masjid',
      amount: 1000000,
      date: '2024-01-15',
      status: 'confirmed',
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {session?.user?.name || 'User'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session?.user?.email}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    {session?.user?.role || 'user'}
                  </Badge>
                </div>
                {/* <Button variant="outline" size="sm">
                  <Edit3 className="w-4 h-4" />
                </Button> */}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Informasi Akun</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Email
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Bergabung Sejak
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(userStats.memberSince).toLocaleDateString(
                      'id-ID'
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings Menu */}
          <div className="space-y-3">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
