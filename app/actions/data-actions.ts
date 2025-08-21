// app/actions/data-actions.ts

'use server';

import {createClient} from '@/utils/supabase/server';
import {SupabaseClient} from "@supabase/supabase-js";

// Types for better type safety
export interface StoreData {
    name: string;
    brand_company: string;
    address: string;
}

export interface ContentData {
    store_id: string;
    user_id: string;
    title: string;
    type: 'image' | 'video' | 'music';
    file_url: string;
    file_size: number;
    start_date: string;
    end_date: string;
    recurrence_type: string;
    recurrence_days: string[] | null;
}

export interface ContentStats {
    total: number;
    active: number;
    scheduled: number;
    thisMonth: number;
}

// User role fetching
export async function fetchUserRole(userId: string): Promise<{ success: boolean; role?: string; error?: string }> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {data: profile, error} = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user role:', error);
            return {success: false, error: error.message};
        }

        return {success: true, role: profile?.role};
    } catch (error: any) {
        console.error('Unexpected error fetching user role:', error);
        return {success: false, error: error.message};
    }
}

// Store management
export async function addStore(storeData: StoreData, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {error} = await supabase.from('stores').insert({
            user_id: userId,
            name: storeData.name,
            brand_company: storeData.brand_company,
            address: storeData.address,
        });

        if (error) {
            console.error('Error adding store:', error);
            return {success: false, error: error.message};
        }

        return {success: true};
    } catch (error: any) {
        console.error('Unexpected error adding store:', error);
        return {success: false, error: error.message};
    }
}

export async function fetchStoresByUserId(userId: string): Promise<{
    success: boolean;
    stores?: any[];
    error?: string
}> {
    try {
        // Use service role to ensure admins can read client stores regardless of RLS
        const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

        const {data, error} = await supabase
            .from('stores')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching stores:', error);
            return {success: false, error: error.message};
        }

        return {success: true, stores: data || []};
    } catch (error: any) {
        console.error('Unexpected error fetching stores:', error);
        return {success: false, error: error.message};
    }
}

// Content management
export async function insertContent(contentData: ContentData): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {error} = await supabase.from('content').insert({
            store_id: contentData.store_id,
            user_id: contentData.user_id,
            title: contentData.title,
            type: contentData.type,
            file_url: contentData.file_url,
            file_size: contentData.file_size,
            start_date: contentData.start_date,
            end_date: contentData.end_date,
            recurrence_type: contentData.recurrence_type,
            recurrence_days: contentData.recurrence_days,
        });

        if (error) {
            console.error('Error inserting content:', error);
            return {success: false, error: error.message};
        }

        return {success: true};
    } catch (error: any) {
        console.error('Unexpected error inserting content:', error);
        return {success: false, error: error.message};
    }
}

export async function fetchContentForUser(userId: string, options?: { useServiceRole?: boolean }): Promise<{
    success: boolean;
    content?: any[];
    error?: string
}> {
    try {
        const supabase = await createClient(options?.useServiceRole ? { useServiceRole: true } : undefined) as SupabaseClient;

        const {data, error} = await supabase
            .from('content')
            .select(`
        *,
        stores (name, brand_company, address)
      `)
            .eq('user_id', userId)
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching content for user:', error);
            return {success: false, error: error.message};
        }

        return {success: true, content: data || []};
    } catch (error: any) {
        console.error('Unexpected error fetching content for user:', error);
        return {success: false, error: error.message};
    }
}

export async function fetchAllContent(): Promise<{ success: boolean; content?: any[]; error?: string }> {
    try {
        const supabase = await createClient({useServiceRole: true}) as SupabaseClient;

        const {data, error} = await supabase
            .from('content')
            .select(`
        *,
        stores (
          name,
          brand_company,
          address
        ),
        profiles (email)
      `)
            .order('created_at', {ascending: false});

        if (error) {
            console.error('Error fetching all content:', error);
            return {success: false, error: error.message};
        }

        return {success: true, content: data || []};
    } catch (error: any) {
        console.error('Unexpected error fetching all content:', error);
        return {success: false, error: error.message};
    }
}

export async function fetchContentStatsByUserId(userId: string): Promise<{
    success: boolean;
    stats?: ContentStats;
    error?: string
}> {
    try {
        // Use service role to ensure admins can read client content regardless of RLS
        const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

        const {data, error} = await supabase
            .from('content')
            .select('type, created_at, start_date, end_date')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching content stats:', error);
            return {success: false, error: error.message};
        }

        const now = new Date();
        const stats: ContentStats = {
            total: data?.length || 0,
            active: data?.filter(item =>
                new Date(item.start_date) <= now && new Date(item.end_date) >= now
            ).length || 0,
            scheduled: data?.filter(item =>
                new Date(item.start_date) > now
            ).length || 0,
            thisMonth: data?.filter(item =>
                new Date(item.created_at).getMonth() === now.getMonth() &&
                new Date(item.created_at).getFullYear() === now.getFullYear()
            ).length || 0,
        };

        return {success: true, stats};
    } catch (error: any) {
        console.error('Unexpected error fetching content stats:', error);
        return {success: false, error: error.message};
    }
}

