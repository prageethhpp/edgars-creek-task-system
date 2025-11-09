'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function CreateTicketForm() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [ticketType, setTicketType] = useState<'IT Support' | 'Facility'>(
    searchParams.get('type') === 'facility' ? 'Facility' : 'IT Support'
  );
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Generate ticket number
      const ticketNumber = `ECPS-${Date.now().toString().slice(-6)}`;

      // Create ticket in Firestore
      const now = new Date();
      const ticketData = {
        ticketNumber,
        type: ticketType,
        subject,
        description,
        category,
        status: 'Open',
        priority,
        createdBy: user.uid,
        createdByName: user.displayName,
        createdByEmail: user.email,
        createdAt: now,
        updatedAt: now,
      };
      
      console.log('Creating ticket with data:', ticketData);
      const docRef = await addDoc(collection(db, 'tickets'), ticketData);
      console.log('Ticket created successfully with ID:', docRef.id);

      setSuccess(true);
      
      // Redirect to tickets list after 2 seconds
      setTimeout(() => {
        router.push('/tickets');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setError(err.message || 'Failed to create ticket. Please try again.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ticket Created!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Your ticket has been submitted successfully.</p>
          <Link href="/tickets" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            View My Tickets
          </Link>
        </div>
      </div>
    );
  }

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
            <Link href="/tickets/create" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary">
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
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            <p className="text-xs text-primary font-medium mt-1 uppercase">{user.role}</p>
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
        <div className="mx-auto max-w-4xl">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-gray-900 dark:text-white text-3xl font-bold mb-2">Create a New Ticket</h1>
            <p className="text-gray-600 dark:text-gray-400">Please fill out the form below to submit a new ticket.</p>
          </div>

          {/* Form Container */}
          <div className="bg-white dark:bg-background-dark dark:border dark:border-gray-700 rounded-xl shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ticket Type Selection */}
              <div>
                <p className="text-gray-900 dark:text-gray-200 text-sm font-medium mb-2">Ticket Type</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    ticketType === 'IT Support' 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      checked={ticketType === 'IT Support'}
                      onChange={() => setTicketType('IT Support')}
                      className="form-radio text-primary focus:ring-primary"
                    />
                    <div className="ml-3 flex flex-col">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">IT Support</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">For tech-related issues</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    ticketType === 'Facility' 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    <input
                      type="radio"
                      checked={ticketType === 'Facility'}
                      onChange={() => setTicketType('Facility')}
                      className="form-radio text-primary focus:ring-primary"
                    />
                    <div className="ml-3 flex flex-col">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-200">Facility Ticket</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">For maintenance requests</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category (only for IT Support) */}
              {ticketType === 'IT Support' && (
                <div>
                  <label className="text-gray-900 dark:text-gray-200 text-sm font-medium block mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4 text-base"
                  >
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Network">Network</option>
                    <option value="Printer">Printer</option>
                    <option value="Account Access">Account Access</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {/* Priority */}
              <div>
                <label className="text-gray-900 dark:text-gray-200 text-sm font-medium block mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { value: 'Low', color: 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300', icon: 'trending_down' },
                    { value: 'Medium', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400', icon: 'remove' },
                    { value: 'High', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400', icon: 'trending_up' },
                    { value: 'Critical', color: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400', icon: 'emergency' }
                  ].map((p) => (
                    <label key={p.value} className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      priority === p.value 
                        ? `${p.color} ring-2 ring-offset-2 ring-primary` 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                    }`}>
                      <input
                        type="radio"
                        name="priority"
                        checked={priority === p.value}
                        onChange={() => setPriority(p.value as any)}
                        className="sr-only"
                      />
                      <span className="material-symbols-outlined text-lg mr-1">{p.icon}</span>
                      <span className="text-sm font-medium">{p.value}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="text-gray-900 dark:text-gray-200 text-sm font-medium block mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full rounded-lg text-gray-500 dark:text-gray-400 focus:outline-0 border-none bg-gray-100 dark:bg-gray-900 h-12 px-4 text-base cursor-not-allowed"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-gray-900 dark:text-gray-200 text-sm font-medium block mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4 text-base"
                  placeholder="e.g., Projector in Room 12 not working"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-gray-900 dark:text-gray-200 text-sm font-medium block mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-36 rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-4 text-base"
                  placeholder="Please describe the issue in detail. Include any error messages or steps to reproduce the problem."
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Please include any error messages you see.
                </p>
              </div>

              {/* Attachments (placeholder for now) */}
              <div>
                <p className="text-gray-900 dark:text-gray-200 text-sm font-medium mb-2">
                  Attachments (Optional)
                </p>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-gray-400 mb-3">cloud_upload</span>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or PDF (MAX. 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*,.pdf" />
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center h-12 gap-2 px-6 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CreateTicketPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <CreateTicketForm />
    </Suspense>
  );
}
