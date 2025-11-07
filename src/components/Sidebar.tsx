'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  user: {
    displayName?: string;
    email?: string;
    role: string;
  };
  onLogout?: () => void;
}

export function ResponsiveSidebar({ user, onLogout }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      show: true,
    },
    {
      href: '/agent',
      icon: 'support_agent',
      label: 'Agent Dashboard',
      show: user.role === 'agent' || user.role === 'admin',
    },
    {
      href: '/admin/users',
      icon: 'group',
      label: 'Manage Users',
      show: user.role === 'admin',
    },
    {
      href: '/tickets/create',
      icon: 'add_circle',
      label: 'Create Ticket',
      show: true,
    },
    {
      href: '/tickets',
      icon: 'local_offer',
      label: 'My Tickets',
      show: true,
    },
    {
      href: '/profile',
      icon: 'person',
      label: 'Profile',
      show: true,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
              {user.displayName?.charAt(0) || 'E'}
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white text-sm font-semibold">ECPS Task System</h1>
              <p className="text-gray-500 dark:text-gray-400 text-xs">{user.displayName}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 flex flex-col bg-white dark:bg-background-dark 
          border-r border-gray-200 dark:border-gray-700 p-4
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:mt-0
          ${isMobileMenuOpen ? 'translate-x-0 mt-16' : '-translate-x-full mt-16'}
          animate-slide-in
        `}
      >
        <div className="flex flex-col gap-4">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
              {user.displayName?.charAt(0) || 'E'}
            </div>
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-white text-base font-medium">ECPS Task System</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ticketing System</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 mt-4">
            {navigationItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 hover:scale-105
                    ${
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <p className="text-sm font-medium">{item.label}</p>
                </Link>
              ))}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <p className="text-xs text-primary font-medium mt-1 uppercase">{user.role}</p>
          </div>
          {onLogout && (
            <button
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
            >
              <span className="material-symbols-outlined">logout</span>
              <p className="text-sm font-medium">Logout</p>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <main className={`flex-1 p-4 lg:p-8 overflow-y-auto mt-16 lg:mt-0 ${className}`}>
      {children}
    </main>
  );
}
