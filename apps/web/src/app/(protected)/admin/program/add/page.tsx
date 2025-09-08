'use client';

import AddProgramForm from '@/features/program/add-program-form';

export default function AddProgramPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <AddProgramForm />
      </div>
    </div>
  );
}
