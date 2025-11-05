'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full size-10 flex items-center justify-center text-white font-bold">
              {user.displayName?.charAt(0) || 'E'}
            </div>
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-white text-base font-medium">ECPS Task System</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Ticketing System</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 mt-4">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </Link>
            <Link href="/tickets/create" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">add_circle</span>
              <p className="text-sm font-medium">Create Ticket</p>
            </Link>
            <Link href="/tickets" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">local_offer</span>
              <p className="text-sm font-medium">My Tickets</p>
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">
              Welcome, {user.displayName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's an overview of your support tickets
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open Tickets</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-blue-600 dark:text-blue-400">confirmation_number</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-yellow-600 dark:text-yellow-400">schedule</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">check_circle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/tickets/create?type=it"
                className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <div className="p-3 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary">computer</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">IT Support Request</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Report technical issues</p>
                </div>
              </Link>

              <Link 
                href="/tickets/create?type=facility"
                className="flex items-center gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors"
              >
                <div className="p-3 bg-primary/10 rounded-lg">
                  <span className="material-symbols-outlined text-2xl text-primary">build</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Facility Request</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance and repairs</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
