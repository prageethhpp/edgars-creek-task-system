# Admin Account Setup

## Method 1: Manual Registration (Recommended)

1. Go to http://localhost:3001 (or your deployed URL)
2. Click **"Register"** 
3. Fill in the form:
   - **Email**: `admin@edgarscreek.com`
   - **Password**: `Panda1510@`
   - **Name**: `System Administrator`
4. Click Register

5. **Update the role in Firebase Console**:
   - Open [Firebase Console](https://console.firebase.google.com)
   - Select your project: `edgars-creek-task-system`
   - Go to **Firestore Database**
   - Find the `users` collection
   - Click on the user document with email `admin@edgarscreek.com`
   - Click **Edit** (pencil icon)
   - Change the `role` field from `staff` to `admin`
   - Click **Update**

6. **Logout and Login again**:
   - Logout from the application
   - Login with `admin@edgarscreek.com` / `Panda1510@`
   - You should now see admin features including "Manage Users" link

## Admin Features

Once logged in as admin, you have access to:

### 1. **User Management** (`/admin/users`)
   - View all registered users
   - Change user roles (staff, agent, admin)
   - See user statistics
   - Track when users joined

### 2. **Agent Dashboard** (`/agent`)
   - View all tickets
   - Assign tickets to yourself or other agents
   - Update ticket status
   - Filter tickets by status and type

### 3. **Reports & Statistics** (`/agent/reports`)
   - View ticket statistics
   - Track agent performance
   - See resolution rates
   - Filter by time period

### 4. **All Staff Features**
   - Create tickets
   - View your own tickets
   - Reply to tickets
   - Track ticket status

## Managing Other Users

As an admin, you can:

1. Go to **Manage Users** from the sidebar
2. Find any user in the table
3. Use the dropdown in the "Change Role" column to change their role:
   - **Staff**: Regular users who can create and track their tickets
   - **Agent**: IT support staff who can manage all tickets
   - **Admin**: Full access including user management

## Default Credentials

- **Email**: admin@edgarscreek.com
- **Password**: Panda1510@
- **Role**: admin

## Security Notes

- Change the admin password after first login
- Only assign admin role to trusted users
- Regularly review user roles in the User Management page
