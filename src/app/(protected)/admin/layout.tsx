import BottomNavigationAdmin from '@/components/layout/bottom-navigation-admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className='pb-14 px-4'>{children}</div>
      <BottomNavigationAdmin />
    </>
  );
}
