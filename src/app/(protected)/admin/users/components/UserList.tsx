'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { UserListCard } from './UserListCard';

interface UserListProps {
  search?: string;
  status?: 'all' | 'scheduled' | 'pending' | 'active';
  role?: 'all' | 'admin' | 'user';
  className?: string;
}

export function UserList({
  search,
  status = 'all',
  role = 'all',
  className,
}: UserListProps) {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    // Invalidate and refetch the users query
    await queryClient.invalidateQueries({
      queryKey: ['users', search, status, role],
    });
  }, [queryClient, search, status, role]);

  return (
    <PullToRefresh onRefreshAction={handleRefresh}>
      <UserListCard
        search={search}
        status={status}
        role={role}
        className={className}
      />
    </PullToRefresh>
  );
}
