import BottomNavigationAdmin from '@/components/layout/bottom-navigation-admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="pb-14">{children}</div>
      <BottomNavigationAdmin />
    </div>
  );
}
