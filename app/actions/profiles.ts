'use server';

import { createClient } from '@/utils/supabase/server';

export interface Profile {
    id: string;
    email: string;
    role: 'client' | 'admin';
    created_at: string;
}

export interface ClientWithStats extends Profile {
    stores?: {
        id: string;
        name: string;
        brand_company: string;
        address: string;
    }[];
    content_count?: number;
    latest_upload?: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    console.log("fetched Profile",data);
    return data;
}

export async function updateProfile(userId: string, profileData: Partial<Omit<Profile, 'id' | 'created_at'>>): Promise<Profile> {
    const supabase = await createClient();
    console.log(profileData);
    const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;

    console.log(data);
    return data;
}

export async function getAllProfiles(): Promise<Profile[]> {
    const supabase = await createClient();
    console.log('getAllProfiles');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(data);
    return data || [];
}

export async function getClientProfile(clientId: string): Promise<Profile | null> {
    const supabase = await createClient();
    console.log('getClientProfile', clientId);
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clientId)
        .eq('role', 'client')
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }
    console.log(data);
    return data;
}

export async function getAllClients(): Promise<Profile[]> {
    const supabase = await createClient();
    console.log('getAllClients');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

    if (error) throw error;
    console.log(data);
    return data || [];
}

export async function getClientsWithStats(): Promise<ClientWithStats[]> {
    const supabase = await createClient();
    console.log('getClientsWithStats');
    // Fetch all client profiles
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

    if (profilesError) throw profilesError;
    console.log("Getting Profiles with Stats",profiles);
    // Fetch stores and content counts for each client
    const clientsWithData = await Promise.all(
        (profiles || []).map(async (profile) => {
            // Get stores
            const { data: stores } = await supabase
                .from('stores')
                .select('id, name, brand_company, address')
                .eq('user_id', profile.id);
            console.log("Getting Stores",stores);
            // Get content count and latest upload
            const { data: content } = await supabase
                .from('content')
                .select('created_at')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false });
                console.log("Getting Content Counts",content);
            return {
                ...profile,
                stores: stores || [],
                content_count: content?.length || 0,
                latest_upload: content?.[0]?.created_at || null,
            };
        })
    );

    return clientsWithData;
}

export async function deleteProfile(userId: string): Promise<void> {
    const supabase = await createClient();
    console.log('deleteProfile', userId);
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

    if (error) throw error;
}