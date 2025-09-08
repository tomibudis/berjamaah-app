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
import { ChevronLeft, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  formatCalendarDate,
  formatInputDate,
  formatInputTime,
} from '@/utils/dateFormat';

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
    programType: z.enum(['one_time', 'multiple', 'selected_date'], {
      message: 'Tipe program harus dipilih.',
    }),
    // One-time program fields
    startDate: z.string().optional(),
    startTime: z.string().optional(),
    endDate: z.string().optional(),
    endTime: z.string().optional(),
    // Multiple/recurring program fields
    recurringFrequency: z.string().optional(),
    recurringDay: z.string().optional(),
    recurringDurationDays: z.string().optional(),
    totalCycles: z.string().optional(),
    // Selected date program fields
    selectedDates: z.array(z.string()).optional(),
    selectedDateTimes: z
      .array(
        z.object({
          date: z.string(),
          startTime: z.string(),
          endTime: z.string(),
        })
      )
      .optional(),
  })
  .refine(
    data => {
      if (data.programType === 'one_time') {
        return data.startDate && data.endDate;
      }
      return true;
    },
    {
      message:
        'Tanggal mulai dan selesai harus diisi untuk program sekali jalan.',
      path: ['startDate'],
    }
  )
  .refine(
    data => {
      if (data.programType === 'one_time' && data.startDate && data.endDate) {
        return new Date(data.startDate) < new Date(data.endDate);
      }
      return true;
    },
    {
      message: 'Tanggal selesai harus setelah tanggal mulai.',
      path: ['endDate'],
    }
  )
  .refine(
    data => {
      if (data.programType === 'selected_date') {
        return data.selectedDateTimes && data.selectedDateTimes.length > 0;
      }
      return true;
    },
    {
      message:
        'Minimal satu tanggal dan waktu harus dipilih untuk program tanggal terpilih.',
      path: ['selectedDateTimes'],
    }
  );

export type AddProgramFormValues = z.infer<typeof addProgramSchema>;

