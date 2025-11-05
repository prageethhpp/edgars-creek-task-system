'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket, TicketStats } from '@/types';

export default function AgentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0 });
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'all' | 'assigned'>('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role !== 'agent' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      loadTickets();
    }
  }, [user, selectedTab]);

  const loadTickets = async () => {
    if (!user) return;
    
    try {
      let q;
      if (selectedTab === 'assigned') {
        q = query(
          collection(db, 'tickets'),
          where('assignedTo', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'tickets'),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Ticket[];
      
      setTickets(ticketsData);
      
      // Calculate stats
      const statsData: TicketStats = {
        total: ticketsData.length,
        open: ticketsData.filter(t => t.status === 'Open').length,
        inProgress: ticketsData.filter(t => t.status === 'In Progress').length,
        resolved: ticketsData.filter(t => t.status === 'Resolved').length,
        urgent: ticketsData.filter(t => t.status === 'Urgent').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      loadTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handleAssignToMe = async (ticketId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        assignedTo: user.uid,
        assignedToName: user.displayName,
        status: 'In Progress',
        updatedAt: new Date(),
      });
      loadTickets();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400';
      case 'In Progress': return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400';
      case 'Resolved': return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400';
      case 'Closed': return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
      case 'Urgent': return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400';
      case 'Pending': return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    if (filterType !== 'all' && ticket.type !== filterType) return false;
    return true;
  });

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-white dark:bg-background-dark border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full size-10 flex items-center justify-center text-white font-bold">
              {user.displayName?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-white text-base font-medium">ECPS Task System</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Agent Dashboard</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 mt-4">
            <Link href="/agent" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">support_agent</span>
              <p className="text-sm font-medium">Agent Dashboard</p>
            </Link>
            <Link href="/tickets" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">local_offer</span>
              <p className="text-sm font-medium">My Tickets</p>
            </Link>
            <Link href="/agent/reports" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">bar_chart</span>
              <p className="text-sm font-medium">Reports</p>
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-xs text-primary font-medium mt-1">{user.role === 'admin' ? 'Admin' : 'Agent'}</p>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Agent Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and respond to support tickets</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tickets</p>
                <span className="material-symbols-outlined text-gray-400">confirmation_number</span>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Open</p>
                <span className="material-symbols-outlined text-green-500">radio_button_checked</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{stats.open}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">In Progress</p>
                <span className="material-symbols-outlined text-yellow-500">pending</span>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Resolved</p>
                <span className="material-symbols-outlined text-blue-500">check_circle</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.resolved}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Urgent</p>
                <span className="material-symbols-outlined text-red-500">warning</span>
              </div>
              <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedTab === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setSelectedTab('assigned')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                selectedTab === 'assigned'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Assigned to Me
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="IT Support">IT Support</option>
                <option value="Facility">Facility</option>
              </select>
            </div>
          </div>

          {/* Tickets Table */}
          {loadingTickets ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">inbox</span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tickets found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/tickets/${ticket.id}`} className="text-sm font-medium text-primary hover:underline">
                          #{ticket.ticketNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{ticket.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">{ticket.subject}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{ticket.createdByName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 ${getStatusColor(ticket.status)}`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Pending">Pending</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ticket.assignedToName ? (
                          <span className="text-sm text-gray-900 dark:text-white">{ticket.assignedToName}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            href={`/tickets/${ticket.id}`}
                            className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90"
                          >
                            View
                          </Link>
                          {!ticket.assignedTo && (
                            <button
                              onClick={() => handleAssignToMe(ticket.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Assign to Me
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
