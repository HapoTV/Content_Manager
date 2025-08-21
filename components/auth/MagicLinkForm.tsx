'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { Mail } from 'lucide-react';
import { useMagicLinkAuth, UserType } from '@/hooks/useMagicLinkAuth';
import Link from 'next/link';

interface MagicLinkFormProps {
  userType?: UserType;
}

export function MagicLinkForm({ userType = 'client' }: MagicLinkFormProps) {
  const { email, setEmail, loading, sent, sendMagicLink } = useMagicLinkAuth(userType);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Sign in with Magic Link</CardTitle>
      </CardHeader>
      <CardContent>
        {!sent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMagicLink(userType);
            }}
            className="space-y-4"
          >
            <FormField label="Email" icon={Mail}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send Magic Link'}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Prefer password sign in?{' '}
              <Link
                href={userType === 'admin' ? '/auth/admin/signin' : '/auth/client/signin'}
                className="text-primary hover:underline"
              >
                Go back
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-foreground">We&#39;ve sent a magic sign-in link to:</p>
            <p className="font-medium break-all">{email}</p>
            <p className="text-muted-foreground text-sm">
              Open your email on this device and click the link to complete sign-in.
            </p>
            <Button type="button" variant="outline" className="w-full" disabled>
              Waiting for confirmation…
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
