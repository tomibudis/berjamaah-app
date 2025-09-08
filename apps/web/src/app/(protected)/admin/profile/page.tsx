import { Button } from '@/components/ui/button';

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

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
              <div className="space-y-4">
                {/* Profile Photo */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-gray-400 dark:text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                    </svg>
                  </div>
                  <div></div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Depan
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Masukkan nama depan Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Belakang
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Masukkan nama belakang Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Masukkan nomor telepon Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="Ceritakan tentang diri Anda..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
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
