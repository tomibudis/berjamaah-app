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
import { useRouter } from 'next/navigation';
import Loader from '@/components/shared/loader';
import { trpcClient, queryClient } from '@/utils/trpc';
import { ChevronLeft, X, Image as ImageIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerField } from '@/components/shared/date-picker';

const addProgramSchema = z
  .object({
    title: z
      .string()
      .min(1, { message: 'Judul program harus diisi.' })
      .min(3, { message: 'Judul program minimal 3 karakter.' })
      .max(100, { message: 'Judul program maksimal 100 karakter.' }),
    description: z
      .string()
      .min(1, { message: 'Deskripsi program harus diisi.' })
      .min(10, { message: 'Deskripsi program minimal 10 karakter.' })
      .max(500, { message: 'Deskripsi program maksimal 500 karakter.' }),
    targetAmount: z
      .string()
      .min(1, { message: 'Target dana harus diisi.' })
      .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
        message: 'Target dana harus berupa angka yang valid dan lebih dari 0.',
      }),
    category: z
      .string()
      .min(1, { message: 'Kategori program harus diisi.' })
      .min(2, { message: 'Kategori program minimal 2 karakter.' })
      .max(50, { message: 'Kategori program maksimal 50 karakter.' }),
    bannerImage: z
      .string()
      .url('Format URL tidak valid')
      .optional()
      .or(z.literal('')),
    // Optional date and time fields
    startDate: z.string().optional(),
    startTime: z.string().optional(),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine(
    data => {
      // If both dates are provided, end date must be after start date
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return startDate < endDate;
      }
      return true;
    },
    {
      message: 'Tanggal selesai harus setelah tanggal mulai.',
      path: ['endDate'],
    }
  );

export type AddProgramFormValues = z.infer<typeof addProgramSchema>;

