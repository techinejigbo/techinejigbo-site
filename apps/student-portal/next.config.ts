import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@techinejigbo/firebase"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
