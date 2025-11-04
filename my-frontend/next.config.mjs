/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow external access in development
  experimental: {
    allowedDevOrigins: ['*'], // Allow all origins in dev mode
  },
  // Optional: Disable strict mode if needed
  reactStrictMode: true,
};

export default nextConfig;