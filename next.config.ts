import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    experimental: {
        turbo: {
            // Enable Turbopack for development
        },
    },
};

export default nextConfig;
