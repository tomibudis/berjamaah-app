'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useQueryParams } from '@/hooks/use-query-params';

const filterSchema = z.object({
  status: z.string(),
  category: z.string(),
});

export type FilterFormValues = z.infer<typeof filterSchema>;

interface FilterValues extends Record<string, unknown> {
  status: string;
  category: string;
}

interface ProgramFilterDrawerProps {
  onApply: () => void;
  onReset: () => void;
}

export function ProgramFilterDrawer({
  onApply,
  onReset,
}: ProgramFilterDrawerProps) {
  const [filters, setFilters] = useQueryParams<FilterValues>({
    status: 'all',
    category: 'all',
  });

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      status: filters.status,
      category: filters.category,
    },
    mode: 'onChange',
  });

  const handleApply = (formValues: FilterFormValues) => {
    setFilters(formValues);
    onApply();
  };

  const handleReset = () => {
    const resetValues = {
      status: 'all',
      category: 'all',
    };
    form.reset(resetValues);
    setFilters(resetValues);
    onReset();
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleApply)}>
          {/* Status Filter */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Status
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="ended">Selesai</SelectItem>
                      <SelectItem value="paused">Dijeda</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Filter */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                  Kategori
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      <SelectItem value="Pendidikan">Pendidikan</SelectItem>
                      <SelectItem value="Infrastruktur">
                        Infrastruktur
                      </SelectItem>
                      <SelectItem value="Bencana">Bencana</SelectItem>
                      <SelectItem value="Kesehatan">Kesehatan</SelectItem>
                      <SelectItem value="Sosial">Sosial</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Terapkan Filter
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
