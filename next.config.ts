import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker: produces a minimal standalone server bundle
  // in .next/standalone that can run without node_modules
  output: "standalone",
};

export default nextConfig;
