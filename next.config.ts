import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default nextConfig;
