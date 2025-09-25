import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ForgotPasswordForm from '@/features/auth/forgot-password-form';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <Card className='w-full shadow-lg'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold'>Reset Kata Sandi</CardTitle>
        <CardDescription>
          Masukkan alamat email Anda dan kami akan mengirimkan link untuk
          mereset kata sandi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
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
