import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getStores, getContentStats, getClientProfile } from '@/app/actions/index';
import { notFound } from 'next/navigation';
import { StoreForm } from '@/components/client/StoreForm';
import { ContentUpload } from '@/components/client/ContentUpload';
import { ContentDashboard } from '@/components/client/ContentDashboard';
import { ClientHeader } from '@/components/client/ClientHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Store, Upload, TrendingUp, Calendar } from 'lucide-react';

// --- Page Component ---

export default async function Dashboard(
  props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();

  if (!user || (user.profile?.role !== 'client' && user.profile?.role !== 'admin')) {
    redirect('/auth/client/signin');
  }

  const adminViewParam = searchParams.admin_view;
  const adminViewClientId = typeof adminViewParam === 'string' ? adminViewParam : undefined;
  const isAdminView = !!(user.profile?.role === 'admin' && adminViewClientId);

  try {
    // These variables are now scoped within the try block, which is safer.
  let viewingClient = user;
    let stores, contentStats;

  // **SUGGESTION 1: CENTRALIZED ERROR HANDLING**
  // Wrap all data fetching in a single try...catch block for robust error handling.
  try {
  if (isAdminView) {
      // First, get the client profile, as it's a prerequisite for the other fetches.
      const clientProfile = await getClientProfile(adminViewClientId);
      if (!clientProfile) notFound();

      viewingClient = { ...user, profile: clientProfile };
      [stores, contentStats] = await Promise.all([
        getStores(adminViewClientId),
        getContentStats(adminViewClientId),
      ]);

    } else {
      // Also apply parallel fetching for the normal user view.
      [stores, contentStats] = await Promise.all([
        getStores(user.id),
        getContentStats(user.id),
      ]);
    }
    } catch (error) {
    // Log the error to the server console for debugging.
    console.error("Dashboard data fetching failed:", error);
    // Show a user-friendly "Not Found" page if any database query fails.
      notFound();
    }

  const targetUserId = isAdminView ? adminViewClientId : user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader
        user={user}
        isAdminView={isAdminView}
        viewingClient={viewingClient}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Upload className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{contentStats.total}</p>
                  <p className="text-sm text-gray-600">Total Content</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{contentStats.active}</p>
                  <p className="text-sm text-gray-600">Active Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{contentStats.scheduled}</p>
                  <p className="text-sm text-gray-600">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stores.length}</p>
                  <p className="text-sm text-gray-600">Store Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conditional UI based on fetched data */}
        {stores.length === 0 ? (
          <div className="text-center">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isAdminView ? 'Client Needs to Set Up Store' : 'Set Up Your Store'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isAdminView
                ? 'This client has not set up their store details yet.'
                : "First, let's add your store details to get started with content uploads."
              }
            </p>
            {!isAdminView && <StoreForm userId={user.id} />}
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Section - Only show for non-admin view */}
            {!isAdminView && (
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5" />Upload New Content</CardTitle></CardHeader>
                  <CardContent><ContentUpload userId={user.id} storeId={stores[0].id} /></CardContent>
                </Card>
              </div>
            )}

            {/* Store Information */}
            <div className={!isAdminView ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" />{isAdminView ? 'Client Stores' : 'Your Stores'}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {stores.map(store => (
                      <div key={store.id} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                        <p className="text-gray-600">{store.brand_company}</p>
                        <p className="text-sm text-gray-500">{store.address}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Content Dashboard */}
        {stores.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{isAdminView ? 'Client Content Library' : 'Your Content Library'}</h2>
            <ContentDashboard userId={targetUserId} isAdminView={isAdminView} />
          </div>
        )}

        {isAdminView && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-800">Admin View Notice</h3>
            </div>
            <p className="text-orange-700 text-sm">
              You are viewing this client&apos;s dashboard with full admin privileges. You can see all their content,
              stores, and download any files. Upload functionality is disabled in admin view mode.
            </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );

  } catch (error) {
    console.error("Dashboard data fetching failed:", error);
    notFound();
  }
}