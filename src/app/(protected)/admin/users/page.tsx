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
  UsersGrid,
  UsersPagination,
  SearchInput,
  StatusSelect,
  RoleSelect,
} from './components';
import Loader from '@/components/shared/loader';

function UsersPageContent() {
  const router = useRouter();
  // URL State Management
  const [queryParams, setQueryParams] = useQueryParams<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    page: '1',
  });

  // tRPC query for users data
  const {
    data: usersData,
    isLoading,
    error,
  } = trpc.user.getAllUsers.useQuery({
    page: parseInt(queryParams.page) || 1,
    limit: 12,
    search: queryParams.search || undefined,
    status: queryParams.status as 'all' | 'scheduled' | 'pending' | 'active',
    role: queryParams.role as 'all' | 'admin' | 'user',
  });

  // Extract data with fallbacks
  const users = usersData?.users || [];
  const totalUsers = usersData?.stats?.total || 0;
  const activeUsers = usersData?.stats?.active || 0;
  const pendingUsers = usersData?.stats?.pending || 0;
  const scheduledUsers = usersData?.stats?.scheduled || 0;

  // Filter handlers
  const handleSearch = (value: string) => {
    setQueryParams({ search: value, page: '1' });
  };

  const handleStatusFilter = (value: string) => {
    setQueryParams({
      status: value as 'all' | 'scheduled' | 'pending' | 'active',
      page: '1',
    });
  };

  const handleRoleFilter = (value: string) => {
    setQueryParams({ role: value as 'all' | 'admin' | 'user', page: '1' });
  };

  const handlePageChange = (page: number) => {
    setQueryParams({ page: page.toString() });
  };

  // User actions
  const handleCreateUser = () => {
    router.push('/admin/users/add' as Route);
  };

  // Handle error state
  if (error) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
            Error Loading Users
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-4'>
            {error.message || 'Something went wrong while loading users.'}
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
        {isLoading && <Loader />}

        {!isLoading && (
          <>
            <UsersGrid users={users} />
            {usersData?.pagination && (
              <UsersPagination
                currentPage={usersData.pagination.page}
                totalPages={usersData.pagination.totalPages}
                hasNextPage={usersData.pagination.hasNextPage}
                hasPrevPage={usersData.pagination.hasPrevPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
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
