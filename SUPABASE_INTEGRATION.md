# Supabase Integration Details

This document outlines the architecture and interaction between the Hapo Media Content Hub application and its Supabase backend. It covers the database schema, Row Level Security (RLS) policies, Supabase functions/triggers, storage, and how the application's server actions interact with these components.

## 1. Database Schema and Relationships

The application utilizes several core tables in Supabase, primarily within the `public` schema, and interacts with the built-in `auth` schema.

### Core Tables:

*   **`profiles`**
    *   **Purpose**: Stores user-specific metadata, including their role (`client` or `admin`).
    *   **Columns**:
        *   `id` (UUID, Primary Key, references `auth.users.id`)
        *   `email` (TEXT, Unique, Not Null)
        *   `role` (TEXT, Not Null, Default 'client', CHECK ('client', 'admin'))
        *   `created_at` (TIMESTAMPTZ, Default `now()`)
    *   **Relationship**: One-to-one with `auth.users`.

*   **`stores`**
    *   **Purpose**: Stores information about client-specific store locations.
    *   **Columns**:
        *   `id` (UUID, Primary Key, Default `gen_random_uuid()`)
        *   `user_id` (UUID, Not Null, references `profiles.id`)
        *   `name` (TEXT, Not Null)
        *   `brand_company` (TEXT, Not Null)
        *   `address` (TEXT, Not Null)
        *   `latitude` (NUMERIC, Nullable)
        *   `longitude` (NUMERIC, Nullable)
        *   `created_at` (TIMESTAMPTZ, Default `now()`)
    *   **Relationship**: Many-to-one with `profiles` (a profile can have many stores).

*   **`content`**
    *   **Purpose**: Stores metadata about uploaded digital signage content (images, videos, audio).
    *   **Columns**:
        *   `id` (UUID, Primary Key, Default `gen_random_uuid()`)
        *   `store_id` (UUID, Not Null, references `stores.id`)
        *   `user_id` (UUID, Not Null, references `profiles.id`)
        *   `title` (TEXT, Not Null)
        *   `type` (TEXT, Not Null, CHECK ('image', 'video', 'music'))
        *   `file_url` (TEXT, Not Null)
        *   `file_size` (BIGINT, Not Null, Default 0)
        *   `start_date` (DATE, Not Null)
        *   `end_date` (DATE, Not Null)
        *   `recurrence_type` (TEXT, Not Null, Default 'none', CHECK ('none', 'daily', 'weekly', 'monthly', 'custom'))
        *   `recurrence_days` (TEXT ARRAY, Nullable)
        *   `created_at` (TIMESTAMPTZ, Default `now()`)
    *   **Relationship**: Many-to-one with `profiles` (a user can upload many content items) and many-to-one with `stores` (content is associated with a specific store).

## 2. Row Level Security (RLS) Policies

RLS is enabled on all core tables (`profiles`, `stores`, `content`) and the `storage.objects` table to ensure data security and proper access control. Policies are designed to differentiate between regular `client` users and `admin` users.

### General RLS Principles:

*   **Client Users**: Can only perform CRUD operations on data they own (identified by `auth.uid()`).
*   **Admin Users**: Have full CRUD access to all data across all tables. Admin status is determined by checking if `auth.uid()` exists in the `profiles` table with `role = 'admin'` or if their JWT `app_metadata` role is 'admin'.

### Policy Details:

#### `profiles` Table RLS:
*   **`Users can read own profile`**: Allows authenticated users to read their own profile.
*   **`Users can update own profile`**: Allows authenticated users to update their own profile.
*   **`Users can insert own profile`**: Allows authenticated users to insert their own profile.
*   **`Users can delete own profile`**: Allows authenticated users to delete their own profile.
*   **`admin_select_profiles`**: Admins can read all profiles.
*   **`admin_insert_profiles`**: Admins can insert new profiles.
*   **`admin_update_profiles`**: Admins can update any profile.
*   **`admin_delete_profiles`**: Admins can delete any profile.

#### `stores` Table RLS:
*   **`Users can read own stores`**: Allows authenticated users to read their own stores.
*   **`Users can insert own stores`**: Allows authenticated users to insert their own stores.
*   **`Users can update own stores`**: Allows authenticated users to update their own stores.
*   **`Users can delete own stores`**: Allows authenticated users to delete their own stores.
*   **`admin_select_stores`**: Admins can read all stores.
*   **`admin_insert_stores`**: Admins can create stores for any user.
*   **`admin_update_stores`**: Admins can update any store.
*   **`admin_delete_stores`**: Admins can delete any store.

#### `content` Table RLS:
*   **`Users can read own content`**: Allows authenticated users to read their own content.
*   **`Users can insert own content`**: Allows authenticated users to insert their own content.
*   **`Users can update own content`**: Allows authenticated users to update their own content.
*   **`Users can delete own content`**: Allows authenticated users to delete their own content.
*   **`Admins can read all content`**: Admins can read all content.
*   **`admin_select_content`**: Admins can read all content.
*   **`admin_insert_content`**: Admins can create content for any user/store.
*   **`admin_update_content`**: Admins can update any content.
*   **`admin_delete_content`**: Admins can delete any content.

