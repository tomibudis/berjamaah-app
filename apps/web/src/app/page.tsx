'use client';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { ProgramCard } from '@/features/donation/program-card';
import { authClient } from '@/lib/auth-client';
import BottomNavigationUser from '@/components/layout/bottom-navigation-user';

export default function Home() {
  const healthCheck = useQuery(trpc.healthCheck.queryOptions());
  const { data: session, isPending } = authClient.useSession();

  const handleDonationSubmit = (programId: string, amount: string) => {
    // TODO: Implement actual donation submission
    console.log('Donating:', {
      programId,
      amount,
    });
  };

  // Mock programs data
  const programs = [
    {
      id: '1',
      title: 'Bantu Pendidikan Anak',
      description:
        'Program beasiswa untuk anak kurang mampu. Donasi Anda membantu biaya buku, seragam, dan uang sekolah.',
      target: 50000000,
      collected: 26500000,
      progress: 53,
      period: 'Sep-Nov 2025',
      category: 'Pendidikan',
      donorCount: 156,
      endDate: '2025-11-30',
      status: 'active',
    },
    {
      id: '2',
      title: 'Bantuan Makanan Lansia',
      description:
        'Program donasi untuk menyediakan makanan bergizi bagi lansia yang membutuhkan di panti jompo.',
      target: 30000000,
      collected: 12000000,
      progress: 40,
      period: 'Okt-Des 2025',
      category: 'Kesehatan',
      donorCount: 89,
      endDate: '2025-12-15',
      status: 'active',
    },
    {
      id: '3',
      title: 'Bantuan Korban Bencana',
      description:
        'Program donasi untuk membantu korban bencana alam dengan kebutuhan dasar seperti makanan dan pakaian.',
      target: 100000000,
      collected: 35000000,
      progress: 35,
      period: 'Nov 2025 - Jan 2026',
      category: 'Bencana',
      donorCount: 234,
      endDate: '2026-01-31',
      status: 'active',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      <div
        className={`mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg ${
          session && !isPending ? 'pb-20' : ''
        }`}
      >
        <div className="space-y-6">
          {/* Daftar Program Aktif Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Daftar Program Aktif
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Pilih program yang diminati lalu lakukan donasi.
            </p>

            {/* Program Cards */}
            <div className="space-y-4">
              {programs.map(program => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onDonationSubmit={handleDonationSubmit}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Only show if user is logged in */}
      {session && !isPending && <BottomNavigationUser />}
    </div>
  );
}