export default function AddProgramForm() {
  const router = useRouter();
  const [newCategory, setNewCategory] = React.useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const form = useForm<AddProgramFormValues>({
    resolver: zodResolver(addProgramSchema),
    defaultValues: {
      title: '',
      description: '',
      targetAmount: '',
      category: '',
      bannerImage: '',
      startDate: '',
      startTime: '00:00',
      endDate: '',
      endTime: '23:59',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const description = form.watch('description');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  const onSubmitForm = async (formValues: AddProgramFormValues) => {
    try {
      const baseProgramData = {
        title: formValues.title,
        description: formValues.description,
        targetAmount: Number(formValues.targetAmount),
        category: formValues.category,
        bannerImage:
          formValues.bannerImage && formValues.bannerImage.trim() !== ''
            ? formValues.bannerImage
            : undefined,
      };

      // Determine status based on date fields
      let status: 'pending' | 'active';
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      if (formValues.startDate && formValues.endDate) {
        // Both dates provided - status is pending (scheduled)
        status = 'pending';
        startDate = new Date(formValues.startDate);
        endDate = new Date(formValues.endDate);
      } else if (formValues.startDate && !formValues.endDate) {
        // Only start date provided - status is pending (scheduled)
        status = 'pending';
        startDate = new Date(formValues.startDate);
      } else if (!formValues.startDate && formValues.endDate) {
        // Only end date provided - status is active
        status = 'active';
        endDate = new Date(formValues.endDate);
      } else {
        // No dates provided - status is active (immediate start)
        status = 'active';
      }

      await trpcClient.program.create.mutate({
        ...baseProgramData,
        status,
        programType: 'one_time',
        initialPeriod:
          startDate || endDate
            ? {
                startDate: startDate
                  ? new Date(
                      `${formValues.startDate}T${formValues.startTime || '00:00'}`
                    )
                  : null,
                endDate: endDate
                  ? new Date(
                      `${formValues.endDate}T${formValues.endTime || '23:59'}`
                    )
                  : null,
                cycleNumber: 1,
              }
            : {
                startDate: null,
                endDate: null,
                cycleNumber: 1,
              },
      });

      // Invalidate program queries to refresh the list
      await queryClient.invalidateQueries({
        queryKey: ['program', 'getAll'],
      });

      toast.success('Program berhasil ditambahkan!');
      router.push('/admin/program');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error adding program:', error);
      toast.error(
        error.message || 'Gagal menambahkan program. Silakan coba lagi.'
      );
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'new') {
      setShowNewCategoryInput(true);
      form.setValue('category', '');
    } else {
      setShowNewCategoryInput(false);
      form.setValue('category', value);
      // Clear any validation errors when a valid category is selected
      form.clearErrors('category');
    }
  };

  const handleNewCategorySubmit = () => {
    if (newCategory.trim()) {
      form.setValue('category', newCategory.trim());
      // Clear any validation errors when a valid category is set
      form.clearErrors('category');
      setNewCategory('');
      setShowNewCategoryInput(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');

    if (!numericValue) return '';

    // Format as currency
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(numericValue));
  };

  const handleAmountChange = (
    value: string,
    onChange: (value: string) => void
  ) => {
    const numericValue = value.replace(/\D/g, '');
    onChange(numericValue);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      form.setValue('bannerImage', result.url);
      toast.success('Gambar berhasil diupload!');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Gagal mengupload gambar';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header with Back Button */}
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
            Tambah Program Baru
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Buat program donasi baru untuk membantu sesama
          </p>
        </div>
      </div>

      {form.formState.isSubmitting && <Loader />}

      <Form {...form}>
        <form className='space-y-8' onSubmit={form.handleSubmit(onSubmitForm)}>
          {/* Section 1: Informasi Program */}
          <div className='space-y-6'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Informasi Program
              </h2>
            </div>

            <div className='space-y-6'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Program</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Masukkan judul program'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Program</FormLabel>
                    <FormControl>
                      <textarea
                        className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='Masukkan deskripsi lengkap program'
                        {...field}
                      />
                    </FormControl>
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <FormMessage />
                      <span>{description?.length || 0}/500 karakter</span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='targetAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Dana</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground'>
                          Rp
                        </div>
                        <Input
                          type='text'
                          placeholder='Masukkan target dana'
                          value={field.value}
                          onChange={e =>
                            handleAmountChange(e.target.value, field.onChange)
                          }
                          className='pl-10'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                      <p className='text-sm text-muted-foreground'>
                        {formatCurrency(field.value)}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Program</FormLabel>
                    <FormControl>
                      {!showNewCategoryInput ? (
                        <Select
                          value={field.value}
                          onValueChange={handleCategoryChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder='Pilih kategori' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='Pendidikan'>
                              Pendidikan
                            </SelectItem>
                            <SelectItem value='Kesehatan'>Kesehatan</SelectItem>
                            <SelectItem value='Infrastruktur'>
                              Infrastruktur
                            </SelectItem>
                            <SelectItem value='Bencana'>Bencana</SelectItem>
                            <SelectItem value='Sosial'>Sosial</SelectItem>
                            <SelectItem value='Religi'>Religi</SelectItem>
                            <SelectItem value='Lainnya'>Lainnya</SelectItem>
                            <SelectItem value='new'>
                              + Tambah kategori baru
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className='flex gap-2'>
                          <Input
                            type='text'
                            placeholder='Masukkan kategori baru'
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleNewCategorySubmit();
                              }
                            }}
                          />
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={handleNewCategorySubmit}
                          >
                            Simpan
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategory('');
                            }}
                          >
                            Batal
                          </Button>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bannerImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banner Program (Opsional)</FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        {field.value ? (
                          <div className='relative'>
                            <img
                              src={field.value}
                              alt='Banner preview'
                              className='w-full object-cover rounded-lg border'
                            />
                            <Button
                              type='button'
                              variant='destructive'
                              size='sm'
                              className='absolute top-2 right-2'
                              onClick={() => field.onChange('')}
                            >
                              <X className='h-4 w-4' />
                            </Button>
                          </div>
                        ) : (
                          <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors'>
                            <input
                              type='file'
                              accept='image/*'
                              onChange={handleFileChange}
                              className='hidden'
                              id='banner-upload'
                              disabled={uploading}
                            />
                            <label
                              htmlFor='banner-upload'
                              className='cursor-pointer flex flex-col items-center space-y-2'
                            >
                              {uploading ? (
                                <div className='flex flex-col items-center space-y-2'>
                                  <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                                    Mengupload... {uploadProgress}%
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <ImageIcon className='h-8 w-8 text-gray-400' />
                                  <div className='text-sm text-gray-600 dark:text-gray-400'>
                                    <p className='font-medium'>
                                      Klik untuk upload banner
                                    </p>
                                    <p>PNG, JPG, WEBP, GIF (max 5MB)</p>
                                  </div>
                                </>
                              )}
                            </label>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Section Separator */}
          <div className='border-t border-gray-200 dark:border-gray-700'></div>

          {/* Section 2: Periode Program */}
          <div className='space-y-6'>
            <div className='flex items-center gap-3'>
              <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Periode Program
              </h2>
            </div>

            <div className='space-y-6'>
              <Alert>
                <AlertDescription>
                  <div className='space-y-2'>
                    <p className='font-medium'>Status Program:</p>
                    <ul className='text-sm space-y-1'>
                      <li>
                        • <strong>Pending:</strong> Jika hanya tanggal mulai
                        diisi, atau kedua tanggal diisi
                      </li>
                      <li>
                        • <strong>Active:</strong> Jika hanya tanggal selesai
                        diisi
                      </li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Date fields */}
              <div className='space-y-4'>
                {/* Start Date and Time */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                    Tanggal & Waktu Mulai (Opsional)
                  </h4>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name='startDate'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Mulai</FormLabel>
                            <FormControl>
                              <DatePickerField
                                value={field.value}
                                onChange={value => {
                                  field.onChange(value);
                                  form.clearErrors('startDate');
                                }}
                                placeholder='Pilih tanggal'
                                minDate={new Date()}
                                error={!!form.formState.errors.startDate}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name='startTime'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Waktu Mulai</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  type='time'
                                  {...field}
                                  className='h-10 bg-background pr-8'
                                />
                                {field.value && field.value !== '00:00' && (
                                  <X
                                    className='absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer'
                                    onClick={() => {
                                      field.onChange('00:00');
                                    }}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* End Date and Time */}
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                    Tanggal & Waktu Selesai (Opsional)
                  </h4>
                  <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name='endDate'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Selesai</FormLabel>
                            <FormControl>
                              <DatePickerField
                                value={field.value}
                                onChange={value => {
                                  field.onChange(value);
                                  form.clearErrors('endDate');
                                }}
                                placeholder='Pilih tanggal'
                                minDate={
                                  form.getValues('startDate')
                                    ? new Date(form.getValues('startDate')!)
                                    : new Date()
                                }
                                error={!!form.formState.errors.endDate}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex-1'>
                      <FormField
                        control={form.control}
                        name='endTime'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Waktu Selesai</FormLabel>
                            <FormControl>
                              <div className='relative'>
                                <Input
                                  type='time'
                                  {...field}
                                  className='h-10 bg-background pr-8'
                                />
                                {field.value && field.value !== '23:59' && (
                                  <X
                                    className='absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer'
                                    onClick={() => {
                                      field.onChange('23:59');
                                    }}
                                  />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                {(startDate || endDate) && (
                  <div className='p-3 bg-blue-50 dark:bg-blue-950 rounded-md'>
                    <p className='text-sm text-blue-800 dark:text-blue-200'>
                      <strong>Status Program:</strong>{' '}
                      {startDate && !endDate
                        ? 'Pending (akan aktif pada tanggal mulai)'
                        : !startDate && endDate
                          ? 'Active (aktif sekarang, berakhir pada tanggal selesai)'
                          : startDate && endDate
                            ? 'Pending (akan aktif pada tanggal mulai, berakhir pada tanggal selesai)'
                            : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            type='submit'
            className='w-full bg-green-600 hover:bg-green-700'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Program'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
