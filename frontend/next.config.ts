import type { NextConfig } from "next";

const portfolioApi = new URL(process.env.PORTFOLIO_API_URL || "http://localhost:6231");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: portfolioApi.protocol.slice(0, -1) as "http" | "https",
        hostname: portfolioApi.hostname,
        port: portfolioApi.port,
        pathname: "/uploads/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
