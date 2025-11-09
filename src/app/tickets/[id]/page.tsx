'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Ticket, Message } from '@/types';

export default function TicketDetailsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [showInternalNote, setShowInternalNote] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [sendingInternal, setSendingInternal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && ticketId) {
      loadTicket();
      loadMessages();
      if (user.role === 'agent' || user.role === 'admin') {
        loadAgents();
      }
    }
  }, [user, ticketId]);

  const loadAgents = async () => {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', 'in', ['agent', 'admin'])
      );
      const querySnapshot = await getDocs(q);
      const agentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAgents(agentsData);
    } catch (error) {
      console.error('Error loading agents:', error);
    }
  };

  const loadTicket = async () => {
    try {
      const ticketDoc = await getDoc(doc(db, 'tickets', ticketId));
      if (ticketDoc.exists()) {
        setTicket({
          id: ticketDoc.id,
          ...ticketDoc.data(),
          createdAt: ticketDoc.data().createdAt?.toDate() || new Date(),
          updatedAt: ticketDoc.data().updatedAt?.toDate() || new Date(),
        } as Ticket);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoadingTicket(false);
    }
  };

  const loadMessages = async () => {
    try {
      const q = query(
        collection(db, 'messages'),
        where('ticketId', '==', ticketId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const messagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Message[];
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !ticket) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ticketId: ticketId,
        senderId: user.uid,
        senderName: user.displayName,
        senderRole: user.role,
        message: newMessage,
        isInternal: false,
        createdAt: serverTimestamp(),
      });

      // Update ticket's updatedAt timestamp
      await updateDoc(doc(db, 'tickets', ticketId), {
        updatedAt: serverTimestamp(),
      });

      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim() || !user || !ticket) return;

    setSendingInternal(true);
    try {
      await addDoc(collection(db, 'messages'), {
        ticketId: ticketId,
        senderId: user.uid,
        senderName: user.displayName,
        senderRole: user.role,
        message: internalNote,
        isInternal: true,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'tickets', ticketId), {
        updatedAt: serverTimestamp(),
      });

      setInternalNote('');
      setShowInternalNote(false);
      loadMessages();
    } catch (error) {
      console.error('Error sending internal note:', error);
    } finally {
      setSendingInternal(false);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedAgent || !ticket) return;

    try {
      const agent = agents.find(a => a.uid === selectedAgent);
      await updateDoc(doc(db, 'tickets', ticketId), {
        assignedTo: selectedAgent,
        assignedToName: agent?.displayName || 'Unknown',
        updatedAt: serverTimestamp(),
      });

      // Add system message
      await addDoc(collection(db, 'messages'), {
        ticketId: ticketId,
        senderId: user!.uid,
        senderName: user!.displayName,
        senderRole: user!.role,
        message: `Ticket assigned to ${agent?.displayName || 'Unknown'}`,
        isInternal: true,
        createdAt: serverTimestamp(),
      });

      setShowAssignDialog(false);
      setSelectedAgent('');
      loadTicket();
      loadMessages();
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!ticket) return;

    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });

      // Add system message
      await addDoc(collection(db, 'messages'), {
        ticketId: ticketId,
        senderId: user!.uid,
        senderName: user!.displayName,
        senderRole: user!.role,
        message: `Status changed to ${newStatus}`,
        isInternal: true,
        createdAt: serverTimestamp(),
      });

      loadTicket();
      loadMessages();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading || loadingTicket || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ticket not found</h2>
          <Link href="/tickets" className="text-primary hover:underline">Back to tickets</Link>
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
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
    }
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
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </Link>
            <Link href="/tickets/create" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined">add_circle</span>
              <p className="text-sm font-medium">Create Ticket</p>
            </Link>
            <Link href="/tickets" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
              <span className="material-symbols-outlined">local_offer</span>
              <p className="text-sm font-medium">My Tickets</p>
            </Link>
            {user.role === 'agent' || user.role === 'admin' ? (
              <Link href="/agent" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                <span className="material-symbols-outlined">support_agent</span>
                <p className="text-sm font-medium">Agent Dashboard</p>
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            <span className="material-symbols-outlined">logout</span>
            <p className="text-sm font-medium">Logout</p>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/tickets" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">#{ticket.ticketNumber}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">{ticket.subject}</p>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="grid grid-cols-5 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.priority}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.assignedToName || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons (Agent/Admin only) */}
          {(user.role === 'agent' || user.role === 'admin') && (
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAssignDialog(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Assign Ticket
              </button>
              <select
                value={ticket.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-medium"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Urgent">Urgent</option>
              </select>
              <button
                onClick={() => setShowInternalNote(!showInternalNote)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                Internal Note
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Original Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="bg-primary rounded-full size-10 flex items-center justify-center text-white font-bold shrink-0">
                  {ticket.createdByName?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{ticket.createdByName}</p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {messages.map((message) => {
              // Hide internal notes from regular users
              if (message.isInternal && user.role !== 'agent' && user.role !== 'admin') {
                return null;
              }

              return (
                <div 
                  key={message.id} 
                  className={`rounded-lg p-6 border ${
                    message.isInternal 
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${message.senderRole === 'agent' || message.senderRole === 'admin' ? 'bg-blue-600' : 'bg-primary'} rounded-full size-10 flex items-center justify-center text-white font-bold shrink-0`}>
                      {message.senderName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{message.senderName}</p>
                        {(message.senderRole === 'agent' || message.senderRole === 'admin') && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                            {message.senderRole === 'admin' ? 'Admin' : 'Agent'}
                          </span>
                        )}
                        {message.isInternal && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 text-xs font-medium rounded flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">lock</span>
                            Internal Note
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Internal Note Form (Agent/Admin only) */}
        {showInternalNote && (user.role === 'agent' || user.role === 'admin') && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-300 dark:border-amber-700 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">lock</span>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Internal Note (Only visible to agents and admins)</p>
              </div>
              <form onSubmit={handleSendInternalNote}>
                <div className="flex gap-4">
                  <textarea
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Type your internal note..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-amber-300 dark:border-amber-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={sendingInternal || !internalNote.trim()}
                      className="px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingInternal ? 'Sending...' : 'Send'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowInternalNote(false);
                        setInternalNote('');
                      }}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reply Form */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                rows={3}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary resize-none"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-fit"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Assign Ticket Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Assign Ticket</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Agent
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="">-- Select an agent --</option>
                {agents.map((agent) => (
                  <option key={agent.uid} value={agent.uid}>
                    {agent.displayName} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAssignTicket}
                disabled={!selectedAgent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setShowAssignDialog(false);
                  setSelectedAgent('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