export async function fetchClientProfileById(clientId: string): Promise<{
    success: boolean;
    profile?: any;
    error?: string
}> {
    try {
        const supabase = await createClient({useServiceRole: true}) as SupabaseClient;

        const {data, error} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', clientId)
            .eq('role', 'client')
            .single();

        if (error) {
            console.error('Error fetching client profile:', error);
            return {success: false, error: error.message};
        }

        return {success: true, profile: data};
    } catch (error: any) {
        console.error('Unexpected error fetching client profile:', error);
        return {success: false, error: error.message};
    }
}

// Get comprehensive admin dashboard data
export async function fetchAdminDashboardData(): Promise<{
    success: boolean;
    data?: {
        totalClients: number;
        totalStores: number;
        totalContent: number;
        recentClients: any[];
        recentContent: any[];
    };
    error?: string
}> {
    try {
        const supabase = await createClient({useServiceRole: true}) as SupabaseClient;

        // Fetch all data in parallel for better performance
        const [clientsResult, storesResult, contentResult] = await Promise.all([
            supabase
                .from('profiles')
                .select('*')
                .eq('role', 'client')
                .order('created_at', {ascending: false}),
            supabase
                .from('stores')
                .select(`
          *,
          profiles (email, role)
        `)
                .order('created_at', {ascending: false}),
            supabase
                .from('content')
                .select(`
          *,
          stores (name, brand_company),
          profiles (email)
        `)
                .order('created_at', {ascending: false})
                .limit(10)
        ]);

        if (clientsResult.error) throw clientsResult.error;
        if (storesResult.error) throw storesResult.error;
        if (contentResult.error) throw contentResult.error;

        const clients = clientsResult.data || [];
        const stores = storesResult.data || [];
        const content = contentResult.data || [];

        return {
            success: true,
            data: {
                totalClients: clients.length,
                totalStores: stores.length,
                totalContent: content.length,
                recentClients: clients.slice(0, 5),
                recentContent: content
            }
        };
    } catch (error: any) {
        console.error('Unexpected error fetching admin dashboard data:', error);
        return {success: false, error: error.message};
    }
}

// Fetch content statistics for admin overview
export async function fetchAdminContentStats(): Promise<{
    success: boolean;
    stats?: {
        totalContent: number;
        activeContent: number;
        scheduledContent: number;
        archivedContent: number;
        contentByType: { [key: string]: number };
    };
    error?: string
}> {
    try {
        const supabase = await createClient({useServiceRole: true}) as SupabaseClient;

        const {data: content, error} = await supabase
            .from('content')
            .select('type, start_date, end_date, created_at');

        if (error) {
            console.error('Error fetching admin content stats:', error);
            return {success: false, error: error.message};
        }

        const now = new Date();
        const stats = {
            totalContent: content?.length || 0,
            activeContent: content?.filter(item =>
                new Date(item.start_date) <= now && new Date(item.end_date) >= now
            ).length || 0,
            scheduledContent: content?.filter(item =>
                new Date(item.start_date) > now
            ).length || 0,
            archivedContent: content?.filter(item =>
                new Date(item.end_date) < now
            ).length || 0,
            contentByType: content?.reduce((acc, item) => {
                acc[item.type] = (acc[item.type] || 0) + 1;
                return acc;
            }, {} as { [key: string]: number }) || {}
        };

        return {success: true, stats};
    } catch (error: any) {
        console.error('Unexpected error fetching admin content stats:', error);
        return {success: false, error: error.message};
    }
}


export async function deleteContent(contentId: string, fileUrl: string): Promise<{ success: boolean; error?: string }> {
    console.log(`[Action] Deleting content ID: ${contentId}`);
    try {
        const supabase = await createClient({ useServiceRole: true }) as SupabaseClient;

        const filePath = `content/${fileUrl.split('/content/')[1]}`;
        console.log(`[Action] Attempting to delete file from storage at path: ${filePath}`);

        const { error: storageError } = await supabase.storage.from('content').remove([filePath]);

        if (storageError) {
            // Log the error but don't stop; the database record might still be deletable.
            console.error(`Storage deletion failed for ${filePath}, but proceeding with DB deletion. Error:`, storageError.message);
        } else {
            console.log(`[Action] Successfully deleted file from storage.`);
        }

        // 2. Delete the record from the 'content' table in the database
        console.log(`[Action] Deleting record from 'content' table where id = ${contentId}`);
        const { error: dbError } = await supabase
            .from('content')
            .delete()
            .eq('id', contentId);

        if (dbError) {
            console.error(`[Action] Database deletion failed for content ID ${contentId}:`, dbError.message);
            throw dbError;
        }

        console.log(`[Action] Successfully deleted record from database.`);
        return { success: true };

    } catch (error: any) {
        console.error(`[Action] An unexpected error occurred in deleteContent:`, error.message);
        return { success: false, error: error.message };
    }
}