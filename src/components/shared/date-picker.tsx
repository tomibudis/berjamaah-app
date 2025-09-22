'use client';

import React from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDateToISOString, formatDateForDisplay } from '@/lib/date';

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD format
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  buttonClassName?: string;
  showClearButton?: boolean;
  error?: boolean;
}

export function DatePicker({
  value,
  onChange,
  onClear,
  placeholder = 'Pilih tanggal',
  disabled = false,
  minDate,
  maxDate,
  className,
  buttonClassName,
  showClearButton = true,
  error = false,
}: DatePickerProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (onChange) {
      onChange(date ? formatDateToISOString(date) : '');
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange('');
    }
  };

  const isDateDisabled = (date: Date) => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className={cn('relative', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='lg'
            disabled={disabled}
            className={cn(
              'w-full pl-10 pr-10 text-left font-normal text-sm justify-start',
              !value && 'text-muted-foreground',
              error && 'border-red-500 focus-visible:ring-red-500',
              buttonClassName
            )}
          >
            <CalendarIcon className='h-4 w-4 opacity-50' />
            {value ? (
              formatDateForDisplay(new Date(value))
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 z-[60]' align='start'>
          <Calendar
            mode='single'
            selected={value ? new Date(value) : undefined}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            captionLayout='dropdown'
          />
        </PopoverContent>
      </Popover>
      {showClearButton && value && (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted'
          onClick={handleClear}
        >
          <X className='h-4 w-4 text-muted-foreground hover:text-foreground' />
        </Button>
      )}
    </div>
  );
}

// FormField wrapper component for easier integration with react-hook-form
export interface DatePickerFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  buttonClassName?: string;
  showClearButton?: boolean;
  error?: boolean;
}

export function DatePickerField({
  value,
  onChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlur,
  disabled,
  placeholder,
  minDate,
  maxDate,
  className,
  buttonClassName,
  showClearButton,
  error,
}: DatePickerFieldProps) {
  return (
    <DatePicker
      value={value}
      onChange={onChange}
      onClear={onChange ? () => onChange('') : undefined}
      placeholder={placeholder}
      disabled={disabled}
      minDate={minDate}
      maxDate={maxDate}
      className={className}
      buttonClassName={buttonClassName}
      showClearButton={showClearButton}
      error={error}
    />
  );
}
