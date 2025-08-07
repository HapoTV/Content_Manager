'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(email: string, password: string, role: 'client' | 'admin' = 'client') {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: role
            }
        }
    });

    if (error) throw error;
    console.error("error at auth.ts line 20:", error);

    // If user is created, ensure profile exists with correct role
    if (data.user) {
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: data.user.email!,
                role: role
            });

        if (profileError) {
            console.error('Profile creation error at auth.ts line 33:', profileError);
            // Don't throw here as the user is already created
        }
    }

    return data;
}

export async function signIn(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    console.error("error at auth.ts line 49:", error);
    return data;
}

export async function signOut() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    redirect('/');
}

export async function getCurrentUser() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        console.error('Error fetching profile at auth.ts line 75 :', error);

        // If profile doesn't exist, create it with proper error handling
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email!,
                role: 'client'
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating profile at auth.ts line 89 :', insertError);
            // Return user with a default profile if creation fails
            return {
                ...user,
                profile: {
                    id: user.id,
                    email: user.email!,
                    role: 'client' as const,
                    created_at: new Date().toISOString()
                }
            };
        }

        return { ...user, profile: newProfile };
    }

    return { ...user, profile };
}

// Superadmin bypass functions
export async function createSuperadminKey(): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const secret = process.env.SUPERADMIN_SECRET || 'default_secret_key_change_in_production';

    const hash = require('crypto')
        .createHash('md5')
        .update(`${timestamp}_${secret}`)
        .digest('hex')
        .toUpperCase();

    return `SUPER_ADMIN_${timestamp}_${hash}`;
}

export async function validateSuperadminAccess(key: string): Promise<boolean> {
    const pattern = /^SUPER_ADMIN_\d{10}_[A-F0-9]{32}$/;
    if (!pattern.test(key)) return false;

    const parts = key.split('_');
    const timestamp = parseInt(parts[2]);
    const hash = parts[3];

    // Check if timestamp is within last 24 hours
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = now - timestamp;
    if (timeDiff > 86400 || timeDiff < -300) return false;

    const secret = process.env.SUPERADMIN_SECRET || 'default_secret_key_change_in_production';
    const expectedHash = require('crypto')
        .createHash('md5')
        .update(`${timestamp}_${secret}`)
        .digest('hex')
        .toUpperCase();

    return hash === expectedHash;
}