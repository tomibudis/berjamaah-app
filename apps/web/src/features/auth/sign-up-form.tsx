'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import GoogleSignUpButton from './google-signup-button';
import Loader from '@/components/shared/loader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Full name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters.' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions.',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const onSubmitForm = async (formValues: SignUpFormValues) => {
    await authClient.signUp.email(
      {
        email: formValues.email,
        password: formValues.password,
        name: formValues.fullName,
      },
      {
        onSuccess: () => {
          router.push('/');
          toast.success('Account created successfully! Welcome to Berjamaah!');
        },
        onError: error => {
          toast.error(error.error.message || error.error.statusText);
        },
      }
    );
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>
          Join Berjamaah and start making a difference today
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google Sign Up Button */}
        {isPending && <Loader />}
        {!isPending && <GoogleSignUpButton />}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmitForm)}
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create a strong password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        id="accept-terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormLabel
                      htmlFor="accept-terms"
                      className="text-sm leading-relaxed font-normal cursor-pointer"
                    >
                      I agree to the{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm underline"
                        onClick={() =>
                          toast.info('Terms and conditions will be implemented')
                        }
                      >
                        Terms and Conditions
                      </Button>{' '}
                      and{' '}
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-sm underline"
                        onClick={() =>
                          toast.info('Privacy policy will be implemented')
                        }
                      >
                        Privacy Policy
                      </Button>
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? 'Creating Account...'
                : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
