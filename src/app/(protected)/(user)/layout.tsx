import BottomNavigationUser from '@/components/layout/bottom-navigation-user';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="pb-14">{children}</div>
      <BottomNavigationUser />
    </div>
  );
}
