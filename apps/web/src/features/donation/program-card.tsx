'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Calendar, HandCoins, Users, Clock } from 'lucide-react';
import { DonationDrawer } from './donation-drawer';

interface Program {
  id: string;
  title: string;
  description: string;
  target: number;
  collected: number;
  progress: number;
  period: string;
  category: string;
  donorCount: number;
  endDate: string;
  status: string;
}

interface ProgramCardProps {
  program: Program;
  onDonationSubmit: (programId: string, amount: string) => void;
}

export function ProgramCard({ program, onDonationSubmit }: ProgramCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleDonate = () => {
    setIsDrawerOpen(true);
  };

  const handleDonationSubmit = (programId: string, amount: string) => {
    onDonationSubmit(programId, amount);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Pendidikan':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Kesehatan':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Keagamaan':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Bencana':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const daysLeft = Math.ceil(
    (new Date(program.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm py-0">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Program Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                    {program.title}
                  </h3>
                  <Badge
                    className={`text-xs ${getStatusColor(program.status)}`}
                  >
                    {program.status}
                  </Badge>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${getCategoryColor(program.category)}`}
                >
                  {program.category}
                </Badge>
              </div>
            </div>

            {/* Program Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {program.description}
            </p>

            {/* Program Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Target className="w-4 h-4" />
                <span>Target Rp {program.target.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{program.donorCount} donatur</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>
                  Selesai{' '}
                  {new Date(program.endDate).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>
                  {daysLeft > 0 ? `${daysLeft} hari lagi` : 'Berakhir'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={program.progress} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Terkumpul Rp {program.collected.toLocaleString('id-ID')}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {program.progress}%
                </span>
              </div>
            </div>

            {/* Donate Button */}
            <Button onClick={handleDonate} className="w-full">
              <HandCoins className="w-4 h-4 mr-2" />
              Donasi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Donation Drawer for this specific program */}
      <DonationDrawer
        program={program}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={handleDonationSubmit}
      />
    </>
  );
}
