# Edgars Creek Task System - Project Setup Guide

## Quick Start

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project named "edgars-creek-task-system"
   - Enable the following services:
     - Authentication (Email/Password + Google Sign-In)
     - Firestore Database
     - Storage

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Firebase credentials from Project Settings

4. **Run Development Server**
```bash
npm run dev
```

## Firebase Setup Details

### Authentication Setup
1. Go to Authentication > Sign-in method
2. Enable:
   - Email/Password
   - Google (configure OAuth consent screen)

### Firestore Database Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['agent', 'admin']);
    }
    
    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
    
    match /agents/{agentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /ticket-attachments/{ticketId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## Deployment to Vercel

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel
   - Connect your GitHub repository

2. **Configure Environment Variables in Vercel**
   - Add all Firebase environment variables
   - These should match your `.env.local` file

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   │   ├── login/
│   │   └── register/
│   ├── (staff)/           # Staff-facing pages
│   │   ├── dashboard/
│   │   └── tickets/
│   ├── (agent)/           # Agent-facing pages
│   │   ├── dashboard/
│   │   ├── tickets/
│   │   └── settings/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/            # Reusable components
│   ├── Sidebar.tsx
│   ├── TicketCard.tsx
│   ├── TicketForm.tsx
│   └── ...
├── lib/                   # Utilities
│   ├── firebase.ts
│   └── utils.ts
└── types/                 # TypeScript types
    └── index.ts
```

## Next Steps

1. Install dependencies: `npm install`
2. Set up Firebase project
3. Configure environment variables
4. Run development server
5. Start building features!

## Features to Implement

- [ ] Authentication (Login/Register)
- [ ] Staff Dashboard
- [ ] Create Ticket (IT/Facility)
- [ ] Agent Dashboard
- [ ] Ticket Details & Replies
- [ ] Agent Management
- [ ] Reports & Statistics
- [ ] Real-time updates
- [ ] File attachments
- [ ] Email notifications

## Support

For questions or issues, refer to the documentation or contact the development team.
