'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white hover:text-blue-100 transition-colors flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Lead Deduplicator
          </Link>
          <div className="flex gap-2">
            <NavLink href="/" isActive={pathname === '/'}>
              Upload
            </NavLink>
            <NavLink href="/database" isActive={pathname === '/database'}>
              Master Database
            </NavLink>
            <NavLink href="/settings" isActive={pathname === '/settings'}>
              Settings
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
        isActive
          ? 'bg-white text-blue-600 shadow-md'
          : 'text-white hover:bg-blue-500 dark:hover:bg-blue-800'
      }`}
    >
      {children}
    </Link>
  );
}

