'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket, Message } from '@/types';

interface AgentPerformance {
  agentId: string;
  agentName: string;
  ticketsAssigned: number;
  ticketsResolved: number;
  avgResponseTime: string;
  resolutionRate: number;
}

export default function ReportsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
    if (!loading && user && user.role !== 'agent' && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && (user.role === 'agent' || user.role === 'admin')) {
      loadData();
    }
  }, [user, selectedPeriod]);

  const loadData = async () => {
    try {
      // Load all tickets
      const ticketsQuery = query(collection(db, 'tickets'));
      const ticketsSnapshot = await getDocs(ticketsQuery);
      const ticketsData = ticketsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Ticket[];

      // Filter by period
      const now = new Date();
      let filteredTickets = ticketsData;
      if (selectedPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredTickets = ticketsData.filter(t => new Date(t.createdAt) >= weekAgo);
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredTickets = ticketsData.filter(t => new Date(t.createdAt) >= monthAgo);
      }

      setTickets(filteredTickets);

      // Load all messages
      const messagesQuery = query(collection(db, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];

      setMessages(messagesData);

      // Calculate agent performance
      const agentMap = new Map<string, AgentPerformance>();
      
      filteredTickets.forEach(ticket => {
        if (ticket.assignedTo && ticket.assignedToName) {
          if (!agentMap.has(ticket.assignedTo)) {
            agentMap.set(ticket.assignedTo, {
              agentId: ticket.assignedTo,
              agentName: ticket.assignedToName,
              ticketsAssigned: 0,
              ticketsResolved: 0,
              avgResponseTime: '0h',
              resolutionRate: 0,
            });
          }

          const agent = agentMap.get(ticket.assignedTo)!;
          agent.ticketsAssigned++;
          if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
            agent.ticketsResolved++;
          }
        }
      });

      // Calculate resolution rate
      agentMap.forEach(agent => {
        agent.resolutionRate = agent.ticketsAssigned > 0 
          ? Math.round((agent.ticketsResolved / agent.ticketsAssigned) * 100)
          : 0;
      });

      setAgentPerformance(Array.from(agentMap.values()));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
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

  // Calculate statistics
  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    closed: tickets.filter(t => t.status === 'Closed').length,
    urgent: tickets.filter(t => t.status === 'Urgent').length,
    itSupport: tickets.filter(t => t.type === 'IT Support').length,
    facility: tickets.filter(t => t.type === 'Facility').length,
  };

  const resolutionRate = stats.total > 0 
    ? Math.round(((stats.resolved + stats.closed) / stats.total) * 100)
    : 0;

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
              <p className="text-gray-500 dark:text-gray-400 text-sm">Reports</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2 mt-4">
            <Link href="/agent" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">support_agent</span>
              <p className="text-sm font-medium">Agent Dashboard</p>
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined">group</span>
                <p className="text-sm font-medium">Manage Users</p>
              </Link>
            )}
            <Link href="/tickets" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">local_offer</span>
              <p className="text-sm font-medium">My Tickets</p>
            </Link>
            <Link href="/agent/reports" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">bar_chart</span>
              <p className="text-sm font-medium">Reports</p>
            </Link>
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <p className="text-xs text-primary font-medium mt-1 uppercase">{user.role === 'admin' ? 'Admin' : 'Agent'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Reports & Statistics</h1>
              <p className="text-gray-600 dark:text-gray-400">Track performance and ticket metrics</p>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'all')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {loadingData ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview Stats */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tickets</p>
                      <span className="material-symbols-outlined text-gray-400">confirmation_number</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Resolution Rate</p>
                      <span className="material-symbols-outlined text-blue-500">trending_up</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{resolutionRate}%</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">IT Support</p>
                      <span className="material-symbols-outlined text-primary">computer</span>
                    </div>
                    <p className="text-3xl font-bold text-primary">{stats.itSupport}</p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Facility</p>
                      <span className="material-symbols-outlined text-green-500">apartment</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.facility}</p>
                  </div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Status Breakdown</h2>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{stats.open}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Open</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">In Progress</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{stats.resolved}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Closed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Urgent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">
                        {tickets.filter(t => t.status === 'Pending').length}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pending</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Performance */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agent Performance</h2>
                {agentPerformance.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                    <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">person_off</span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No agent data</h3>
                    <p className="text-gray-600 dark:text-gray-400">No tickets have been assigned to agents yet</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Agent Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tickets Assigned
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Tickets Resolved
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Resolution Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {agentPerformance.map((agent) => (
                          <tr key={agent.agentId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{agent.agentName}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 dark:text-white">{agent.ticketsAssigned}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 dark:text-white">{agent.ticketsResolved}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{ width: `${agent.resolutionRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {agent.resolutionRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
