import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  token: string | null;
  setTokenAndFetchProfile: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  token: null,
  setTokenAndFetchProfile: async () => {},
  logout: () => {} 
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('eduxcel_token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentToken: string) => {
    try {
      const res = await fetch('http://localhost:8000/users/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const setTokenAndFetchProfile = async (newToken: string) => {
    localStorage.setItem('eduxcel_token', newToken);
    setToken(newToken);
    setLoading(true);
    await fetchProfile(newToken);
  };

  const logout = () => {
    localStorage.removeItem('eduxcel_token');
    setToken(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user: profile, profile, loading, token, setTokenAndFetchProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

