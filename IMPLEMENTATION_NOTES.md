# Admin Signup Implementation

## Issue Description
The issue was to ensure that when a user signs up from the hidden admin signup page, they are saved as an admin in the database.

## Analysis

### Authentication Flow
1. The application has a hidden admin signup page at `/app/auth/admin/signup`
2. This page uses the `RegistrationForm` component with `userType="admin"` prop
3. The `RegistrationForm` component calls the `signUp` function from `lib/auth.ts` with the user's email, password, and the `userType` as the role
4. The original `signUp` function was using Supabase's standard `auth.signUp` method, which sets the role in `user_metadata` but not in `app_metadata`
5. The application also has a server action `registerUser` in `app/actions/auth-actions.ts` that properly sets the role in both `user_metadata` and `app_metadata`, and creates a profile with the correct role

### Database Schema
1. User roles are stored in the `profiles` table in a `role` column
2. The application uses Row Level Security (RLS) policies that check the role in the JWT token (`auth.jwt() ->> 'role' = 'admin'`)
3. For the JWT to contain the role, it needs to be set in `app_metadata` during user creation

## Solution Implemented
The solution was to modify the `signUp` function in `lib/auth.ts` to use the `registerUser` server action instead of directly using Supabase's `auth.signUp` method. This ensures that:

1. When a user signs up from the admin signup page, the `userType="admin"` prop is passed to the `RegistrationForm` component
2. The `RegistrationForm` component calls the `signUp` function with `role="admin"`
3. The `signUp` function calls the `registerUser` server action with `role="admin"`
4. The `registerUser` server action sets the role in both `user_metadata` and `app_metadata`, and creates a profile with the role set to "admin"
5. The JWT token will contain the role claim, allowing the RLS policies to work correctly

## Changes Made
1. Modified `lib/auth.ts` to:
   - Import the `registerUser` function from `@/app/actions/auth-actions`
   - Update the `signUp` function to call `registerUser` instead of directly using Supabase's `auth.signUp`
   - Handle the response from `registerUser` appropriately
   - Retrieve the user data to return in the same format as the original function

## Testing
To verify that the implementation works correctly:

1. Access the hidden admin signup page at `/app/auth/admin/signup`
2. Create a new user account
3. Verify that the user is saved as an admin in the database by:
   - Checking the `profiles` table to ensure the `role` column is set to "admin"
   - Confirming that the user can access admin-only pages and features
4. Also verify that regular signup still works correctly and creates users with the "client" role

## Notes
- The solution maintains backward compatibility with the existing code
- It leverages the existing server action that already had the correct implementation for setting user roles
- The change is minimal and focused on the specific issue