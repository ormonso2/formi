import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  serverExternalPackages: [
    'sharp',
    '@napi-rs/canvas',
    'pdfjs-dist',
    'heic-convert',
    'jszip',
    'pdf-parse',
    'mammoth',
    'html-docx-js',
    'xlsx',
    'stripe',
  ],
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
};

export default nextConfig;
