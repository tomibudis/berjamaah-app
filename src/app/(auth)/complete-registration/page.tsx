'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { trpcClient } from '@/utils/trpc';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    uniqueId: z.string().min(3, { message: 'ID unik minimal 3 karakter' }),
    username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
    fullName: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter' }),
    dob: z.string().min(1, { message: 'Tanggal lahir harus diisi' }),
    phone: z.string().min(6, { message: 'Nomor HP minimal 6 karakter' }),
    password: z.string().min(8, { message: 'Password minimal 8 karakter' }),
    confirmPassword: z
      .string()
      .min(8, { message: 'Konfirmasi password minimal 8 karakter' }),
  })
  .refine(v => v.password === v.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

function CompleteRegistrationForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      uniqueId: '',
      username: '',
      fullName: '',
      dob: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await trpcClient.user.completeRegistration.mutate({ token, ...values });
      toast.success('Registrasi berhasil, silakan masuk');
      router.push('/signin');
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || 'Gagal menyelesaikan registrasi';

      // Check if error contains field-specific messages
      if (errorMessage.includes('ID unik sudah digunakan')) {
        form.setError('uniqueId', {
          type: 'manual',
          message: 'ID unik sudah digunakan',
        });
      }

      if (errorMessage.includes('Username sudah digunakan')) {
        form.setError('username', {
          type: 'manual',
          message: 'Username sudah digunakan',
        });
      }

      // Show general error toast if no specific field errors
      if (!errorMessage.includes('sudah digunakan')) {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Selesaikan Pendaftaran</CardTitle>
        <CardDescription>Lengkapi data akun Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name='uniqueId'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Unik</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan ID unik' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='username'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan username' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='fullName'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan nama lengkap' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='dob'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'dd/MM/yyyy')
                          ) : (
                            <span>Pilih tanggal lahir</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={date => {
                          field.onChange(
                            date ? date.toISOString().split('T')[0] : ''
                          );
                        }}
                        disabled={date => date > new Date()}
                        captionLayout='dropdown'
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='phone'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor HP</FormLabel>
                  <FormControl>
                    <Input placeholder='Masukkan nomor HP' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='password'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name='confirmPassword'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='••••••••' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='w-full'
            >
              Selesaikan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default function CompleteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className='flex flex-1 items-center justify-center'>
          Loading...
        </div>
      }
    >
      <CompleteRegistrationForm />
    </Suspense>
  );
}
