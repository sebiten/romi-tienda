/** @type {import('next').NextConfig} */
const nextConfig = {

  allowedDevOrigins: [
    'http://84694b9288f6.ngrok-free.app',
  ],
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
