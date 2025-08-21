'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentManager } from '@/components/content/ContentManager';
import { fetchContentForUser } from '@/app/actions/data-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Store, Upload, TrendingUp, Calendar, Trash2, Plus } from 'lucide-react';
import { StoreForm } from '@/components/client/StoreForm';
import { ContentUpload } from '@/components/client/ContentUpload';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { deleteUser } from '@/app/actions/user-management-actions';
import type { ContentStats, Store as StoreType } from '@/types/content';

interface DashboardClientProps {
    userId: string;
    isAdminView: boolean;
    initialStores: StoreType[];
    contentStats: ContentStats;
}

export function DashboardClient({
                                    userId,
                                    isAdminView,
                                    initialStores,
    contentStats,
}: DashboardClientProps) {
    // The fetch action is created here, capturing the userId
    const userFetchAction = () => fetchContentForUser(userId, { useServiceRole: isAdminView });
    const router = useRouter(); // --- NEW: Get the router ---

    // --- NEW: State for the delete confirmation modal ---
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [showAddStoreForm, setShowAddStoreForm] = useState(false);

    // --- NEW: Handler to delete the client ---
    const handleDeleteClient = async () => {
        const result = await deleteUser(userId);
        if (result.success) {
            // Use a toast notification here in a real app
            alert('Client successfully deleted.');
            router.push('/admin/clients');
            router.refresh();
        } else {
            alert(`Error: ${result.error}`);
        }
        setDeleteModalOpen(false);
    };

    return (
        <>
        <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        icon={Upload}
                        value={contentStats.total}
                        label="Total Content"
                        iconColorClass="text-primary"
                    />
                    <StatCard
                        icon={TrendingUp}
                        value={contentStats.active}
                        label="Active Campaigns"
                        iconColorClass="text-green-500"
                    />
                    <StatCard
                        icon={Calendar}
                        value={contentStats.scheduled}
                        label="Scheduled"
                        iconColorClass="text-purple-500"
                    />
                    <StatCard
                        icon={Store}
                        value={initialStores.length}
                        label="Store Locations"
                        iconColorClass="text-orange-500"
                    />
                        </div>

                {/* --- The rest of the component remains unchanged --- */}

            {initialStores.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                {isAdminView ? 'Client Needs to Set Up Store' : 'Set Up Your Store'}
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                {isAdminView
                                    ? 'This client has not set up their store details yet.'
                                    : "First, let's add your store details to get started with content uploads."
                                }
                            </p>
                            {!isAdminView && <StoreForm userId={userId} />}
                        </CardContent>
                    </Card>
                ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    {!isAdminView && (
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Upload New Content</CardTitle></CardHeader>
                                <CardContent><ContentUpload userId={userId} storeId={initialStores[0].id} /></CardContent>
                            </Card>
                        </div>
                    )}
                    <div className={!isAdminView ? 'lg:col-span-2' : 'lg:col-span-3'}>
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Store className="w-5 h-5" />{isAdminView ? 'Client Stores' : 'Your Stores'}
                                    </CardTitle>
                                    {!isAdminView && (
                                        <Button variant="outline" size="sm" onClick={() => setShowAddStoreForm(prev => !prev)}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            {showAddStoreForm ? 'Cancel' : 'Add Store'}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    {initialStores.map(store => (
                                        <div key={store.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                                            <h3 className="font-semibold text-foreground">{store.name}</h3>
                                            <p className="text-muted-foreground">{store.brand_company}</p>
                                            <p className="text-sm text-muted-foreground">{store.address}</p>
                                        </div>
                                    ))}
                                </div>
                                {showAddStoreForm && !isAdminView && (
                                    <div className="mt-6">
                                        <StoreForm
                                            userId={userId}
                                            onSuccess={() => {
                                                setShowAddStoreForm(false);
                                                router.refresh();
                                            }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
                )}

            {initialStores.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-6">{isAdminView ? 'Client Content Library' : 'Your Content Library'}</h2>
                    <ContentManager
                        fetchAction={userFetchAction}
                        showFilters={true}
                        defaultView="grid"
                            isAdminView={isAdminView} // --- PASS THIS PROP ---
                    />
                </div>
            )}

                {isAdminView && (
                    <>
                    <Card className="bg-accent/50 border-accent/60">
                            {/* ... (The Admin View Notice card remains unchanged) ... */}
                        </Card>

                        {/* --- NEW: ADMIN-ONLY DANGER ZONE --- */}
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-destructive/90 mb-4 text-sm">
                                    This action is permanent and will affect the client&#39;s entire account, including all stores and content.
                            </p>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeleteModalOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete This Client Account
                                </Button>
                        </CardContent>
                    </Card>
                    </>
                )}
        </main>

            {/* --- NEW: The confirmation modal for deleting the client --- */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDeleteClient}
                title="Delete Client Account"
                description="Are you sure you want to permanently delete this client and all of their data? This action cannot be undone."
                confirmText="Yes, Delete Client"
            />
        </>
    );
}