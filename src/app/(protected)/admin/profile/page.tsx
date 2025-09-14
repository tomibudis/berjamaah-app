import { Button } from '@/components/ui/button';
import { AdminProfileForm } from '@/features/admin/admin-profile-form';

export default function ProfilePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-sm px-4 py-6 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pengaturan Profil
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kelola informasi pribadi dan pengaturan akun Anda
            </p>
          </div>

          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Informasi Pribadi
            </h2>

            <AdminProfileForm />
          </div>

          <div className="flex items-center justify-between">
            <Button size="sm" variant="destructive" className="w-full">
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
