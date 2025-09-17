'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, ChevronLeft } from 'lucide-react';

// Schema for single user email
const userEmailSchema = z.object({
  email: z.string().email({ message: 'Masukkan alamat email yang valid.' }),
});

// Schema for the entire form with dynamic email fields
const addUsersSchema = z
  .object({
    users: z
      .array(userEmailSchema)
      .min(1, 'Minimal satu email pengguna diperlukan.'),
  })
  .superRefine((data, ctx) => {
    // Validasi agar email tidak duplikat (case-insensitive)
    const seenLowercaseEmailToIndexes = new Map<string, number[]>();
    data.users.forEach((user, index) => {
      const normalized = user.email.trim().toLowerCase();
      const existing = seenLowercaseEmailToIndexes.get(normalized) ?? [];
      existing.push(index);
      seenLowercaseEmailToIndexes.set(normalized, existing);
    });

    // Tambahkan error pada setiap field email yang duplikat
    for (const indexes of seenLowercaseEmailToIndexes.values()) {
      if (indexes.length > 1) {
        indexes.forEach(dupIndex => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Email duplikat. Setiap email harus unik.',
            path: ['users', dupIndex, 'email'],
          });
        });
      }
    }
  });

export type AddUsersFormValues = z.infer<typeof addUsersSchema>;

export default function AddUsersPage() {
  const router = useRouter();

  const form = useForm<AddUsersFormValues>({
    resolver: zodResolver(addUsersSchema),
    defaultValues: {
      users: [{ email: '' }],
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'users',
  });

  const onSubmitForm = async (formValues: AddUsersFormValues) => {
    try {
      // TODO: Implement actual API call to create users
      console.log('Creating users:', formValues.users);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Berhasil membuat ${formValues.users.length} pengguna`);

      // Reset form
      form.reset({
        users: [{ email: '' }],
      });
    } catch (error) {
      console.error('Error creating users:', error);
      toast.error('Gagal membuat pengguna. Silakan coba lagi.');
    }
  };

  const handleAddMoreUser = () => {
    append({ email: '' });
  };

  const handleRemoveUser = (index: number) => {
    if (fields.length > 1) {
      remove(index);
      form.trigger('users');
    }
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-4 px-4 py-6 lg:px-6'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='p-2'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Tambah Pengguna Baru
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Tambahkan satu atau lebih pengguna menggunakan alamat email
              </p>
            </div>
          </div>
        </div>

        <div className='flex-1 px-4 lg:px-6'>
          <Card className='w-full max-w-2xl mx-auto'>
            <CardHeader>
              <CardTitle>Informasi Pengguna</CardTitle>
              <CardDescription>
                Masukkan alamat email untuk pengguna yang ingin Anda tambahkan
                ke sistem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className='space-y-6'
                  onSubmit={form.handleSubmit(onSubmitForm)}
                >
                  {/* Dynamic Email Fields */}
                  <div className='space-y-4'>
                    {fields.map((field, index) => (
                      <div key={field.id} className='flex items-start gap-2'>
                        <FormField
                          control={form.control}
                          name={`users.${index}.email`}
                          render={({ field }) => (
                            <FormItem className='flex-1'>
                              <FormLabel>
                                Email {index + 1}
                                {index === 0 && (
                                  <span className='text-red-500 ml-1'>*</span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='email'
                                  placeholder='Masukkan alamat email'
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {fields.length > 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => handleRemoveUser(index)}
                            className='shrink-0 mt-7'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add More User Button */}
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleAddMoreUser}
                    className='w-full'
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Tambah Pengguna Lagi
                  </Button>

                  {/* Action Buttons */}
                  <div className='flex gap-3 pt-4'>
                    <Button
                      type='submit'
                      disabled={form.formState.isSubmitting}
                      className='flex-1'
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Membuat Pengguna...
                        </>
                      ) : (
                        'Simpan Pengguna'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
