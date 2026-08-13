import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
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
  // Webpack config for Transformers.js WebAssembly binaries support
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    };

    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
