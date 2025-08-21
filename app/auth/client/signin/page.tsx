'use client'; // --- NEW: This page must be a client component to use the hook ---

import { AuthForm } from '@/components/auth/AuthForm';
import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useGoogleOneTap } from '@/hooks/useGoogleOneTap'; // --- NEW: Import the hook ---
import Link from 'next/link';

// Note: The ToastProvider should ideally be in your root layout (app/layout.tsx)
// to be available on all pages. If it's only needed here, this is fine.

export default function ClientSignIn() {
  // --- NEW: Call the hook to activate Google One Tap on this page ---
  useGoogleOneTap();

  return (
    // THEME: Use theme variables for the background.
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/" label="Back to home" />
          <Breadcrumb 
            items={[
              // Breadcrumb is already themed, no changes needed here
              { label: 'Home', href: '/' },
              { label: 'Client Sign In', current: true }
            ]} 
            className="mt-2"
          />
        </div>
        <div className="text-center mb-8">
          {/* THEME: Use theme text colors */}
          <h1 className="text-3xl font-bold text-foreground">Client Sign In</h1>
          <p className="text-muted-foreground mt-2">Access your content management dashboard</p>
        </div>

        <AuthForm mode="signin" userType="client" />

        {/* Sign up link */}
        <div className="text-center mt-6">
          {/* THEME: Use theme text colors */}
          <p className="text-sm text-muted-foreground">
            Don&#39;t have an account?{' '}
            <Link
              href="/auth/client/signup"
              // THEME: Use theme primary color for the link
              className="font-medium text-primary hover:underline"
            >
              Sign up here
            </Link>
          </p>
        </div>

        {/* Or use magic link */}
        <div className="text-center mt-2">
          <p className="text-sm text-muted-foreground">
            Prefer passwordless?{' '}
            <Link
              href="/auth/client/magic-link"
              className="font-medium text-primary hover:underline"
            >
              Use a magic link
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}