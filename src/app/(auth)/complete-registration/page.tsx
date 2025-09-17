'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { trpcClient } from '@/utils/trpc';

const schema = z
  .object({
    uniqueId: z.string().min(3),
    username: z.string().min(3),
    fullName: z.string().min(3),
    dob: z.string().min(4),
    phone: z.string().min(6),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
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
    } catch {
      toast.error('Gagal menyelesaikan registrasi');
    }
  };

  return (
    <div className='flex flex-1 flex-col px-4 py-10'>
      <Card className='w-full max-w-xl mx-auto'>
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
                    <FormLabel>Unique ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <FormControl>
                      <Input placeholder='YYYY-MM-DD' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='phone'
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. HP</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input type='password' {...field} />
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
                      <Input type='password' {...field} />
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
    </div>
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
