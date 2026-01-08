'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function SignInButton() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    console.log('Attempting anonymous sign-in...');
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInAnonymously();
      
      if (signInError) {
        console.error('Supabase sign-in error:', signInError);
        setError(signInError.message);
        throw signInError;
      }
      
      console.log('Sign-in successful:', data);
    } catch (err: any) {
      console.error('Full catch error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    } catch (err: any) {
      console.error('Error signing out:', err);
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="text-sm">Sign Out</span>
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        <span className="text-sm font-semibold">Sign In (Anonymous)</span>
      </button>
      {error && <span className="text-xs text-red-500 max-w-[200px] text-right">{error}</span>}
    </div>
  );
}
