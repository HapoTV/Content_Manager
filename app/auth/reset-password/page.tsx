// app/auth/reset-password/page.tsx

'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BackButton } from '@/components/ui/BackButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ToastProvider } from '@/components/ui/Toast';
import { Key } from 'lucide-react';
import { usePasswordResetFlow } from '@/hooks/usePasswordResetFlow';
import { PasswordForm } from '@/components/auth/PasswordForm';
import { Input } from '@/components/ui/Input';

function ResetPasswordContent() {
    const {
        status,
        isNewUser,
        userEmail,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        handleSubmit,
    } = usePasswordResetFlow();

    // Render UI based on the current status from the hook
    const renderContent = () => {
        switch (status) {
            case 'validating':
                return <LoadingSpinner size="lg" text="Validating link..." />;
            case 'error':
                return <p className="text-destructive">This link is invalid or has expired. Please request a new one.</p>;
            case 'ready':
            case 'submitting':
        return (
                    <>
                        <CardHeader>
                            <CardTitle className="text-center flex items-center justify-center gap-2"><Key className="w-6 h-6" />{isNewUser ? 'Set Your Password' : 'Reset Your Password'}</CardTitle>
                            {isNewUser && (
                                <p className="text-center text-sm text-muted-foreground mt-2">
                                    Welcome! Set a password for: <strong className="text-foreground">{userEmail}</strong>
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isNewUser && (
                                <div className="space-y-2 mb-4">
                                    <label className="block text-sm font-medium text-muted-foreground">Email</label>
                                    <Input type="email" value={userEmail || ''} readOnly className="bg-muted cursor-not-allowed" />
                                </div>
                            )}
                            <PasswordForm
                                isNewUser={isNewUser}
                                onSubmit={handleSubmit}
                                password={{ value: password, set: setPassword }}
                                confirmPassword={{ value: confirmPassword, set: setConfirmPassword }}
                                isLoading={status === 'submitting'}
                            />
                    </CardContent>
                    </>
        );
            case 'success':
                 return <p className="text-primary">Success! Redirecting you now...</p>;
    }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-4">
                    <BackButton href="/auth/client/signin" label="Back to sign in" />
                </div>

                <Card>
                    <div className="p-8">{renderContent()}</div>
                </Card>
            </div>
        </div>
    );
}

// The outer page component remains the same
export default function ResetPasswordPage() {
    return (
        <ToastProvider>
            <Suspense fallback={<LoadingSpinner />}>
            <ResetPasswordContent />
      </Suspense>
        </ToastProvider>
    );
}
