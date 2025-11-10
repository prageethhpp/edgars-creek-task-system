'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { ToastContainer, ToastProps } from '@/components/Toast';

interface Notification {
  id: string;
  userId: string;
  ticketId: string;
  ticketNumber: string;
  type: 'ticket_created' | 'ticket_assigned' | 'status_changed' | 'new_message' | 'internal_note';
  message: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    // Listen to notifications for the current user
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications: Notification[] = [];
      const addedDocs: any[] = [];

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          addedDocs.push({
            id: change.doc.id,
            ...change.doc.data(),
          });
        }
      });

      snapshot.forEach((doc) => {
        const data = doc.data();
        newNotifications.push({
          id: doc.id,
          userId: data.userId,
          ticketId: data.ticketId,
          ticketNumber: data.ticketNumber,
          type: data.type,
          message: data.message,
          read: data.read || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });

      setNotifications(newNotifications);

      // Show toast for new notifications (skip first load)
      if (addedDocs.length > 0 && notifications.length > 0) {
        addedDocs.forEach((doc) => {
          const data = doc;
          // Only show toast for recent notifications (last 5 seconds)
          const notifTime = data.createdAt?.toDate?.() || new Date();
          const now = new Date();
          const diffInSeconds = (now.getTime() - notifTime.getTime()) / 1000;
          
          if (diffInSeconds < 5) {
            showToast(data.message, 'info');
          }
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    // Implement mark as read functionality
    // This would update the notification document in Firestore
  };

  const markAllAsRead = async () => {
    // Implement mark all as read functionality
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
