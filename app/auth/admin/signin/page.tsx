import { AuthForm } from '@/components/auth/AuthForm';
import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ToastProvider } from '@/components/ui/Toast';

export default function AdminSignIn() {
  return (
    <ToastProvider>
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/" label="Back to home" />
          <Breadcrumb 
            items={[
              { label: 'Authentication', href: '/auth' },
              { label: 'Admin', href: '/auth/admin' },
              { label: 'Sign In', current: true }
            ]} 
            className="mt-2"
          />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Sign In</h1>
          <p className="text-gray-600 mt-2">Access the marketing dashboard</p>
        </div>
        <AuthForm mode="signin" userType="admin" />
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Prefer passwordless?{' '}
            <a
              href="/auth/admin/magic-link"
              className="font-medium text-blue-600 hover:underline"
            >
              Use a magic link
            </a>
          </p>
        </div>
      </div>
    </div>
    </ToastProvider>
  );
}