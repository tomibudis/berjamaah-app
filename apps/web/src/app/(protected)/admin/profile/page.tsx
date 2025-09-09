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

          {/* Security Settings */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Pengaturan Keamanan
            </h2>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      Ubah Kata Sandi
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Perbarui kata sandi Anda untuk menjaga keamanan akun
                    </p>
                  </div>
                  <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                    Ubah
                  </button>
                </div>
              </div>
            </div>
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
