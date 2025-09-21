import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ResetPasswordForm from '@/features/auth/reset-password-form';
import Link from 'next/link';

interface ResetPasswordPageProps {
  searchParams: {
    token?: string;
  };
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <Card className='w-full shadow-lg'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold text-red-600'>
            Tautan Tidak Valid
          </CardTitle>
          <CardDescription>
            Tautan reset password ini tidak valid atau telah kedaluwarsa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center space-y-4'>
            <p className='text-gray-600'>
              Silakan minta tautan reset password baru.
            </p>
            <Link
              href='/forgot-password'
              className='inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors'
            >
              Minta Tautan Reset Baru
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full shadow-lg'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold'>Atur Password Baru</CardTitle>
        <CardDescription>
          Masukkan password baru Anda di bawah untuk menyelesaikan proses reset.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResetPasswordForm token={token} />
        <div className='mt-6 text-center'>
          <Link
            href='/signin'
            className='text-sm text-green-600 hover:text-green-500 font-medium'
          >
            Kembali ke Masuk
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
