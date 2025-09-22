import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../index.css';
import Providers from '@/components/shared/providers';
import Header from '@/components/layout/header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Berjamaah App',
  description: 'Berjamaah App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className='grid grid-rows-[auto_1fr] h-svh'>
            <Header />
            <div className='bg-white dark:bg-gray-900 mt-16'>
              <div className='mx-auto max-w-sm px-0 py-4 sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg'>
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
