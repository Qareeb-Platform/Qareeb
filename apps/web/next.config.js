const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
const publicApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';
const apiOrigin = publicApiUrl.replace(/\/v1\/?$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1',
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${apiOrigin}/:path*`,
            },
        ];
    },
};

module.exports = withNextIntl(nextConfig);
