'use client';

import * as React from 'react';
import { Suspense } from 'react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useQueryParams } from '@/hooks/use-query-params';
import { MOCK_USERS } from './data';
import { User, UserFilters } from './types';
import {
  UsersHeader,
  UsersGrid,
  SearchInput,
  StatusSelect,
  RoleSelect,
  FiltersTable,
} from './components';

function UsersPageContent() {
  const router = useRouter();
  // URL State Management
  const [queryParams, setQueryParams] = useQueryParams<UserFilters>({
    search: '',
    status: 'all',
    role: 'all',
    page: '1',
  });

  // Data source (mocked for now)
  const users = React.useMemo<User[]>(() => MOCK_USERS, []);

  // Filter users based on query parameters
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        queryParams.search === '' ||
        user.name.toLowerCase().includes(queryParams.search.toLowerCase()) ||
        user.email.toLowerCase().includes(queryParams.search.toLowerCase());

      const matchesStatus =
        queryParams.status === 'all' || user.status === queryParams.status;
      const matchesRole =
        queryParams.role === 'all' || user.role === queryParams.role;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, queryParams]);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === 'active').length;

  // Filter handlers
  const handleSearch = (value: string) => {
    setQueryParams({ search: value, page: '1' });
  };

  const handleStatusFilter = (value: string) => {
    setQueryParams({
      status: value as 'all' | 'active' | 'inactive' | 'pending',
      page: '1',
    });
  };

  const handleRoleFilter = (value: string) => {
    setQueryParams({ role: value as 'all' | 'admin' | 'user', page: '1' });
  };

  // User actions
  const handleCreateUser = () => {
    router.push('/admin/users/add' as Route);
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user functionality
    console.log('Edit user:', user);
  };

  const handleDeleteUser = (user: User) => {
    // TODO: Implement delete user functionality
    console.log('Delete user:', user);
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-4 px-4 py-6 lg:px-6'>
          <UsersHeader
            onCreateUser={handleCreateUser}
            totalUsers={totalUsers}
            activeUsers={activeUsers}
          />
          <FiltersTable>
            <SearchInput value={queryParams.search} onChange={handleSearch} />
            <StatusSelect
              value={queryParams.status}
              onChange={handleStatusFilter}
            />
            <RoleSelect value={queryParams.role} onChange={handleRoleFilter} />
          </FiltersTable>
        </div>
        <div className='flex-1 px-4 lg:px-6 pb-6'>
          <UsersGrid
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<UsersPageSkeleton />}>
      <UsersPageContent />
    </Suspense>
  );
}

function UsersPageSkeleton() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-4 px-4 py-6 lg:px-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2'></div>
              <div className='h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            </div>
            <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center'>
                <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
                <div className='ml-4'>
                  <div className='h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2'></div>
                  <div className='h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                </div>
              </div>
            </div>
            <div className='bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center'>
                <div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
                <div className='ml-4'>
                  <div className='h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2'></div>
                  <div className='h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                </div>
              </div>
            </div>
          </div>

          <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
            </div>
          </div>
        </div>

        <div className='flex-1 px-4 lg:px-6 pb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className='bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse'></div>
                    <div>
                      <div className='h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2'></div>
                      <div className='flex gap-2'>
                        <div className='h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                        <div className='h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                      </div>
                    </div>
                  </div>
                  <div className='w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                </div>
                <div className='space-y-2'>
                  <div className='h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                  <div className='h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                  <div className='h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                </div>
                <div className='flex gap-2 mt-4'>
                  <div className='h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                  <div className='h-8 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
