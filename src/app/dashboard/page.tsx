'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket } from '@/types';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    urgent: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && !user) {
      window.location.href = '/';
    }
    // Auto-redirect agents and admins to agent dashboard
    if (mounted && !loading && user && (user.role === 'agent' || user.role === 'admin')) {
      router.push('/agent');
    }
  }, [user, loading, mounted, router]);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user]);

  const loadStatistics = async () => {
    if (!user) return;
    
    setLoadingStats(true);
    try {
      const q = query(
        collection(db, 'tickets'),
        where('createdBy', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const tickets = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Ticket[];
      
      // Calculate statistics
      setStats({
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved').length,
        closed: tickets.filter(t => t.status === 'Closed').length,
        urgent: tickets.filter(t => t.status === 'Urgent').length,
      });

      // Get recent tickets (last 5)
      const sortedTickets = tickets.sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      ).slice(0, 5);
      setRecentTickets(sortedTickets);
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background-light to-gray-100 dark:from-background-dark dark:to-gray-900">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary animate-pulse-slow text-2xl">dashboard</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-background-light to-gray-100 dark:from-background-dark dark:to-gray-900">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-700 p-4 animate-slide-in">
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
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary transition-all duration-200 hover:bg-primary/20 hover:scale-105">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </Link>
            {(user.role === 'agent' || user.role === 'admin') && (
              <Link href="/agent" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105">
                <span className="material-symbols-outlined">support_agent</span>
                <p className="text-sm font-medium">Agent Dashboard</p>
              </Link>
            )}
            {user.role === 'admin' && (
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105">
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Manage Users</p>
              </Link>
            )}
            <Link href="/tickets/create" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105">
              <span className="material-symbols-outlined">add_circle</span>
              <p className="text-sm font-medium">Create Ticket</p>
            </Link>
            <Link href="/tickets" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105">
              <span className="material-symbols-outlined">local_offer</span>
              <p className="text-sm font-medium">My Tickets</p>
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <p className="text-xs text-primary font-medium mt-1 uppercase">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-gray-900 dark:text-white text-4xl font-bold mb-2">
              Welcome, {user.displayName}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Here's an overview of your support tickets
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Link href="/tickets?filter=all" className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-fade-in cursor-pointer text-white" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Tickets</p>
                  <p className="text-4xl font-bold mt-2">{loadingStats ? '...' : stats.total}</p>
                </div>
                <div className="p-4 bg-white/20 rounded-xl transition-transform duration-300 hover:rotate-12">
                  <span className="material-symbols-outlined text-3xl">confirmation_number</span>
                </div>
              </div>
            </Link>

            <Link href="/tickets?filter=open" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-green-500 animate-fade-in cursor-pointer" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Open Tickets</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{loadingStats ? '...' : stats.open}</p>
                </div>
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl transition-transform duration-300 hover:rotate-12">
                  <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">radio_button_checked</span>
                </div>
              </div>
            </Link>

            <Link href="/tickets?filter=in-progress" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-yellow-500 animate-fade-in cursor-pointer" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">In Progress</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{loadingStats ? '...' : stats.inProgress}</p>
                </div>
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl transition-transform duration-300 hover:rotate-12">
                  <span className="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">pending</span>
                </div>
              </div>
            </Link>

            <Link href="/tickets?filter=resolved" className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-500 animate-fade-in cursor-pointer" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Resolved</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{loadingStats ? '...' : stats.resolved}</p>
                </div>
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl transition-transform duration-300 hover:rotate-12">
                  <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">check_circle</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in mb-8" style={{animationDelay: '0.5s'}}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/tickets/create?type=it"
                className="group flex items-center gap-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="p-4 bg-primary/10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <span className="material-symbols-outlined text-3xl text-primary">computer</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">IT Support Request</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Report technical issues</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-400 group-hover:text-primary transition-transform duration-300 group-hover:translate-x-2">arrow_forward</span>
              </Link>

              <Link 
                href="/tickets/create?type=facility"
                className="group flex items-center gap-4 p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 dark:hover:from-primary/10 dark:hover:to-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="p-4 bg-primary/10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <span className="material-symbols-outlined text-3xl text-primary">build</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Facility Request</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance and repairs</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-400 group-hover:text-primary transition-transform duration-300 group-hover:translate-x-2">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Tickets
              </h2>
              <Link href="/tickets" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                View all
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            
            {loadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">Loading tickets...</p>
              </div>
            ) : recentTickets.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">inbox</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No tickets yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first ticket to get started</p>
                <Link href="/tickets/create" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined">add_circle</span>
                  Create Ticket
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTickets.map((ticket) => (
                  <Link 
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        ticket.status === 'Open' ? 'bg-green-500' :
                        ticket.status === 'In Progress' ? 'bg-yellow-500' :
                        ticket.status === 'Resolved' ? 'bg-blue-500' :
                        ticket.status === 'Urgent' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          #{ticket.ticketNumber}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                          {ticket.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{ticket.subject}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mt-1 inline-block">
                        {ticket.status}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-all group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
