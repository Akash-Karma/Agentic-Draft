import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: `${backendUrl}/api/:path*`, // Proxy to Express
      },
    ];
  },
};

export default nextConfig;