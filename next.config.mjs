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
  // Keep webpack for CSS Modules camelCase (`styles.menuItem`).
  // Next.js 16 defaults to Turbopack; pass --webpack in scripts.
  webpack: (config) => {
    const rules = config.module.rules
      .find((rule) => typeof rule.oneOf === 'object')
      .oneOf.filter((rule) => Array.isArray(rule.use));
    rules.forEach((rule) => {
      rule.use.forEach((moduleLoader) => {
        if (
          moduleLoader.loader !== undefined &&
          moduleLoader.loader.includes('css-loader') &&
          typeof moduleLoader.options.modules === 'object'
        ) {
          moduleLoader.options = {
            ...moduleLoader.options,
            modules: {
              ...moduleLoader.options.modules,
              // This is where we allow camelCase class names
              exportLocalsConvention: 'camelCase',
            },
          };
        }
      });
    });

    return config;
  },
};

export default nextConfig;
