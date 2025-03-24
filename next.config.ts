/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        pathname: '/**',
      },
    ],
    // Si seguís teniendo problemas con la optimización, podés usar esta opción:
    // unoptimized: true,
  },
};

module.exports = nextConfig;
