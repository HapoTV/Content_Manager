'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField'; // Use the new component
import { Mail, Lock, Chrome, Eye, EyeOff } from 'lucide-react';
import { useAuthForm } from '@/hooks/useAuthForm'; // Use the new hook
import Link from 'next/link';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  userType?: 'client' | 'admin';
}

export function AuthForm({ mode, userType = 'client' }: AuthFormProps) {
  // All complex logic is now handled by the hook
  const {
    formData,
    loading,
    googleLoading,
    handleInputChange,
    handleSubmit,
    signInWithGoogle,
  } = useAuthForm(mode, userType);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'} 
          {userType === 'admin' && ' - Admin'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={signInWithGoogle}
            disabled={googleLoading || loading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            {googleLoading ? 'Connecting...' : `${mode === 'signin' ? 'Sign in' : 'Sign up'} with Google`}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                    Or continue with email
                </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email" icon={Mail}>
          <Input
            type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="pl-10"
          />
          </FormField>
          <FormField label="Password" icon={Lock}>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
              className="pl-10 pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </FormField>
          {mode === 'signin' && (
            <div className="text-right">
              <Link href="/auth/reset-password" className="text-sm text-muted-foreground hover:underline">
                Forgot your password?
              </Link>
            </div>
          )}
          <Button
              type="submit"
              className="w-full"
              disabled={loading || googleLoading}
          >
              {loading ? 'Loading...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
