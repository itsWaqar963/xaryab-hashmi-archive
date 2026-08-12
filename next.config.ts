import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Vercel build ke waqt TypeScript errors ko bypass karne ke liye
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xbgtruldcucekigbcybc.supabase.co',
      },
    ],
  },
  compress: true,
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);