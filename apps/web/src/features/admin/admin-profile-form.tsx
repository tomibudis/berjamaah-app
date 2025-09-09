'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trpc, trpcClient } from '@/utils/trpc';
import { toast } from 'sonner';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Nama depan harus diisi'),
  lastName: z.string().min(1, 'Nama belakang harus diisi'),
  phone: z.string().min(1, 'Nomor telepon harus diisi'),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function AdminProfileForm() {
  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery(
    trpc.user.getProfile.queryOptions()
  );

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      trpcClient.user.updateProfile.mutate(data),
    onSuccess: () => {
      toast.success('Profil berhasil diperbarui');
      queryClient.invalidateQueries({
        queryKey: trpc.user.getProfile.queryKey(),
      });
    },
    onError: (error: any) => {
      toast.error(`Gagal memperbarui profil: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Prepopulate form when user data is loaded
  useEffect(() => {
    if (userProfile) {
      setValue('firstName', userProfile.firstName || '');
      setValue('lastName', userProfile.lastName || '');
      setValue('phone', (userProfile as any).phone || '');
      setValue('bio', (userProfile as any).bio || '');
    }
  }, [userProfile, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Profile Photo */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            {(userProfile as any)?.image ? (
              <img
                src={(userProfile as any).image}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
              </svg>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {(userProfile as any)?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {(userProfile as any)?.role === 'admin'
                ? 'Administrator'
                : 'User'}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nama Depan
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Masukkan nama depan Anda"
              {...register('firstName')}
              className="w-full"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nama Belakang
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Masukkan nama belakang Anda"
              {...register('lastName')}
              className="w-full"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nomor Telepon
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Masukkan nomor telepon Anda"
              {...register('phone')}
              className="w-full"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Bio
            </Label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Ceritakan tentang diri Anda..."
              {...register('bio')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
            {errors.bio && (
              <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            loading={isSubmitting || updateProfileMutation.isPending}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            {isSubmitting || updateProfileMutation.isPending
              ? 'Menyimpan...'
              : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
