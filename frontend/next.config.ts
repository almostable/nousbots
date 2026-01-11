import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  allowedDevOrigins: ['192.168.0.101:3000', 'localhost:3000'],
}

export default nextConfig
