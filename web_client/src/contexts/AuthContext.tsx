'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Initializing AuthProvider...');
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth check timed out, setting loading to false');
      setIsLoading(false);
    }, 3000);
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      clearTimeout(timeout);
      if (error) {
        console.error('Error getting initial session:', error);
      }
      console.log('Initial session check:', session ? `User ID: ${session.user.id}` : 'No session');
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((err) => {
      clearTimeout(timeout);
      console.error('Failed to get session:', err);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? `User ID: ${session.user.id}` : 'No session');
      setUser(session?.user ?? null);
    });

    return () => {
      console.log('Cleaning up AuthProvider...');
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
