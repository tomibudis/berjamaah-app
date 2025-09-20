'use client';

import { User } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <Card className='hover:shadow-md transition-shadow py-0'>
      <CardContent className='p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg'>
              {(user.name || user.fullName || user.email)
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <h3 className='font-semibold text-gray-900 dark:text-white'>
                {user.name || user.fullName || 'No Name'}
              </h3>
              <div className='flex items-center gap-2 mt-1'>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </div>
            </div>
          </div>
          {/* <Button variant='ghost' size='sm'>
            <MoreHorizontal className='w-4 h-4' />
          </Button> */}
        </div>

        <div className='mt-4 space-y-2'>
          <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
            <Mail className='w-4 h-4 mr-2' />
            <span className='truncate'>{user.email}</span>
          </div>

          {user.phone && (
            <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
              <Phone className='w-4 h-4 mr-2' />
              <span>{user.phone}</span>
            </div>
          )}

          <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
            <Calendar className='w-4 h-4 mr-2' />
            <span>
              Joined{' '}
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {user.role === 'user' && (
            <div className='flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700'>
              <div className='flex items-center text-sm text-gray-600 dark:text-gray-400'>
                <DollarSign className='w-4 h-4 mr-2' />
                <span>{user.totalDonations || 0} donations</span>
              </div>
              <div className='text-sm font-medium text-gray-900 dark:text-white'>
                Rp {user.totalAmount?.toLocaleString('id-ID') || '0'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
