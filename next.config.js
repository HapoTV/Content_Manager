/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avnaempzpcvxswumzplw.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
