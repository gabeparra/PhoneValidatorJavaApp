/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external access in development
  experimental: {
    allowedDevOrigins: ['*'], // Allow all origins in dev mode
  },
  // Optional: Disable strict mode if needed
  reactStrictMode: true,
  // Proxy API calls through Next.js so port 8000 doesn't need to be publicly open
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

export default nextConfig;