'use client';

import { User } from '../types';
import { UserCard } from './UserCard';

interface UsersGridProps {
  users: User[];
}

export function UsersGrid({ users }: UsersGridProps) {
  if (users.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center'>
          <svg
            className='w-12 h-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
          No users found
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4'>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
