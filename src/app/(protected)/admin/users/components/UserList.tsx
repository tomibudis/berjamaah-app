'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { UserListCard } from './UserListCard';

interface UserListProps {
  search?: string;
  status?: 'all' | 'scheduled' | 'pending' | 'active';
  role?: 'all' | 'admin' | 'user';
  onUserSelect?: (userId: string) => void;
  className?: string;
}

export function UserList({
  search,
  status = 'all',
  role = 'all',
  onUserSelect,
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
        onUserSelect={onUserSelect}
        className={className}
      />
    </PullToRefresh>
  );
}
