import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginDemo: (role: UserRole, email: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  loginDemo: () => {},
  logout: async () => {} 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Persistence for Demo Mode
  useEffect(() => {
    const demoUser = localStorage.getItem('eduxcel_demo_user');
    const demoProfile = localStorage.getItem('eduxcel_demo_profile');
    
    if (demoUser && demoProfile) {
      setUser(JSON.parse(demoUser));
      setProfile(JSON.parse(demoProfile));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const profileDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginDemo = (role: UserRole, email: string) => {
    const mockUser = {
      uid: `demo_${role}_${Date.now()}`,
      email: email,
      displayName: `Demo ${role.toUpperCase()}`,
      emailVerified: true
    } as any;

    const mockProfile: UserProfile = {
      uid: mockUser.uid,
      email: email,
      displayName: `Demo ${role.toUpperCase()}`,
      role: role,
      schoolId: 'demo_school_123',
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('eduxcel_demo_user', JSON.stringify(mockUser));
    localStorage.setItem('eduxcel_demo_profile', JSON.stringify(mockProfile));
    
    setUser(mockUser);
    setProfile(mockProfile);
  };

  const logout = async () => {
    localStorage.removeItem('eduxcel_demo_user');
    localStorage.removeItem('eduxcel_demo_profile');
    await auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
