'use client';

import { ReactNode } from 'react';

interface FiltersTableProps {
  children: ReactNode;
}

export function FiltersTable({ children }: FiltersTableProps) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>{children}</div>
    </div>
  );
}
