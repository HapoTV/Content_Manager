//  app/actions/auth-actions.ts

'use server';

import {createClient} from '@/utils/supabase/server';
import {SupabaseClient} from '@supabase/supabase-js'; // <-- 1. IMPORT THE BASE CLIENT TYPE

// Additional auth-related functions
export async function signInUser(email: string, password: string): Promise<{
    success: boolean;
    user?: any;
    error?: string
}> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('Error signing in user:', error);
            return {success: false, error: error.message};
        }

        return {success: true, user: data.user};
    } catch (error: any) {
        console.error('Unexpected error signing in user:', error);
        return {success: false, error: error.message};
    }
}

export async function getUserSession(): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {data: {session}, error} = await supabase.auth.getSession();

        if (error) {
            console.error('Error getting user session:', error);
            return {success: false, error: error.message};
        }

        return {success: true, session};
    } catch (error: any) {
        console.error('Unexpected error getting user session:', error);
        return {success: false, error: error.message};
    }
}

export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {error} = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            console.error('Error updating user password:', error);
            return {success: false, error: error.message};
        }

        return {success: true};
    } catch (error: any) {
        console.error('Unexpected error updating user password:', error);
        return {success: false, error: error.message};
    }
}

export async function getUserAndProfile(userId: string, userType: 'client' | 'admin' = 'client'): Promise<{
    success: boolean;
    user?: any;
    error?: string
}> {
    try {
        const supabase = await createClient() as SupabaseClient;

        const {data: {user}} = await supabase.auth.getUser();

        if (!user) {
            return {success: false, error: 'No user found'};
        }

        const {data: profile, error} = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Profile fetch error:', error);

            // Create profile if it doesn't exist
            const {data: newProfile, error: insertError} = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email!,
                    role: userType
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating profile:', insertError);
                // Return user with default profile structure
                return {
                    success: true,
                    user: {
                        ...user,
                        profile: {
                            id: user.id,
                            email: user.email!,
                            role: userType,
                            created_at: new Date().toISOString()
                        }
                    }
                };
            }

            return {success: true, user: {...user, profile: newProfile}};
        }

        return {success: true, user: {...user, profile}};
    } catch (error: any) {
        console.error('Unexpected error getting user and profile:', error);
        return {success: false, error: error.message};
    }
}

interface AuthResult {
    success: boolean;
    message: string;
    error?: string;
    userId?: string;
}

/**
 * Register a new user with email and password
 * Sets both user_metadata and app_metadata with the role
 */
export async function registerUser(
    email: string,
    password: string,
    role: 'client' | 'admin' = 'client'
): Promise<AuthResult> {
    try {
        const supabase = await createClient({useServiceRole: true}) as SupabaseClient;  // Request service role key for admin operations

        // First, create the user with user_metadata
        const {data, error} = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm the email
            user_metadata: {
                role: role // Keep user_metadata for backward compatibility
            },
            app_metadata: {
                role: role // Set app_metadata for RLS policies
            }
        });

        if (error) {
            console.error('Error registering user:', error);
            return {
                success: false,
                message: 'Failed to register user',
                error: error.message
            };
        }

        if (!data.user) {
            return {
                success: false,
                message: 'User creation failed with no error',
                error: 'No user returned from createUser'
            };
        }

        // Create profile record
        const {error: profileError} = await supabase
            .from('profiles')
            .upsert({
                id: data.user.id,
                email: data.user.email!,
                role: role
            });

        if (profileError) {
            console.error('Error creating profile:', profileError);
            // Don't fail the entire operation, just log the warning
            console.warn('Profile creation failed, but user was created successfully');
        }

        return {
            success: true,
            message: 'User registered successfully',
            userId: data.user.id
        };
    } catch (error: any) {
        console.error('Unexpected error in registerUser:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during registration',
            error: error.message
        };
    }
}

