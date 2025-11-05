/**
 * Admin Account Setup Instructions
 * 
 * To create the default admin account:
 * 1. Go to http://localhost:3001 (or your deployed URL)
 * 2. Click "Register" 
 * 3. Register with:
 *    - Email: admin@edgarscreek.com
 *    - Password: Panda1510@
 *    - Name: System Administrator
 * 
 * 4. After registration, go to Firebase Console:
 *    - Open Firestore Database
 *    - Go to 'users' collection
 *    - Find the user with email 'admin@edgarscreek.com'
 *    - Edit the document and change 'role' from 'staff' to 'admin'
 * 
 * 5. Logout and login again to see admin features
 * 
 * OR use this automated script:
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (copy from your .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    // Create the admin user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@edgarscreek.com',
      'Panda1510@'
    );

    console.log('✅ Admin user created:', userCredential.user.uid);

    // Create admin profile in Firestore with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: 'admin@edgarscreek.com',
      displayName: 'System Administrator',
      role: 'admin',
      department: 'IT Administration',
      createdAt: serverTimestamp()
    });

    console.log('✅ Admin profile created in Firestore');
    console.log('\n=== Admin Account Created ===');
    console.log('Email: admin@edgarscreek.com');
    console.log('Password: Panda1510@');
    console.log('Role: admin');
    console.log('=============================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nℹ️  Please create the account manually through the registration page.');
    process.exit(1);
  }
}

// Only run if executed directly
if (require.main === module) {
  createAdminUser();
}
