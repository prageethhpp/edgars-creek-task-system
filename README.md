# Edgars Creek Task System

A comprehensive ticketing system for IT Support and Facility Management at Edgars Creek Primary School.

## Features

- 🔐 **Authentication**: Staff login/registration with Google Sign-In
- 🎫 **Ticket Management**: Create and track IT Support and Facility tickets
- 📊 **Dashboard**: View ticket status, statistics, and agent performance
- 💬 **Communication**: Real-time ticket updates and replies
- 👥 **Agent Management**: Manage support agents and assignments
- 📈 **Reports**: Performance analytics and resolution metrics

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Hosting**: Vercel
- **UI**: Material Symbols Icons, Custom Tailwind Components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd edgars-creek-task-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Enable Storage

4. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your Firebase configuration

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
edgars-creek-task-system/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── lib/             # Firebase config and utilities
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── Waht i want/         # Design references
```

## Firebase Configuration

1. **Authentication**: Enable Email/Password and Google providers
2. **Firestore Collections**:
   - `users` - User profiles and roles
   - `tickets` - Support tickets
   - `agents` - Agent information
   - `conversations` - Ticket conversations
3. **Storage**: For file attachments

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## License

Private - Edgars Creek Primary School

## Support

For support, contact the IT department at Edgars Creek Primary School.
