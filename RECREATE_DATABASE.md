# How to Recreate Your Supabase Database

This guide provides step-by-step instructions for recreating your Supabase database after it has been deleted. We'll use the existing migration scripts to rebuild the database structure.

## Prerequisites

- Access to your Supabase project dashboard
- The migration scripts in the `supabase/migrations/` directory

## Option 1: Using the Supabase Dashboard (SQL Editor)

This method is recommended if you don't have the Supabase CLI installed or prefer using the web interface.

### Step 1: Access the SQL Editor

1. Log in to your Supabase dashboard at [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Navigate to the "SQL Editor" section in the left sidebar

### Step 2: Run the Migration Scripts in Order

Run each migration script in the correct chronological order. The timestamp in the filename indicates the order:

1. Run `20250709132847_sweet_canyon.sql` - Creates the profiles table
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

2. Run `20250709132852_jade_snowflake.sql` - Creates the stores table
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

3. Run `20250709132858_foggy_grove.sql` - Creates the content table
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

4. Run `20250709132908_teal_bonus.sql` - Creates storage bucket for content files
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

5. Run `20250709140019_damp_dream.sql` - Creates automatic profile creation trigger
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

6. Run `20250709141854_polished_hill.sql` - Fixes RLS policy for automatic profile creation
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

7. Run `20250723163910_bright_salad.sql` - Adds admin policies for client management
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

8. Run `20250723202300_database_improvements.sql` - Implements database improvements
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

9. Run `20250723205800_add_content_auto_deletion.sql` - Adds content auto-deletion
   - Copy the contents of this file and paste it into the SQL Editor
   - Click "Run" to execute the script

### Step 3: Verify the Database Structure

After running all migration scripts:

1. Go to the "Table Editor" in the Supabase dashboard
2. Verify that the following tables exist:
   - `profiles`
   - `stores`
   - `content`
   - `audit_logs`

3. Go to the "Storage" section
4. Verify that the `content` bucket exists

## Option 2: Using the Supabase CLI

This method is recommended if you have the Supabase CLI installed and prefer using the command line.

### Step 1: Install the Supabase CLI (if not already installed)

Follow the [official installation instructions](https://supabase.com/docs/guides/cli/getting-started) for your operating system.

### Step 2: Link Your Project

```bash
supabase login
supabase link --project-ref qfmcydqseywypllntptv
```

Replace `your-project-ref` with your Supabase project reference ID, which you can find in your project settings.

### Step 3: Reset the Database

Run the following command to apply all migrations:

```bash
supabase db reset
```

This command will apply all migration scripts in the correct order.

### Step 4: Verify the Database Structure

After running the reset command:

1. Go to the "Table Editor" in the Supabase dashboard
2. Verify that the following tables exist:
   - `profiles`
   - `stores`
   - `content`
   - `audit_logs`

3. Go to the "Storage" section
4. Verify that the `content` bucket exists

## Important Notes

1. **User Accounts**: This process recreates the database structure but does not restore user accounts. If you need to recreate user accounts, you'll need to do that separately through the Supabase Auth section or by importing user data.

2. **Data Recovery**: These steps only recreate the database structure. If you need to restore actual data, you'll need to import it from a backup if available.

3. **Environment Variables**: Ensure your application's environment variables are correctly set to connect to your Supabase project:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Storage Bucket**: The migration scripts should create the necessary storage bucket, but verify it exists and has the correct permissions.

## Troubleshooting

If you encounter any issues during the database recreation process:

1. **Script Execution Errors**: Check the error message in the SQL Editor. Common issues include:
   - Tables or objects already exist (you can add `IF NOT EXISTS` to create statements)
   - Missing dependencies (ensure you're running scripts in the correct order)

2. **Permission Issues**: Ensure you have the necessary permissions in your Supabase project.

3. **Missing Tables**: If tables are missing after running all migrations, check if any scripts failed to execute properly.

4. **Storage Issues**: If the storage bucket wasn't created, you can manually create it in the Storage section of the Supabase dashboard.

For additional help, refer to the [Supabase documentation](https://supabase.com/docs) or contact support.