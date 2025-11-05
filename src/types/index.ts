export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'staff' | 'agent' | 'admin';
  department?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  type: 'IT Support' | 'Facility';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Urgent';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
}

export interface Message {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'staff' | 'agent' | 'admin';
  message: string;
  isInternal: boolean;
  createdAt: Date;
  attachments?: string[];
}

export interface Agent {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: 'agent' | 'admin';
  status: 'active' | 'disabled';
  ticketsResolved: number;
  avgResolutionTime: number;
  createdAt: Date;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
}
