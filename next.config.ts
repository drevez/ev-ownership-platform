import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'evtest.eu'
      }
      ,
      {
        protocol: 'https',
        hostname: 'www.hyundai.pt'
      }
    ]
  }
};

export default nextConfig;
