/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // Evitar generación estática durante build para rutas dinámicas
  outputFileTracing: true,
  // No intentar pre-renderizar API routes
  staticPageGenerationTimeout: 1000,
};

export default nextConfig;
