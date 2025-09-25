'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { trpcClient } from '@/utils/trpc';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: 'Silakan masukkan alamat email yang valid.' }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmitForm = async (formValues: ForgotPasswordFormValues) => {
    try {
      await trpcClient.user.forgotPassword.mutate({ email: formValues.email });
      setIsSubmitted(true);
      toast.success('Link reset password telah dikirim ke email Anda!');
    } catch (error) {
      console.error('Error reset password:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Gagal mengirim email reset password. Silakan coba lagi.'
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
            Periksa Email Anda
          </h3>
          <p className='text-sm text-gray-600 mt-2'>
            Kami telah mengirim link reset password ke{' '}
            <strong>{form.getValues('email')}</strong>
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='Masukkan email Anda'
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
          {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
        </Button>
      </form>
    </Form>
  );
}
