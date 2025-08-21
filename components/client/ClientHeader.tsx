'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/ui/Tooltip';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { LogOut, User, Settings, Shield, Eye } from 'lucide-react';
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { UserNav, UserNavHeader, UserNavItem, UserNavSeparator } from "@/components/ui/UserNav";
import {Logo} from "@/components/ui/Logo";

interface ClientHeaderProps {
    user: any;
    isAdminView?: boolean;
    viewingClient?: any;
}

export function ClientHeader({ user, isAdminView, viewingClient }: ClientHeaderProps) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/signout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Clear any local storage or session data if needed
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to home page
                router.push('/');
                router.refresh(); // Force a refresh to clear any cached data
            } else {
                console.error('Logout failed:', data.error);
                // Still redirect even if there's an error to prevent being stuck
                router.push('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Fallback: still redirect to home page
            router.push('/');
        }
    };

    // REFACTOR: This function is now simpler. It just opens the modal.
    const confirmLogout = () => {
        setShowLogoutConfirm(true);
    };

    return (
        <>
            <header className="bg-card text-card-foreground shadow-sm border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        {/* Left side (This is specific to ClientHeader, so it stays) */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Logo className="w-12 h-12" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        {/* THEME: 'text-gray-900' becomes 'text-foreground'. */}
                                        <h1 className="text-2xl font-bold text-foreground">
                                            {isAdminView ? 'Admin View: Client Dashboard' : 'Client Dashboard'}
                                        </h1>
                                        {isAdminView && (
                                            <Tooltip
                                                content="You are viewing this client's dashboard as an admin">
                                                {/* THEME: 'text-orange-600' becomes 'text-primary' for consistency. */}
                                                <Shield className="w-5 h-5 text-primary" />
                                            </Tooltip>
                                        )}
                                    </div>
                                    <Breadcrumb
                                        items={[
                                            ...(isAdminView ? [{ label: 'Admin Dashboard', href: '/admin' }] : []),
                                            {
                                                label: isAdminView ? `Client: ${viewingClient?.profile?.email}` : 'Dashboard',
                                                current: true
                                            }
                                        ]}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right side - User Menu */}
                        <div className="flex items-center gap-4">
                            {isAdminView && (
                                // THEME: Replaced orange colors with accent theme colors.
                                <div className="text-sm text-accent-foreground bg-accent px-3 py-1 rounded-full border border-border">
                                    <Eye className="w-4 h-4 inline mr-1" />
                                    Admin View
                                </div>
                            )}
                            <ThemeSwitcher />

                            {/* REFACTOR: The entire old dropdown is replaced with the UserNav component */}
                            <UserNav email={isAdminView ? viewingClient?.profile?.email : user.email}>
                                <UserNavHeader
                                    title={isAdminView ? 'Viewing as Admin' : 'Signed in as'}
                                    email={isAdminView ? viewingClient?.profile?.email : user.email}
                                    note={isAdminView ? `Admin: ${user.email}` : undefined}
                                    noteVariant="primary"
                                />
                                        <div className="py-1">
                                    <UserNavItem onClick={() => router.push('/profile')}>
                                        <User className="w-4 h-4" /> User Profile
                                    </UserNavItem>
                                    <UserNavItem onClick={() => router.push('/settings')}>
                                        <Settings className="w-4 h-4" /> Settings
                                    </UserNavItem>
                                    <UserNavSeparator />
                                    <UserNavItem onClick={confirmLogout}>
                                        <LogOut className="w-4 h-4 text-destructive" />
                                        <span className="text-destructive">Sign Out</span>
                                    </UserNavItem>
                                    </div>
                            </UserNav>
                        </div>
                    </div>
                </div>
            </header>

            {/* REFACTOR: The old modal JSX is replaced with the ConfirmModal component */}
                <ConfirmModal
                    isOpen={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    onConfirm={handleLogout}
                    title="Confirm Sign Out"
                    description="Are you sure you want to sign out? You'll need to sign in again to access your dashboard."
                    confirmText="Sign Out"
                />

            {/* REFACTOR: The old backdrop is no longer needed here. It's inside UserNav. */}
        </>
    );
}