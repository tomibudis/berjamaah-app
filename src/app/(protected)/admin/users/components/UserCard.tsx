'use client';

import { useState } from 'react';
import { User } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  Phone,
  Calendar,
  DollarSign,
  MoreHorizontal,
  UserPlus,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface UserCardProps {
  user: User;
  onUserUpdate?: () => void;
}

export function UserCard({ user, onUserUpdate }: UserCardProps) {
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);

  const { data: session } = useSession();

  const utils = trpc.useUtils();

  const updateUserRoleMutation = trpc.user.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success('Role pengguna berhasil diperbarui');
      utils.user.getAllUsers.invalidate();
      if (onUserUpdate) {
        onUserUpdate();
      }
      setShowAdminDialog(false);
      setShowUserDialog(false);
    },
    onError: error => {
      toast.error(error.message || 'Gagal memperbarui role pengguna');
    },
  });

  const handleMakeAdmin = () => {
    updateUserRoleMutation.mutate({
      userId: user.id,
      role: 'admin',
    });
  };

  const handleMakeUser = () => {
    updateUserRoleMutation.mutate({
      userId: user.id,
      role: 'user',
    });
  };

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
          {(user.name !== 'Admin User' ||
            user.email !== session?.user.email) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='w-4 h-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {user.role === 'user' ? (
                  <DropdownMenuItem onClick={() => setShowAdminDialog(true)}>
                    <UserPlus className='w-4 h-4' />
                    Jadikan Admin
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowUserDialog(true)}>
                    <UserPlus className='w-4 h-4' />
                    Jadikan User
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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

      {/* Make Admin Confirmation Dialog */}
      <AlertDialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jadikan Pengguna Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menjadikan{' '}
              <strong>{user.name || user.fullName || user.email}</strong>{' '}
              sebagai admin? Ini akan memberikan mereka hak akses administratif
              penuh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMakeAdmin}
              disabled={updateUserRoleMutation.isPending}
            >
              {updateUserRoleMutation.isPending
                ? 'Mengubah ke Admin...'
                : 'Jadikan Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Jadikan User Confirmation Dialog */}
      <AlertDialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jadikan Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menjadikan{' '}
              <strong>{user.name || user.fullName || user.email}</strong>{' '}
              sebagai user biasa? Ini akan menghapus hak akses administratif
              mereka.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMakeUser}
              disabled={updateUserRoleMutation.isPending}
            >
              {updateUserRoleMutation.isPending
                ? 'Mengubah ke User...'
                : 'Jadikan User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