export default function AddProgramForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);
  const [newStartDate, setNewStartDate] = React.useState('');
  const [newEndDate, setNewEndDate] = React.useState('');
  const [newStartTime, setNewStartTime] = React.useState('');
  const [newEndTime, setNewEndTime] = React.useState('');

  const form = useForm<AddProgramFormValues>({
    resolver: zodResolver(addProgramSchema),
    defaultValues: {
      title: '',
      description: '',
      targetAmount: '',
      category: '',
      programType: 'one_time',
      startDate: '',
      startTime: '00:00',
      endDate: '',
      endTime: '00:00',
      recurringFrequency: '',
      recurringDay: '',
      recurringDurationDays: '',
      totalCycles: '',
      selectedDates: [],
      selectedDateTimes: [],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const programType = form.watch('programType');
  const description = form.watch('description');

  const onSubmitForm = async (formValues: AddProgramFormValues) => {
    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      console.log('Form values:', formValues);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Program berhasil ditambahkan!');
      router.push('/admin/program');
    } catch (error) {
      console.error('Error adding program:', error);
      toast.error('Gagal menambahkan program. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tambah Program Baru
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Buat program donasi baru untuk membantu sesama
          </p>
        </div>
      </div>

      {isSubmitting && <Loader />}

      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmitForm)}>
          {/* Section 1: Informasi Program */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Informasi Program
              </h2>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Program</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Masukkan judul program"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Program</FormLabel>
                    <FormControl>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Masukkan deskripsi lengkap program"
                        {...field}
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <FormMessage />
                      <span>{description?.length || 0}/500 karakter</span>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Dana</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                          Rp
                        </div>
                        <Input
                          type="text"
                          placeholder="Masukkan target dana"
                          value={field.value}
                          onChange={e =>
                            handleAmountChange(e.target.value, field.onChange)
                          }
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    {field.value && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(field.value)}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
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
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendidikan">
                              Pendidikan
                            </SelectItem>
                            <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                            <SelectItem value="Infrastruktur">
                              Infrastruktur
                            </SelectItem>
                            <SelectItem value="Bencana">Bencana</SelectItem>
                            <SelectItem value="Sosial">Sosial</SelectItem>
                            <SelectItem value="Religi">Religi</SelectItem>
                            <SelectItem value="Lainnya">Lainnya</SelectItem>
                            <SelectItem value="new">
                              + Tambah kategori baru
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Masukkan kategori baru"
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
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleNewCategorySubmit}
                          >
                            Simpan
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
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
            </div>
          </div>

          {/* Section Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Section 2: Program Penayangan */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Program Penayangan
              </h2>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="programType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Program</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={value => {
                          field.onChange(value);
                          // Clear any validation errors when a valid program type is selected
                          form.clearErrors('programType');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">Sekali Jalan</SelectItem>
                          <SelectItem value="multiple">Berulang</SelectItem>
                          <SelectItem value="selected_date">
                            Tanggal Terpilih
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* One-time program fields */}
              {programType === 'one_time' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Periode Program
                  </h3>
                  <div className="space-y-4">
                    {/* Start Date and Time */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal Mulai</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal text-sm',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(
                                          new Date(field.value),
                                          'MMM dd, yyyy'
                                        )
                                      ) : (
                                        <span>Pilih tanggal</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={date => {
                                      field.onChange(
                                        date
                                          ? date.toISOString().split('T')[0]
                                          : ''
                                      );
                                      // Clear validation errors when date is selected
                                      form.clearErrors('startDate');
                                    }}
                                    disabled={date => date < new Date()}
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Waktu Mulai</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* End Date and Time */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal Selesai</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full pl-3 text-left font-normal text-sm',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(
                                          new Date(field.value),
                                          'MMM dd, yyyy'
                                        )
                                      ) : (
                                        <span>Pilih tanggal</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      field.value
                                        ? new Date(field.value)
                                        : undefined
                                    }
                                    onSelect={date => {
                                      field.onChange(
                                        date
                                          ? date.toISOString().split('T')[0]
                                          : ''
                                      );
                                      // Clear validation errors when date is selected
                                      form.clearErrors('endDate');
                                    }}
                                    disabled={date => {
                                      const startDate =
                                        form.getValues('startDate');
                                      return (
                                        date < new Date() ||
                                        (startDate
                                          ? date < new Date(startDate)
                                          : false)
                                      );
                                    }}
                                    captionLayout="dropdown"
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Waktu Selesai</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple/recurring program fields */}
              {programType === 'multiple' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Pengaturan Program Berulang
                  </h3>

                  <Alert variant="info">
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>
                          Program berulang akan dimulai dan berakhir pada pukul
                          00.00 WIB setiap hari yang ditentukan.
                        </p>
                        <div className="text-sm">
                          <p className="font-medium">Contoh pengaturan:</p>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                            <li>
                              Frekuensi: Mingguan, Hari: 1 (Senin), Durasi: 3
                              hari
                            </li>
                            <li>
                              Artinya: Program akan aktif setiap Senin selama 3
                              hari berturut-turut
                            </li>
                            <li>
                              Total Siklus: 4 (program akan berjalan 4 kali)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <FormField
                    control={form.control}
                    name="recurringFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frekuensi Berulang</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih frekuensi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Mingguan</SelectItem>
                              <SelectItem value="monthly">Bulanan</SelectItem>
                              <SelectItem value="quarterly">
                                Triwulanan
                              </SelectItem>
                              <SelectItem value="yearly">Tahunan</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurringDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hari Berulang</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Hari dalam minggu (1-7) atau bulan (1-31)"
                            min="1"
                            max="31"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recurringDurationDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Durasi Setiap Aktivasi (Hari)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Berapa hari program aktif setiap kali"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalCycles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Siklus (Opsional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Kosongkan untuk berulang tanpa batas"
                            min="1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Selected date program fields */}
              {programType === 'selected_date' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Pilih Tanggal Program
                  </h3>

                  <FormField
                    control={form.control}
                    name="selectedDateTimes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal dan Waktu Program</FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <div className="space-y-4">
                              {/* Start Date and Time */}
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Tanggal Mulai
                                    </label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            'w-full pl-3 text-left font-normal text-sm',
                                            !newStartDate &&
                                              'text-muted-foreground'
                                          )}
                                        >
                                          {newStartDate ? (
                                            formatCalendarDate(newStartDate)
                                          ) : (
                                            <span>Pilih tanggal</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={
                                            newStartDate
                                              ? new Date(newStartDate)
                                              : undefined
                                          }
                                          onSelect={date => {
                                            setNewStartDate(
                                              date ? formatInputDate(date) : ''
                                            );
                                          }}
                                          disabled={date => date < new Date()}
                                          captionLayout="dropdown"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Waktu Mulai
                                    </label>
                                    <Input
                                      type="time"
                                      placeholder="Waktu mulai"
                                      value={newStartTime}
                                      onChange={e =>
                                        setNewStartTime(e.target.value)
                                      }
                                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* End Date and Time */}
                              <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Tanggal Selesai
                                    </label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            'w-full pl-3 text-left font-normal text-sm',
                                            !newEndDate &&
                                              'text-muted-foreground'
                                          )}
                                        >
                                          {newEndDate ? (
                                            formatCalendarDate(newEndDate)
                                          ) : (
                                            <span>Pilih tanggal</span>
                                          )}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={
                                            newEndDate
                                              ? new Date(newEndDate)
                                              : undefined
                                          }
                                          onSelect={date => {
                                            setNewEndDate(
                                              date ? formatInputDate(date) : ''
                                            );
                                          }}
                                          disabled={date => {
                                            return (
                                              date < new Date() ||
                                              (newStartDate
                                                ? date < new Date(newStartDate)
                                                : false)
                                            );
                                          }}
                                          captionLayout="dropdown"
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                      Waktu Selesai
                                    </label>
                                    <Input
                                      type="time"
                                      placeholder="Waktu selesai"
                                      value={newEndTime}
                                      onChange={e =>
                                        setNewEndTime(e.target.value)
                                      }
                                      className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Add Button */}
                              <div className="flex justify-start">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (
                                      newStartDate &&
                                      newEndDate &&
                                      newStartTime &&
                                      newEndTime
                                    ) {
                                      const newDateTime = {
                                        date: newStartDate,
                                        startTime: newStartTime,
                                        endTime: newEndTime,
                                      };

                                      // Check if this exact combination already exists
                                      const exists = field.value?.some(
                                        item =>
                                          item.date === newStartDate &&
                                          item.startTime === newStartTime &&
                                          item.endTime === newEndTime
                                      );

                                      if (!exists) {
                                        field.onChange([
                                          ...(field.value || []),
                                          newDateTime,
                                        ]);
                                        setNewStartDate('');
                                        setNewEndDate('');
                                        setNewStartTime('');
                                        setNewEndTime('');
                                      }
                                    }
                                  }}
                                  disabled={
                                    !newStartDate ||
                                    !newEndDate ||
                                    !newStartTime ||
                                    !newEndTime ||
                                    field.value?.some(
                                      item =>
                                        item.date === newStartDate &&
                                        item.startTime === newStartTime &&
                                        item.endTime === newEndTime
                                    )
                                  }
                                >
                                  Tambah
                                </Button>
                              </div>
                            </div>

                            {field.value && field.value.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Tanggal dan waktu yang dipilih:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((dateTime, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md text-sm"
                                    >
                                      <span>
                                        {formatCalendarDate(dateTime.date)}{' '}
                                        {dateTime.startTime} -{' '}
                                        {dateTime.endTime}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newDateTimes =
                                            field.value?.filter(
                                              (_, i) => i !== index
                                            ) || [];
                                          field.onChange(newDateTimes);
                                        }}
                                        className="text-red-500 hover:text-red-700 text-lg font-bold leading-none"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Program'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
