/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Isolate dev and prod build artifacts so a `next build` can never poison a
  // running `next dev` (and vice versa). On Windows this combination was
  // surfacing as missing chunks (`Cannot find module './XXX.js'`) and 404s on
  // /_next/static/* mid-session.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      // Allow images served from any Supabase project's public storage
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/public/**' }
    ]
  }
};

export default nextConfig;
