/** @type {import('next').NextConfig} */
import packageJson from './package.json' with { type: 'json' };
const nextConfig = {
  reactStrictMode: false, // enable after react-leaflet fix,
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
