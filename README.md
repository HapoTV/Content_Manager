# Digital Marketing Content Hub

[![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.50.4-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive content management system designed to streamline digital marketing campaigns. This platform enables clients to easily upload marketing content while providing marketing teams with powerful tools to organize and deploy materials efficiently.

## 🚀 Overview

The Digital Marketing Content Hub is a full-stack web application that bridges the gap between content creators and marketing teams. It provides a secure, role-based platform where clients can upload their marketing materials (images, videos, audio) with scheduling options, while administrators can view, organize, and manage all content across multiple locations and companies.

## ✨ Key Features

### For Clients
- **Easy Content Upload**: Drag-and-drop interface for images, videos, and audio files
- **Store Management**: Add and manage multiple store locations with geographic data
- **Content Scheduling**: Set start/end dates and recurrence patterns for content display
- **Secure Access**: Role-based authentication with client-specific dashboards
- **Real-time Updates**: Instant feedback on upload status and content management

### For Administrators
- **Centralized Content View**: Access all client-uploaded content in one dashboard
- **Smart Organization**: Content grouped by location, company, or content type
- **Advanced Filtering**: Sort by date, type, location, or company
- **Content Preview**: Built-in media viewer for images, videos, and audio
- **Campaign Management**: Overview of all active and scheduled campaigns

### Security & Administration
- **Role-Based Access Control**: Separate client and admin authentication flows
- **Superadmin Bypass**: Secure backdoor access for system administration
- **Row-Level Security**: Database-level security using Supabase RLS
- **File Storage Security**: Secure file uploads with user-specific access controls

## 🛠 Technologies Used

### Frontend
- **Next.js 13.5.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **React Dropzone** - File upload interface

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage and management
- **Row Level Security (RLS)** - Database-level security

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- A **Supabase** account (free tier available)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd digital-marketing-content-hub
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project credentials
3. Copy your project URL and anon key
4. **Configure Google OAuth** (for Google sign-in):
    - Go to Authentication > Providers in your Supabase dashboard
    - Enable Google provider
    - Add your Google OAuth credentials (Client ID and Client Secret)
    - Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Superadmin Configuration (Change these in production!)
SUPERADMIN_MASTER_KEY=your_secure_master_key_2024
SUPERADMIN_SECRET=your_super_secret_hash_key_2024
```

### 5. Set Up Database

The application includes pre-built migrations. In your Supabase dashboard:

1. Go to the SQL Editor
2. Run the migration files in order (they're located in `supabase/migrations/`)
3. Or use the Supabase CLI if you have it installed:
   ```bash
   supabase db reset
   ```

### 6. Configure Storage

In your Supabase dashboard:
1. Go to Storage
2. The `content` bucket should be created automatically by the migrations
3. Verify the bucket is set to public access

### 7. Start the Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

### Client Workflow

1. **Account Creation**
    - Visit the homepage and click "Create Account" under Client Portal
    - Choose to sign up with Google or fill out the registration form with required details
    - Sign in to access your dashboard

2. **Store Setup**
    - On first login, you'll be prompted to set up your store details
    - Enter store name, brand/company, address, and optional coordinates
    - Save to proceed to content upload

3. **Content Upload**
    - Use the drag-and-drop interface to select files
    - Set content title, start/end dates, and recurrence options
    - Upload and track your content in the dashboard

### Administrator Workflow

1. **Admin Access**
    - Create an admin account or sign in via the Admin Dashboard link (supports Google OAuth)
    - Access the centralized content management interface

2. **Content Management**
    - View all client content organized by location or company
    - Use filtering options to find specific content
    - Preview media files directly in the browser
    - Monitor campaign schedules and recurrence patterns

### Superadmin Access

For system administration and emergency access:

1. **Generate Access Key**
    - Visit `/superadmin` in your browser
    - Enter your master key (from environment variables)
    - Generate a time-limited superadmin key

2. **Bypass Authentication**
    - Use the generated key as a URL parameter: `/admin?superadmin_key=YOUR_KEY`
    - Or include it as a header: `x-superadmin-key: YOUR_KEY`
    - Access expires after 24 hours

## 🔐 Authorization & User Validation

### Authentication Flow

The application uses a multi-layered authentication system:

1. **Supabase Auth**: Handles user registration, login, and session management
    - **Email/Password**: Traditional authentication with secure password requirements
    - **Google OAuth**: One-click sign-in with Google accounts
2. **Role-Based Access**: Users are assigned either 'client' or 'admin' roles
3. **Route Protection**: Middleware validates user roles before granting access
4. **Database Security**: Row-Level Security (RLS) ensures data isolation

### User Roles

- **Client**: Can upload content, manage their stores, view their own uploads
- **Admin**: Can view all content across all clients, organize campaigns
- **Superadmin**: Emergency access that bypasses normal authentication

### Security Features

- **Password Requirements**: Minimum 8 characters with mixed case and numbers
- **OAuth Integration**: Secure Google authentication with proper redirect handling
- **Session Management**: Automatic session refresh and secure cookie handling
- **File Access Control**: Users can only access their own uploaded files
- **Database Isolation**: RLS policies prevent cross-user data access
- **Audit Trail**: All actions are logged with timestamps and user IDs

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `SUPERADMIN_MASTER_KEY` | Master key for generating superadmin access | Yes |
| `SUPERADMIN_SECRET` | Secret for superadmin key validation | Yes |

### Database Schema

The application uses the following main tables:
- `profiles`: User information and roles
- `stores`: Client store/location data
- `content`: Uploaded marketing content with metadata
- `storage.objects`: File storage managed by Supabase

### File Upload Limits

- **Supported Formats**: Images (JPEG, PNG, GIF), Videos (MP4, MOV, AVI), Audio (MP3, WAV, AAC)
- **File Size**: No explicit limit set (controlled by Supabase storage limits)
- **Storage**: Files are stored in Supabase Storage with public access URLs

## 🤝 Contributing

We welcome contributions to improve the Digital Marketing Content Hub! Here's how you can help:

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Ensure all new features include proper error handling
- Add appropriate comments for complex logic
- Test both client and admin workflows
- Verify security implications of changes

### Code Style

- Use ESLint configuration provided
- Follow existing naming conventions
- Keep components focused and reusable
- Use proper TypeScript types

## 🐛 Troubleshooting

### Common Issues

**Authentication not working:**
- Verify Supabase credentials in `.env.local`
- Check that migrations have been applied
- Ensure the profiles table exists and has proper RLS policies
- For Google OAuth: Verify Google provider is enabled in Supabase dashboard
- Check that redirect URLs are properly configured

**File uploads failing:**
- Verify the `content` storage bucket exists
- Check storage policies in Supabase dashboard
- Ensure file types are supported

**Superadmin access denied:**
- Verify environment variables are set correctly
- Check that the generated key hasn't expired (24-hour limit)
- Ensure the master key matches your environment configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support & Contact

For support, questions, or feature requests:

- **Issues**: Open an issue on GitHub
- **Documentation**: Check this README and inline code comments
- **Security Issues**: Please report security vulnerabilities privately

## 🔄 Version History

- **v1.1.0**: Added Google OAuth authentication
    - Google sign-in/sign-up for both client and admin users
    - Improved authentication flow with OAuth callback handling
    - Enhanced user experience with social login options
- **v1.0.0**: Initial release with core functionality
    - Client content upload system
    - Admin dashboard with content organization
    - Role-based authentication
    - Superadmin bypass system
    - File storage and management

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
    - Set up production Supabase project
    - Configure production environment variables
    - Update CORS settings in Supabase

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

3. **Security Checklist**
    - Change default superadmin credentials
    - Enable HTTPS
    - Configure proper CORS policies
    - Set up monitoring and logging

### Recommended Hosting

- **Vercel**: Seamless Next.js deployment
- **Netlify**: Alternative with good Next.js support
- **Railway**: Full-stack deployment option

---

Built with ❤️ using Next.js, TypeScript, and Supabase

## 📦 Releases

This project uses Git tags to generate GitHub Releases automatically.

How to create a release:

1. Ensure your changes are committed to your main branch.
2. Bump the version in package.json if needed.
3. Create a version tag locally using npm:
   - npm run release:tag
   This will create a tag like v0.1.4 based on the current package.json version.
4. Push the tag to the remote repository:
   - git push origin v0.1.4

What happens next:
- A GitHub Action (.github/workflows/release.yml) will run on tag push and create a GitHub Release named after the tag.
- The workflow attempts to build a changelog from merged PRs using mikepenz/release-changelog-builder-action.

Notes:
- If you don’t use PRs, you can edit CHANGELOG.md manually for notable changes.
- Tag format must start with v (e.g., v1.2.3).

## 🧹 Git and IDE files

Do not commit IDE-specific files to the repository. In particular, JetBrains IDE project files under `.idea/` (including `.idea/dataSources.xml`) are user- and machine-specific and may contain local database connection details. These are ignored via `.gitignore`.

If `.idea/dataSources.xml` (or any other `.idea` file) is already tracked, run the following to stop tracking it and keep it locally only:

```bash
# Remove tracked IDE files while keeping local copies
git rm --cached -r .idea
# Or remove a specific file
# git rm --cached .idea/dataSources.xml

# Commit the change
git commit -m "chore(git): ignore JetBrains .idea project files"
```
