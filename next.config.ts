import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default nextConfig;
