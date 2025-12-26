import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rasmlar uchun (Next.js 16 versiyasi)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ucigkrocoxeguubthnsc.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;