'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  User,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Settings,
  Shield,
  Home,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (isPending) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }

  if (!session) {
    // Hide the Sign In button when on the signin page
    if (pathname === '/signin') {
      return null;
    }

    return (
      <Button variant="outline" asChild>
        <Link href="/signin">Sign In</Link>
      </Button>
    );
  }

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>

          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{session.user.name || 'User'}</span>
            <span className="text-xs text-muted-foreground">
              {session.user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Theme Toggle Section */}
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
          Tema
        </DropdownMenuLabel>
        {mounted && (
          <>
            <DropdownMenuCheckboxItem
              checked={theme === 'light'}
              onCheckedChange={() => setTheme('light')}
              className="flex items-center gap-2"
            >
              <Sun className="w-4 h-4" />
              Terang
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme('dark')}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              Gelap
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={theme === 'system'}
              onCheckedChange={() => setTheme('system')}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Sistem
            </DropdownMenuCheckboxItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Admin Dashboard Link */}
        {session.user.role === 'admin' && (
          <>
            <DropdownMenuItem
              asChild
              className="flex items-center gap-2 cursor-pointer"
            >
              <Link href={'/admin/home' as any}>
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              asChild
              className="flex items-center gap-2 cursor-pointer"
            >
              <Link href={'/' as any}>
                <Home className="w-4 h-4" />
                Back to Homepage
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="w-4 h-4 text-red-600" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
