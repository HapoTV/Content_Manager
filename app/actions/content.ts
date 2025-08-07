'use server';

import { createClient } from '@/utils/supabase/server';

export interface ContentItem {
    id: string;
    store_id: string;
    user_id: string;
    title: string;
    type: 'image' | 'video' | 'music';
    file_url: string;
    file_size: number;
    start_date: string;
    end_date: string;
    recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    recurrence_days: string[] | null;
    created_at: string;
    stores?: {
        id: string;
        name: string;
        brand_company: string;
        address: string;
        latitude: number | null;
        longitude: number | null;
    };
    profiles?: {
        email: string;
    };
}

export interface CreateContentData {
    store_id: string;
    title: string;
    type: 'image' | 'video' | 'music';
    file_url: string;
    file_size: number;
    start_date: string;
    end_date: string;
    recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    recurrence_days?: string[] | null;
}

export interface ContentStats {
    total: number;
    active: number;
    scheduled: number;
    thisMonth: number;
}

export async function  getContent(userId: string): Promise<ContentItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('content')
        .select(`
      *,
      stores ( name, brand_company, address, latitude, longitude)
    `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function getAllContent(): Promise<ContentItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('content')
        .select(`
      *,
      stores (id, name, brand_company, address, latitude, longitude),
      profiles (email)
    `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createContent(userId: string, contentData: CreateContentData): Promise<ContentItem> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('content')
        .insert({
            user_id: userId,
            ...contentData,
        })
        .select(`
      *,
      stores (id, name, brand_company, address, latitude, longitude)
    `)
        .single();

    if (error) throw error;
    return data;
}

export async function updateContent(contentId: string, contentData: Partial<CreateContentData>): Promise<ContentItem> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('content')
        .update(contentData)
        .eq('id', contentId)
        .select(`
      *,
      stores (id, name, brand_company, address, latitude, longitude)
    `)
        .single();

    if (error) throw error;
    return data;
}

export async function deleteContent(contentId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

    if (error) throw error;
}

export async function getContentStats(userId: string): Promise<ContentStats> {
    const supabase = await createClient();
    console.log('getContentStats');
    const { data, error } = await supabase
        .from('content')
        .select('type, created_at, start_date, end_date')
        .eq('user_id', userId);

    if (error) throw error;
    console.log("fetched ContentStats",data);
    const now = new Date();
    return {
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
}

export async function getContentById(contentId: string): Promise<ContentItem | null> {
    const supabase = await createClient();
    console.log('getContentById', contentId);
    const { data, error } = await supabase
        .from('content')
        .select(`
      *,
      stores (id, name, brand_company, address, latitude, longitude)
    `)
        .eq('id', contentId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data;
}

export async function getContentByStore(storeId: string): Promise<ContentItem[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('content')
        .select(`
      *,
      stores (id, name, brand_company, address, latitude, longitude)
    `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}