'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye } from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { trpcClient } from '@/utils/trpc';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [users, setUsers] = useState<any[]>([]);
  const [, setIsLoadingUsers] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [programs, setPrograms] = useState<any[]>([]);
  const [, setIsLoadingPrograms] = useState(false);

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // TODO: Implement user listing with tRPC
      console.log('Loading users...');
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      const data = await trpcClient.program.getAll.query({
        limit: 50,
        offset: 0,
      });

      setPrograms(data.programs || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setIsLoadingPrograms(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadPrograms();
    }
  }, [isAdmin]);

  if (status === 'loading') {
    return (
      <div className='bg-white dark:bg-gray-900'>
        <div className='mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg'>
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
        <div className='grid grid-cols-3 gap-4'>
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
                  {users.filter(user => user.role === 'admin').length}
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

        {/* Fund Confirmation Management */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>
                Konfirmasi Dana
              </h2>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Kelola konfirmasi dana yang memerlukan persetujuan
              </p>
            </div>
            <Badge
              variant='secondary'
              className='h-6 w-6 rounded-full p-0 text-xs flex items-center justify-center'
            >
              3
            </Badge>
          </div>

          <div className='space-y-3'>
            {/* Mock donor payment data */}
            {[
              {
                id: '1',
                donorName: 'Ahmad Fauzi',
                programTitle: 'Bantu Pendidikan Anak',
                amount: 500000,
                paymentMethod: 'Bank Transfer',
                paymentDate: '2024-01-15',
                status: 'pending',
              },
              {
                id: '2',
                donorName: 'Siti Nurhaliza',
                programTitle: 'Bantuan Makanan untuk Lansia',
                amount: 250000,
                paymentMethod: 'E-Wallet',
                paymentDate: '2024-01-14',
                status: 'pending',
              },
              {
                id: '3',
                donorName: 'Budi Santoso',
                programTitle: 'Renovasi Masjid',
                amount: 1000000,
                paymentMethod: 'Bank Transfer',
                paymentDate: '2024-01-13',
                status: 'pending',
              },
            ].map(payment => (
              <Card
                key={payment.id}
                className='border border-gray-200 dark:border-gray-700 py-0'
              >
                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <h3 className='font-semibold text-gray-900 dark:text-white text-base'>
                          {payment.donorName}
                        </h3>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          Program: {payment.programTitle}
                        </p>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        {payment.status}
                      </Badge>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Jumlah: {formatCurrency(payment.amount)}
                        </span>
                        <span className='text-gray-600 dark:text-gray-400'>
                          Metode: {payment.paymentMethod}
                        </span>
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400'>
                        Tanggal:{' '}
                        {new Date(payment.paymentDate).toLocaleDateString(
                          'id-ID'
                        )}
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        className='text-xs px-3 py-1 h-auto bg-green-500 hover:bg-green-600'
                      >
                        Konfirmasi
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='text-xs px-3 py-1 h-auto'
                      >
                        Tolak
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='text-xs px-3 py-1 h-auto'
                      >
                        <Eye className='w-3 h-3 mr-1' />
                        Detail
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
