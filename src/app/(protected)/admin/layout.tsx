import BottomNavigationAdmin from '@/components/layout/bottom-navigation-admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=''>
      <div className='pb-14 mx-auto max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg'>
        {children}
      </div>
      <BottomNavigationAdmin />
    </div>
  );
}