#### `storage.objects` RLS (for `content` bucket):
*   **`Users can upload content files`**: Allows authenticated users to upload files to their own folders (`auth.uid()::text`).
*   **`Users can read content files`**: Allows users to read their own files and admins to read all files.
*   **`Users can update own content files`**: Allows users to update their own files.
*   **`Users can delete own content files`**: Allows users to delete their own files.
*   **`admin_select_storage_objects`**: Admins can read all files in storage.
*   **`admin_insert_storage_objects`**: Admins can upload files to any location.
*   **`admin_update_storage_objects`**: Admins can update any file metadata.
*   **`admin_delete_storage_objects`**: Admins can delete any file.

## 3. Supabase Functions and Triggers

*   **`handle_new_user()` Function**:
    *   **Purpose**: An internal PostgreSQL function that automatically creates a corresponding entry in the `public.profiles` table whenever a new user signs up via `auth.users`. It also sets the default `role` to 'client' and synchronizes this role into the `auth.users` `raw_app_meta_data` and `user_meta_data` fields.
    *   **Security**: Runs with `SECURITY DEFINER` privileges to bypass RLS and ensure profile creation.

*   **`on_auth_user_created` Trigger**:
    *   **Purpose**: An `AFTER INSERT` trigger on the `auth.users` table that executes the `public.handle_new_user()` function. This ensures that every new user automatically gets a profile and their role is set for RLS.

## 4. Supabase Storage

The application uses a dedicated Supabase Storage bucket named `content` for storing uploaded media files.

*   **Bucket Name**: `content`
*   **Public Access**: The bucket is set to `public` to allow direct access to file URLs, but RLS policies on `storage.objects` control who can upload, read, update, or delete files.
*   **File Paths**: Files are typically stored under paths like `content/<user_id>/<filename>`, which is used by RLS policies to identify file ownership.

## 5. Application Interaction (Server Actions)

The application interacts with Supabase primarily through Next.js Server Actions, which use the `@supabase/ssr` library to create Supabase clients.

### Client Types:

*   **`createClient()` (Regular Client)**: Used for operations where RLS should be enforced (e.g., a client user fetching their own data). This client is initialized with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
*   **`createClient({ useServiceRole: true })` (Service Role Client)**: Used for operations requiring elevated privileges, bypassing RLS (e.g., admin users fetching all data, or backend processes like user registration). This client is initialized with `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.

### Key Server Actions and Their Supabase Interactions:

*   **`app/actions/auth-actions.ts`**:
    *   `signInUser`: Authenticates a user with email/password.
    *   `registerUser`: Registers a new user, creating an `auth.users` entry and a `profiles` entry, setting both `app_metadata` and `user_metadata` roles. Uses service role.
    *   `getUserAndProfile`: Fetches the current authenticated user's details and their corresponding profile from the `profiles` table.
    *   `updateUserPassword`: Allows an authenticated user to change their password.
    *   `getUserSession`: Retrieves the current Supabase session.
    *   `updateUserAfterOAuth`: Updates user metadata after OAuth sign-in. Uses service role.

*   **`app/actions/data-actions.ts`**:
    *   `fetchUserRole`: Fetches a user's role from the `profiles` table.
    *   `addStore`: Inserts a new store record for a user.
    *   `fetchStoresByUserId`: Retrieves stores belonging to a specific user.
    *   `insertContent`: Inserts new content metadata into the `content` table.
    *   `fetchContentForUser`: Fetches content uploaded by a specific user.
    *   `fetchAllContent`: Fetches all content from all users (uses service role for admin access).
    *   `fetchContentStatsByUserId`: Calculates content statistics for a user.
    *   `fetchClientProfileById`: Fetches a specific client's profile (uses service role for admin access).
    *   `fetchAllClientProfiles`: Fetches all client profiles (uses service role).
    *   `fetchAllStores`: Fetches all stores (uses service role).
    *   `fetchAdminDashboardData`: Fetches comprehensive data for the admin dashboard (uses service role).
    *   `fetchAdminContentStats`: Fetches content statistics for the admin dashboard (uses service role).

*   **`app/actions/user-management-actions.ts`**:
    *   `changeUserEmail`: Changes a user's email address (uses service role).
    *   `sendPasswordReset`: Sends a password reset link (uses service role).
    *   `inviteUser`: Invites a new user by email (uses service role).
    *   `deleteUser`: Deletes a user account (uses service role).
    *   `requestReauthentication`: Sends a reauthentication request (uses service role).
    *   `sendMagicLink`: Sends a magic link for sign-in (uses service role).
    *   `updateUserAppMetadata`: Updates a user's `app_metadata` and `user_metadata` roles (uses service role).
    *   `syncAllUsersAppMetadata`: Synchronizes `app_metadata` and `user_metadata` roles for all users based on their `profiles` table entry (uses service role).

*   **`app/actions/get-clients-action.ts`**:
    *   `getAllClients`: Fetches a list of all client profiles, including their associated stores and content counts (uses service role).

*   **`app/actions/download-data-action.ts`**:
    *   `getClientDataAsCsv`: Generates a CSV of a client's content data (uses service role).

## 6. Environment Variables

The application relies on the following environment variables for Supabase connectivity:

*   `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public "anon" key for your Supabase project. Used for client-side and RLS-enforced server-side operations.
*   `SUPABASE_SERVICE_ROLE_KEY`: The secret "service_role" key for your Supabase project. Used for server-side operations that bypass RLS (e.g., admin actions, user management). **This key must be kept secret and never exposed to the client-side.**

This comprehensive setup ensures a robust, secure, and scalable interaction with the Supabase backend for the Hapo Media Content Hub.