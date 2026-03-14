import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/external/:path*",
        destination: "http://localhost:3000/api/:path*", // Proxy to Express
      },
    ];
  },
};

export default nextConfig;