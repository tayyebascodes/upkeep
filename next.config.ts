import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/admin", destination: "/company", permanent: true },
      { source: "/admin/setup", destination: "/company/setup", permanent: true },
    ];
  },
};

export default nextConfig;
