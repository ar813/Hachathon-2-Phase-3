/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/ask',
                destination: process.env.NEXT_PUBLIC_BACKEND_URL + '/ask',
            },
        ];
    },
};

export default nextConfig;
