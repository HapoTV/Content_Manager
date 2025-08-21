import { BackButton } from '@/components/ui/BackButton';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';

export default function ClientMagicLinkSignIn() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <BackButton href="/" label="Back to home" />
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Client Magic Link', current: true },
            ]}
            className="mt-2"
          />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Client Magic Link</h1>
          <p className="text-muted-foreground mt-2">Sign in securely without a password</p>
        </div>
        <MagicLinkForm userType="client" />
      </div>
    </div>
  );
}
