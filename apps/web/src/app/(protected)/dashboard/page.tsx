'use client';
import { authClient } from '@/lib/auth-client';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, Calendar, Heart } from 'lucide-react';

export default function Dashboard() {
  const { isPending } = authClient.useSession();

  const privateData = useQuery(trpc.privateData.queryOptions());

  if (isPending) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
          <div className="space-y-6">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Mobile-first container with max-width for desktop */}
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Daftar Program Aktif Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Daftar Program Aktif
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Pilih program yang diminati lalu lakukan donasi.
            </p>

            {/* Program Card */}
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Program Title */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      Bantu Pendidikan Anak
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Program beasiswa untuk anak kurang mampu. Donasi Anda
                      membantu biaya buku, seragam, dan uang sekolah.
                    </p>
                  </div>

                  {/* Target and Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Target className="w-4 h-4" />
                      <span>Target Rp 50.000.000</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Sep-Nov 2025</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress value={53} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Terkumpul Rp 26.500.000
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        53%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail Program Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Detail Program
            </h2>
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Program beasiswa untuk anak kurang mampu. Donasi Anda membantu
                  biaya buku, seragam, dan uang sekolah.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                    Donasi
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Kembali
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info (remove in production) */}
          {privateData.isSuccess && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  API connection successful
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
