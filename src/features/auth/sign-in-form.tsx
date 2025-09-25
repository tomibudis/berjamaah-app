'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { signIn, useSession, getSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '@/components/shared/loader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const signInSchema = z.object({
  email: z.string().email({ message: 'Masukkan alamat email yang valid.' }),
  password: z
    .string()
    .min(6, { message: 'Password harus minimal 6 karakter.' }),
  rememberMe: z.boolean().optional(),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const { status } = useSession();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmitForm = async (formValues: SignInFormValues) => {
    const result = await signIn('credentials', {
      email: formValues.email,
      password: formValues.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error('Kredensial tidak valid');
    } else if (result?.ok) {
      toast.success('Berhasil masuk');
      const session = await getSession();

      // Check if user is admin and redirect accordingly
      if (session?.user?.role === 'admin') {
        router.push('/admin/home');
      } else {
        router.push('/');
      }
    }
  };

  if (status === 'loading') {
    return <Loader />;
  }

  return (
    <Card className='w-full shadow-lg'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold'>
          Selamat Datang Kembali
        </CardTitle>
        <CardDescription>Masuk ke akun donor Berjamaah Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-6'
            onSubmit={form.handleSubmit(onSubmitForm)}
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='Masukkan email...'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Masukan password...'
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
              {form.formState.isSubmitting ? 'Sedang masuk...' : 'Masuk'}
            </Button>

            <div className='flex items-center justify-center'>
              <Link
                href='/forgot-password'
                className='text-sm text-green-600 hover:text-green-500 font-medium'
              >
                Lupa password
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
