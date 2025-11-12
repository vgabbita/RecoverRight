'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  userRole?: 'player' | 'physician' | 'coach';
}

export default function Navbar({ userRole }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getDashboardLinks = () => {
    if (!userRole) return [];

    const baseLinks = {
      player: [
        { href: '/player', label: 'Dashboard' },
      ],
      physician: [
        { href: '/physician', label: 'Dashboard' },
      ],
      coach: [
        { href: '/coach', label: 'Dashboard' },
      ],
    };

    return baseLinks[userRole] || [];
  };

  const links = getDashboardLinks();

  return (
    <nav className="border-b bg-surface shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Activity className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-text-primary">
                RecoverRight
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    pathname === link.href
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            {userRole && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
