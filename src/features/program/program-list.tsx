'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { ProgramListCard } from './program-list-card';

interface ProgramListProps {
  status?: 'all' | 'draft' | 'pending' | 'active' | 'paused' | 'ended';
  category?: string;
  onProgramSelect?: (programId: string) => void;
  className?: string;
}

export function ProgramList({
  status = 'all',
  category,
  onProgramSelect,
  className,
}: ProgramListProps) {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    // Invalidate and refetch the programs query
    await queryClient.invalidateQueries({
      queryKey: ['programs', status, category],
    });
  }, [queryClient, status, category]);

  return (
    <PullToRefresh onRefreshAction={handleRefresh}>
      <ProgramListCard
        status={status}
        category={category}
        onProgramSelect={onProgramSelect}
        className={className}
      />
    </PullToRefresh>
  );
}
