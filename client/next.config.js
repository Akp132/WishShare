/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['source.unsplash.com', 'ui-avatars.com', 'images.unsplash.com', 'via.placeholder.com']
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://wishshare.onrender.com',
  },
};

module.exports = nextConfig;