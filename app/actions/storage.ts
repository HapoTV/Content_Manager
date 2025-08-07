'use server';

import { createClient } from '@/utils/supabase/server';

export async function uploadFile(file: File, userId: string): Promise<string> {
    const supabase = await createClient();

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('content')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function deleteFile(filePath: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase.storage
        .from('content')
        .remove([filePath]);

    if (error) throw error;
}

export async function getFileUrl(filePath: string): Promise<string> {
    const supabase = await createClient();

    const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function listFiles(userId: string): Promise<any[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
        .from('content')
        .list(userId);

    if (error) throw error;
    return data || [];
}