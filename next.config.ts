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
      },
      {
        protocol: 'https',
        hostname: 'lpwebsite-prod-s3cdn.leapmotor-international.com',
      },
      {
        protocol: 'https',
        hostname: 'digitalassets.tesla.com',
      },
      {
        protocol: 'https',
        hostname: 'www.razaoautomovel.com',
      },
    ]
  }
};

export default nextConfig;
