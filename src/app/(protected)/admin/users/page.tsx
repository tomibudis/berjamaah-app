'use client';

import * as React from 'react';
import { Suspense } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useQueryParams } from '@/hooks/use-query-params';
import { trpc } from '@/utils/trpc';
import { UserFilters } from './types';
import {
  UsersHeader,
  SearchInput,
  StatusSelect,
  RoleSelect,
} from './components';
import { UserList } from './components/UserList';
import Loader from '@/components/shared/loader';

function UsersPageContent() {
  const router = useRouter();
  // URL State Management
  const [queryParams, setQueryParams] = useQueryParams<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
  });

  // tRPC query for users stats only
  const {
    data: statsData,
    isLoading: isStatsLoading,
    error: statsError,
  } = trpc.user.getUserStats.useQuery();

  // Extract stats with fallbacks
  const totalUsers = statsData?.total || 0;
  const activeUsers = statsData?.active || 0;
  const pendingUsers = statsData?.pending || 0;
  const scheduledUsers = statsData?.scheduled || 0;

  // Filter handlers
  const handleSearch = (value: string) => {
    setQueryParams({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setQueryParams({
      status: value as 'all' | 'scheduled' | 'pending' | 'active',
    });
  };

  const handleRoleFilter = (value: string) => {
    setQueryParams({ role: value as 'all' | 'admin' | 'user' });
  };

  // User actions
  const handleCreateUser = () => {
    router.push('/admin/users/add' as Route);
  };

  // Handle error state
  if (statsError) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Error Loading User Stats
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            {statsError.message ||
              'Something went wrong while loading user statistics.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex flex-col gap-4'>
        <UsersHeader
          onCreateUserAction={handleCreateUser}
          totalUsers={totalUsers}
          activeUsers={activeUsers}
          pendingUsers={pendingUsers}
          scheduledUsers={scheduledUsers}
        />
        <div className='flex flex-col gap-4'>
          <SearchInput
            value={queryParams.search}
            onChangeAction={handleSearch}
          />
          <div className='flex gap-4'>
            <StatusSelect
              value={queryParams.status}
              onChange={handleStatusFilter}
            />
            <RoleSelect value={queryParams.role} onChange={handleRoleFilter} />
          </div>
        </div>
      </div>
      <div className='flex-1'>
        {isStatsLoading && <Loader />}

        {!isStatsLoading && (
          <UserList
            search={queryParams.search}
            status={queryParams.status}
            role={queryParams.role}
            onUserSelect={userId => {
              // Handle user selection if needed
              console.log('Selected user:', userId);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<Loader />}>
      <UsersPageContent />
    </Suspense>
  );
}
