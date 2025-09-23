'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';
import { DonationConfirmationList } from '@/features/admin/donation-confirmation-list';
import { useQuery } from '@tanstack/react-query';
import { useTRPCClient } from '@/utils/trpc';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const trpcClient = useTRPCClient();

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  // Use TanStack Query for users data
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      if (!isAdmin)
        return {
          users: [],
          stats: { total: 0, active: 0, pending: 0, scheduled: 0 },
        };

      try {
        return await trpcClient.user.getAllUsers.query({
          page: 1,
          limit: 100,
          status: 'all',
          role: 'all',
        });
      } catch (error) {
        console.error('Error loading users:', error);
        return {
          users: [],
          stats: { total: 0, active: 0, pending: 0, scheduled: 0 },
        };
      }
    },
    enabled: isAdmin,
  });

  // Use TanStack Query for programs data
  const { data: programsData, isLoading: isLoadingPrograms } = useQuery({
    queryKey: ['admin-programs'],
    queryFn: async () => {
      if (!isAdmin) return { programs: [] };

      try {
        return await trpcClient.program.getAll.query({
          limit: 50,
          offset: 0,
        });
      } catch (error) {
        console.error('Error loading programs:', error);
        return { programs: [] };
      }
    },
    enabled: isAdmin,
  });

  const users = usersData?.users || [];
  const programs = programsData?.programs || [];

  if (
    status === 'loading' ||
    (isAdmin && (isLoadingUsers || isLoadingPrograms))
  ) {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='space-y-6'>
          <Skeleton className='h-6 w-3/4' />
          <div className='grid grid-cols-1 gap-4'>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className='h-24 w-full' />
            ))}
          </div>
          <Skeleton className='h-64 w-full' />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return router.replace('/'); // Will redirect
  }

  return (
    <div>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
              Dashboard Admin
            </h1>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Kelola pengguna dan pengaturan sistem
            </p>
          </div>
          <Badge variant='outline' className='flex items-center gap-2'>
            <Shield className='w-4 h-4' />
            Admin
          </Badge>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4'>
          <Card className='border border-gray-200 dark:border-gray-700 shadow-sm py-2'>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Total Pengguna
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Pengguna terdaftar
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {users.length}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 dark:border-gray-700 shadow-sm py-2'>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Total Admin
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Pengguna admin
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {
                    users.filter(
                      (user: { role: string }) => user.role === 'admin'
                    ).length
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-gray-200 dark:border-gray-700 shadow-sm py-2'>
            <CardContent className='p-4'>
              <div className='text-center'>
                <p className='text-sm font-medium text-gray-900 dark:text-white mb-1'>
                  Total Program
                </p>
                <p className='text-xs text-gray-600 dark:text-gray-400 mb-2'>
                  Program aktif
                </p>
                <div className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {programs.length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Confirmation Management */}
        <DonationConfirmationList status='pending_verification' />
      </div>
    </div>
  );
}
