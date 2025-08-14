/*
// components/auth/OneTapComponent.tsx

'use client';

import Script from 'next/script';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CredentialResponse {
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

const OneTapComponent = () => {
  const supabase = createClient();
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Generate nonce for Google ID token sign-in
  const generateNonce = async (): Promise<[string, string]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
    const encoder = new TextEncoder();
    const encodedNonce = encoder.encode(nonce);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedNonce = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return [nonce, hashedNonce];
  };

        const initializeGoogleOneTap = async () => {
    console.log('Initializing Google One Tap');

    // Check if Google script is loaded
            if (!window.google || !window.google.accounts) {
      console.warn('Google GSI script not loaded yet.');
      return;
            }

    try {
      // Check if there's already an existing session
      const { data, error } = await supabase.auth.getSession();
            if (error) {
        console.error('Error getting session', error);
        return;
            }

      // If a session exists, don't initialize One Tap
            if (data.session) {
        console.log('User already has a session. Skipping One Tap.');
        return;
            }

      const [nonce, hashedNonce] = await generateNonce();
      console.log('Generated nonce for One Tap');

      // Get Google Client ID from environment
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        console.error('Google Client ID not found in environment variables');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
                callback: async (response: CredentialResponse) => {
                    try {
            console.log('Google One Tap callback triggered');

            // Sign in with Google ID token
                        const { data, error } = await supabase.auth.signInWithIdToken({
                            provider: 'google',
                            token: response.credential,
                            nonce,
            });

            if (error) {
              console.error('Supabase auth error:', error);
              return;
            }

            if (data.user) {
              console.log('Successfully logged in with Google One Tap');

              // Check/create user profile
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (profileError && profileError.code === 'PGRST116') {
                // Profile doesn't exist, create it
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: data.user.id,
                    email: data.user.email!,
                    role: 'client'
                  });

                if (insertError) {
                  console.error('Error creating profile:', insertError);
                }
              }

              // Redirect based on user role
              const userRole = profile?.role || 'client';
              const redirectPath = userRole === 'admin' ? '/admin' : '/dashboard';

              router.push(redirectPath);
              router.refresh();
            }
                    } catch (error) {
            console.error('Error during Google One Tap authentication:', error);
                    }
                },
                nonce: hashedNonce,
        auto_select: false,
        cancel_on_tap_outside: true,
                use_fedcm_for_prompt: true,
      });

      // Show the One Tap prompt
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Error initializing Google One Tap:', error);
        }
  };

  useEffect(() => {
    if (scriptLoaded) {
      // Small delay to ensure the script is fully ready
      const timeoutId = setTimeout(initializeGoogleOneTap, 100);
        return () => clearTimeout(timeoutId);
    }
  }, [scriptLoaded]);

  const handleScriptLoad = () => {
    console.log('Google GSI script loaded');
    setScriptLoaded(true);
  };

  const handleScriptError = () => {
    console.error('Failed to load Google GSI script');
  };

    return (
        <>
            {/!* The `onReady` or `onLoad` prop is the most robust way to know the script is ready *!/}
            <Script
                src="https://accounts.google.com/gsi/client"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="afterInteractive"
            />
            {/!* The div below is not strictly necessary for the One Tap prompt itself, but can be used for custom positioning *!/}
            <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
        </>
  );
};

export default OneTapComponent;*/
