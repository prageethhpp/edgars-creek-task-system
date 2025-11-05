'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User as UserType } from '@/types';

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'No user');
      try {
        if (firebaseUser) {
          console.log('Fetching user from Firestore...');
          // Try to fetch user data from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              console.log('User found in Firestore');
              setUser(userDoc.data() as UserType);
            } else {
              console.log('Creating new user profile in Firestore');
              // Create default user profile
              const newUser: UserType = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
                role: 'staff',
                photoURL: firebaseUser.photoURL || undefined,
                createdAt: new Date(),
              };
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
              console.log('User profile created');
              setUser(newUser);
            }
          } catch (firestoreError) {
            console.error('Firestore error, using basic user data:', firestoreError);
            // If Firestore fails, create a basic user object from Firebase Auth
            const basicUser: UserType = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              role: 'staff',
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date(),
            };
            setUser(basicUser);
          }
        } else {
          console.log('No user, setting to null');
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    const newUser: UserType = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName,
      role: 'staff',
      createdAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
