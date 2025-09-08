'use client';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  Eye,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);

  // Check if user is admin
  const isAdmin = session?.user?.role === 'admin';

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await authClient.admin.listUsers({
        query: {
          limit: 50,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
      });

      if (data) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadPrograms = async () => {
    setIsLoadingPrograms(true);
    try {
      // Mock program data - replace with actual API call
      const mockPrograms = [
        {
          id: '1',
          title: 'Bantu Pendidikan Anak',
          description: 'Program beasiswa untuk anak kurang mampu',
          targetAmount: 50000000,
          collectedAmount: 26500000,
          status: 'active',
          needsConfirmation: 1500000,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Bantuan Makanan untuk Lansia',
          description: 'Program bantuan makanan untuk lansia yang membutuhkan',
          targetAmount: 30000000,
          collectedAmount: 12000000,
          status: 'active',
          needsConfirmation: 500000,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Renovasi Masjid',
          description: 'Program renovasi masjid untuk keperluan ibadah',
          targetAmount: 100000000,
          collectedAmount: 75000000,
          status: 'completed',
          needsConfirmation: 0,
          createdAt: new Date().toISOString(),
        },
      ];
      setPrograms(mockPrograms);
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

  const handleBanUser = async (userId: string) => {
    try {
      await authClient.admin.banUser({
        userId,
        banReason: 'Banned by admin',
      });
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await authClient.admin.unbanUser({
        userId,
      });
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleSetRole = async (userId: string, role: 'user' | 'admin') => {
    try {
      await authClient.admin.setRole({
        userId,
        role,
      });
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error setting role:', error);
    }
  };

  if (isPending) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
          <div className="space-y-6">
            <Skeleton className="h-6 w-3/4" />
            <div className="grid grid-cols-1 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return router.replace('/'); // Will redirect
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dashboard Admin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kelola pengguna dan pengaturan sistem
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admin
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-2">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Total Pengguna
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Pengguna terdaftar
                  </p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-2">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Total Admin
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Pengguna admin
                  </p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {users.filter(user => user.role === 'admin').length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-2">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Total Program
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Program aktif
                  </p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {programs.length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-2">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Data Butuh Dikonfirmasi
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    Menunggu konfirmasi
                  </p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    9
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Confirmation Management */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manajemen Konfirmasi
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Kelola konfirmasi dana dan program yang memerlukan persetujuan
            </p>

            <Tabs defaultValue="dana" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dana" className="flex items-center gap-2">
                  Konfirmasi Dana
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    3
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="program"
                  className="flex items-center gap-2"
                >
                  Konfirmasi Program
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    2
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dana" className="mt-4">
                <div className="space-y-3">
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
                      className="border border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                {payment.donorName}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Program: {payment.programTitle}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {payment.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Jumlah: {formatCurrency(payment.amount)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                Metode: {payment.paymentMethod}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Tanggal:{' '}
                              {new Date(payment.paymentDate).toLocaleDateString(
                                'id-ID'
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="text-xs px-3 py-1 h-auto bg-green-500 hover:bg-green-600"
                            >
                              Konfirmasi
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 py-1 h-auto"
                            >
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 py-1 h-auto"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="program" className="mt-4">
                <div className="space-y-3">
                  {/* Mock program approval data */}
                  {[
                    {
                      id: '1',
                      title: 'Bantuan Korban Bencana',
                      description:
                        'Program bantuan untuk korban banjir di Jakarta',
                      targetAmount: 75000000,
                      organizer: 'Yayasan Peduli Jakarta',
                      submittedDate: '2024-01-15',
                      status: 'pending',
                    },
                    {
                      id: '2',
                      title: 'Beasiswa Anak Yatim',
                      description: 'Program beasiswa untuk anak yatim piatu',
                      targetAmount: 50000000,
                      organizer: 'Panti Asuhan Al-Hidayah',
                      submittedDate: '2024-01-14',
                      status: 'pending',
                    },
                  ].map(program => (
                    <Card
                      key={program.id}
                      className="border border-gray-200 dark:border-gray-700"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                {program.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {program.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {program.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Target: {formatCurrency(program.targetAmount)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                Organizer: {program.organizer}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Dikirim:{' '}
                              {new Date(
                                program.submittedDate
                              ).toLocaleDateString('id-ID')}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="text-xs px-3 py-1 h-auto bg-green-500 hover:bg-green-600"
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 py-1 h-auto"
                            >
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-3 py-1 h-auto"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
