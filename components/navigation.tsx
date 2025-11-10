'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Upload, Settings } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200/80 dark:border-gray-800/50 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:opacity-80 transition-opacity flex items-center gap-2">
            <Database className="h-5 w-5" />
            <span>Lead Tracker</span>
          </Link>
          <div className="flex gap-1">
            <NavLink href="/" isActive={pathname === '/'} icon={Upload}>
              Upload
            </NavLink>
            <NavLink href="/database" isActive={pathname === '/database'} icon={Database}>
              Database
            </NavLink>
            <NavLink href="/settings" isActive={pathname === '/settings'} icon={Settings}>
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
  icon: Icon,
}: {
  href: string;
  children: React.ReactNode;
  isActive: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        isActive
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-gray-100'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
}

