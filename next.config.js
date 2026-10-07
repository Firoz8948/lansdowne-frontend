/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    // Assets are pre-compressed WebP on Bunny CDN; on-server resizing only burns CPU/RAM on the small EC2 box.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.lansdowneleather.com' }],
        destination: 'https://lansdowneleather.com/:path*',
        permanent: true,
      },
      { source: '/home', destination: '/', permanent: true },
      { source: '/products', destination: '/shop', permanent: true },
      { source: '/contact', destination: '/contact-us', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
