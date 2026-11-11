/** @type {import('next').NextConfig} */
import packageJson from './package.json' with { type: 'json' };
const nextConfig = {
  reactStrictMode: true,
  // Self-contained server for the Docker image (.next/standalone/server.js).
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
