'use server';

import { createClient } from '@/utils/supabase/server';

export interface Store {
    id: string;
    user_id: string;
    name: string;
    brand_company: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    created_at: string;
}

export interface CreateStoreData {
    name: string;
    brand_company: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
}

export async function getStores(userId: string): Promise<Store[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createStore(userId: string, storeData: CreateStoreData): Promise<Store> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('stores')
        .insert({
            user_id: userId,
            name: storeData.name,
            brand_company: storeData.brand_company,
            address: storeData.address,
            latitude: storeData.latitude,
            longitude: storeData.longitude,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateStore(storeId: string, storeData: Partial<CreateStoreData>): Promise<Store> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('stores')
        .update(storeData)
        .eq('id', storeId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteStore(storeId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

    if (error) throw error;
}

export async function getStoreById(storeId: string): Promise<Store | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data;
}