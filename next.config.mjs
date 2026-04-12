import path from 'path';
import { fileURLToPath } from 'url';

// Single app root (avoids Next inferring C:\Users\User from an extra lockfile there)
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: false,
  },
  reactStrictMode: true,
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
