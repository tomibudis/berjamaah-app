import { Button } from '@/components/ui/button';
import { AdminProfileForm } from '@/features/admin/admin-profile-form';

export default function ProfilePage() {
  return (
    <div>
      <div className='space-y-6'>
        {/* Header */}
        <div>
          <h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Pengaturan Profil
          </h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Kelola informasi pribadi dan pengaturan akun Anda
          </p>
        </div>

        {/* Personal Information */}
        <div>
          <h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
            Informasi Pribadi
          </h2>

          <AdminProfileForm />
        </div>

        <div className='flex items-center justify-between'>
          <Button size='sm' variant='destructive' className='w-full'>
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );
}
