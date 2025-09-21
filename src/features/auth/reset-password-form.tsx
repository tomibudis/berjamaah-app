'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpcClient } from '@/utils/trpc';
import { PasswordInput } from '@/components/ui/password-input';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password harus minimal 8 karakter' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          'Password harus mengandung minimal satu huruf besar, satu huruf kecil, dan satu angka',
      }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Silakan konfirmasi password Anda' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmitForm = async (formValues: ResetPasswordFormValues) => {
    try {
      await trpcClient.user.resetPassword.mutate({
        token,
        password: formValues.password,
        confirmPassword: formValues.confirmPassword,
      });

      setIsSubmitted(true);
      toast.success(
        'Password berhasil direset! Anda sekarang dapat masuk dengan password baru.'
      );

      // Redirect to sign in page after 3 seconds
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal mereset password. Silakan coba lagi.'
      );
    }
  };

  if (isSubmitted) {
    return (
      <div className='text-center space-y-4'>
        <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
          <svg
            className='w-8 h-8 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <div>
          <h3 className='text-lg font-medium text-gray-900'>
            Reset Password Berhasil
          </h3>
          <p className='text-sm text-gray-600 mt-2'>
            Password Anda telah berhasil diperbarui. Anda akan diarahkan ke
            halaman masuk dalam beberapa saat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form className='space-y-6' onSubmit={form.handleSubmit(onSubmitForm)}>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password Baru</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Masukkan password baru Anda'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password Baru</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='Konfirmasi password baru Anda'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type='submit'
          className='w-full'
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? 'Memperbarui Password...'
            : 'Perbarui Password'}
        </Button>
      </form>
    </Form>
  );
}
