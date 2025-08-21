'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/components/ui/Toast';

export type UserType = 'client' | 'admin';

export function useMagicLinkAuth(defaultUserType: UserType = 'client') {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();
  const supabase = useMemo(() => createClient(), []);

  const sendMagicLink = async (userType: UserType = defaultUserType) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      addToast({ type: 'error', title: 'Invalid email', message: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth/callback?userType=${userType}`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;
      setSent(true);
      addToast({ type: 'success', title: 'Magic link sent', message: 'Check your email for the sign-in link.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to send link', message: err.message || 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, loading, sent, sendMagicLink };
}