/**
 * Update a user's app_metadata after OAuth sign-in
 * This is called from the auth callback handler
 */
export async function updateUserAfterOAuth(
    userId: string,
    email: string,
    role: 'client' | 'admin' = 'client'
): Promise<AuthResult> {
    try {
        const supabase = await createClient({useServiceRole: true}) as SupabaseClient;  // Request service role key for admin operations

        // Update user's app_metadata
        const {error} = await supabase.auth.admin.updateUserById(userId, {
            app_metadata: {
                role: role
            }
        });

        if (error) {
            console.error('Error updating user app_metadata after OAuth:', error);
            return {
                success: false,
                message: 'Failed to update user metadata',
                error: error.message
            };
        }

        // Ensure profile exists
        const {error: profileError} = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                email: email,
                role: role
            });

        if (profileError) {
            console.error('Error creating/updating profile after OAuth:', profileError);
            // Don't fail the entire operation, just log the warning
            console.warn('Profile update failed, but user metadata was updated successfully');
        }

        return {
            success: true,
            message: 'User metadata updated successfully after OAuth',
            userId: userId
        };
    } catch (error: any) {
        console.error('Unexpected error in updateUserAfterOAuth:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while updating user after OAuth',
            error: error.message
        };
    }
}

/**
 * Switch a user's role between 'client' and 'admin'. Only admins may perform this action.
 * Updates both auth app_metadata and the profiles table to keep data consistent.
 */
export async function switchUserRole(
    targetUserId: string,
    newRole: 'client' | 'admin'
): Promise<{ success: boolean; message?: string; error?: string }>
{
    try {
        // 1) Validate input
        if (!targetUserId) {
            return { success: false, error: 'Target user id is required' };
        }
        if (newRole !== 'client' && newRole !== 'admin') {
            return { success: false, error: 'Invalid role. Must be "client" or "admin"' };
        }

        // 2) Create a standard client to identify and authorize the requester
        const requesterClient = await createClient() as SupabaseClient;
        const { data: { user: requester }, error: getUserError } = await requesterClient.auth.getUser();
        if (getUserError) {
            console.error('switchUserRole: Failed to get current user:', getUserError);
            return { success: false, error: getUserError.message };
        }
        if (!requester) {
            return { success: false, error: 'Not authenticated' };
        }

        // 3) Ensure requester is an admin (check profiles)
        const { data: requesterProfile, error: profileError } = await requesterClient
            .from('profiles')
            .select('role')
            .eq('id', requester.id)
            .single();

        if (profileError) {
            console.error('switchUserRole: Failed to fetch requester profile:', profileError);
            return { success: false, error: profileError.message };
        }
        if (requesterProfile?.role !== 'admin') {
            return { success: false, error: 'Permission denied. Admin role required.' };
        }

        // Optional safety: prevent an admin from demoting themselves to avoid lockout
        if (requester.id === targetUserId && newRole === 'client') {
            return { success: false, error: 'Admins cannot demote themselves.' };
        }

        // 4) Use service role for privileged updates
        const adminClient = await createClient({ useServiceRole: true }) as SupabaseClient;

        // 4a) Update auth app_metadata.role
        const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(targetUserId, {
            app_metadata: { role: newRole },
            user_metadata: { role: newRole }
        });
        if (authUpdateError) {
            console.error('switchUserRole: Failed to update auth app_metadata:', authUpdateError);
            return { success: false, error: authUpdateError.message };
        }

        // 4b) Update profiles.role to keep in sync
        const { error: profileUpdateError } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', targetUserId);
        if (profileUpdateError) {
            console.error('switchUserRole: Failed to update profile role:', profileUpdateError);
            return { success: false, error: profileUpdateError.message };
        }

        return { success: true, message: `Role updated to '${newRole}' for user ${targetUserId}` };
    } catch (error: any) {
        console.error('switchUserRole: Unexpected error:', error);
        return { success: false, error: error.message };
    }
}
