// app/actions/user-management-actions.ts

'use server';

import { createClient } from '@/utils/supabase/server';

interface ActionResult {
    success: boolean;
    message: string;
    error?: string;
}

/**
 * Change a user's email address
 * Uses admin privileges to update user email in Supabase Auth
 */
export async function changeUserEmail(userId: string, newEmail: string): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        // Use admin API to update user email
        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
            email: newEmail
        });

        if (error) {
            console.error('Error changing user email:', error);
            return {
                success: false,
                message: 'Failed to change user email',
                error: error.message
            };
        }

        // Also update the profile table to keep it in sync
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ email: newEmail })
            .eq('id', userId);

        if (profileError) {
            console.error('Error updating profile email:', profileError);
            // Don't fail the entire operation, just log the warning
            console.warn('Profile email update failed, but auth email was updated successfully');
        }

        return {
            success: true,
            message: `Email successfully changed to ${newEmail}. User will receive a confirmation email.`
        };
    } catch (error: any) {
        console.error('Unexpected error in changeUserEmail:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while changing the email',
            error: error.message
        };
    }
}

/**
 * Send a password reset link to user's email
 */
export async function sendPasswordReset(email: string): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/reset-password`
        });

        if (error) {
            console.error('Error sending password reset:', error);
            return {
                success: false,
                message: 'Failed to send password reset email',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Password reset link has been sent to ${email}`
        };
    } catch (error: any) {
        console.error('Unexpected error in sendPasswordReset:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while sending password reset',
            error: error.message
        };
    }
}

/**
 * Send a reauthentication request (magic link)
 */
export async function requestReauthentication(email: string): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations
        {/*TODO: Update this URL to your actual reset password page*/}

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false, // Don't create new user, only send to existing users
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
            }
        });

        if (error) {
            console.error('Error sending reauthentication request:', error);
            return {
                success: false,
                message: 'Failed to send reauthentication link',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Reauthentication link has been sent to ${email}`
        };
    } catch (error: any) {
        console.error('Unexpected error in requestReauthentication:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while sending reauthentication request',
            error: error.message
        };
    }
}

/**
 * Invite a new user by email
 */
export async function inviteUser(email: string, role: 'client' | 'admin' = 'client'): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        // Use admin API to invite user
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                role: role // Keep user_metadata for backward compatibility
            },
            app_metadata: {
                role: role // Set app_metadata for RLS policies
            },
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        });

        if (error) {
            console.error('Error inviting user:', error);
            return {
                success: false,
                message: 'Failed to send invitation',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Invitation sent successfully to ${email}`
        };
    } catch (error: any) {
        console.error('Unexpected error in inviteUser:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while sending invitation',
            error: error.message
        };
    }
}

/**
 * Generate and send a magic link for login
 */
export async function sendMagicLink(email: string): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        {/*TODO: Implement this to also create new users */}
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`
            }
        });

        if (error) {
            console.error('Error sending magic link:', error);
            return {
                success: false,
                message: 'Failed to send magic link',
                error: error.message
            };
        }

        return {
            success: true,
            message: `Magic link has been sent to ${email}`
        };
    } catch (error: any) {
        console.error('Unexpected error in sendMagicLink:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while sending magic link',
            error: error.message
        };
    }
}

/**
 * Delete a user account (admin only)
 */
export async function deleteUser(userId: string): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        // Use admin API to delete user
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                message: 'Failed to delete user account',
                error: error.message
            };
        }

        return {
            success: true,
            message: 'User account has been successfully deleted'
        };
    } catch (error: any) {
        console.error('Unexpected error in deleteUser:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while deleting user',
            error: error.message
        };
    }
}

/**
 * Update a user's app_metadata to match their role in the profiles table
 * This is used to fix metadata for users created before app_metadata was properly set
 */
export async function updateUserAppMetadata(userId: string, role: 'client' | 'admin'): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        // Use admin API to update user app_metadata
        const { data, error } = await supabase.auth.admin.updateUserById(userId, {
            app_metadata: {
                role: role
            }
        });

        if (error) {
            console.error('Error updating user app_metadata:', error);
            return {
                success: false,
                message: 'Failed to update user app_metadata',
                error: error.message
            };
        }

        return {
            success: true,
            message: `User app_metadata successfully updated with role: ${role}`
        };
    } catch (error: any) {
        console.error('Unexpected error in updateUserAppMetadata:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while updating user app_metadata',
            error: error.message
        };
    }
}

/**
 * Sync all users' app_metadata with their roles from the profiles table
 * This is used to fix metadata for all users created before app_metadata was properly set
 */
export async function syncAllUsersAppMetadata(): Promise<ActionResult> {
    try {
        const supabase = await createClient(true); // Request service role key for admin operations

        // Get all profiles with their roles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, role');

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return {
                success: false,
                message: 'Failed to fetch profiles',
                error: profilesError.message
            };
        }

        if (!profiles || profiles.length === 0) {
            return {
                success: true,
                message: 'No profiles found to sync'
            };
        }

        // Update app_metadata for each user
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (const profile of profiles) {
            try {
                const { error } = await supabase.auth.admin.updateUserById(profile.id, {
                    app_metadata: {
                        role: profile.role
                    }
                });

                if (error) {
                    errorCount++;
                    errors.push(`Error updating user ${profile.id}: ${error.message}`);
                } else {
                    successCount++;
                }
            } catch (err: any) {
                errorCount++;
                errors.push(`Exception updating user ${profile.id}: ${err.message}`);
            }
        }

        return {
            success: true,
            message: `Synced app_metadata for ${successCount} users. ${errorCount} errors.`
        };
    } catch (error: any) {
        console.error('Unexpected error in syncAllUsersAppMetadata:', error);
        return {
            success: false,
            message: 'An unexpected error occurred while syncing user app_metadata',
            error: error.message
        };
    }
}