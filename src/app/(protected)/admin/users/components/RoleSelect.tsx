'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { USER_ROLE_OPTIONS } from '../data';

interface RoleSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function RoleSelect({ value, onChange }: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Select role' />
      </SelectTrigger>
      <SelectContent>
        {USER_ROLE_OPTIONS.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
