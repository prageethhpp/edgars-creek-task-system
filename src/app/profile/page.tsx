'use client';

import { useAuth } from '@/lib/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const updateRole = async (newRole: 'staff' | 'agent' | 'admin') => {
    if (!user) return;
    
    setUpdating(true);
    setMessage('');
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole
      });
      setMessage(`Role updated to ${newRole}! Please refresh the page.`);
      
      // Refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage('Error updating role. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please login first</p>
          <Link href="/" className="text-primary hover:underline mt-2 block">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">User Profile & Role Management</h1>
          
          {/* Current User Info */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Information</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Name:</span>
                <span className="text-gray-900 dark:text-white">{user.displayName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Email:</span>
                <span className="text-gray-900 dark:text-white">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">User ID:</span>
                <span className="text-gray-900 dark:text-white text-sm font-mono">{user.uid}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-medium">Current Role:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                  user.role === 'agent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {user.role.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Role Update Buttons */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Update Role (Testing Only)</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Click a button below to change your role. This is for testing purposes. In production, only admins should be able to change roles.
            </p>
            
            <div className="flex gap-4">
              <button
                onClick={() => updateRole('staff')}
                disabled={updating || user.role === 'staff'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set as Staff
              </button>
              <button
                onClick={() => updateRole('agent')}
                disabled={updating || user.role === 'agent'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set as Agent
              </button>
              <button
                onClick={() => updateRole('admin')}
                disabled={updating || user.role === 'admin'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Set as Admin
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('Error') 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            }`}>
              {message}
            </div>
          )}

          {/* Navigation */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Links:</h3>
            <div className="flex gap-3">
              <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link>
              {(user.role === 'agent' || user.role === 'admin') && (
                <Link href="/agent" className="text-primary hover:underline">Agent Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link href="/admin/users" className="text-primary hover:underline">Manage Users</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
