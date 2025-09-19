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
        <CardTitle className='text-2xl font-bold'>Reset Password</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
        <div className='mt-6 text-center'>
          <Link
            href='/signin'
            className='text-sm text-green-600 hover:text-green-500 font-medium'
          >
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
