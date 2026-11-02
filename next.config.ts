import type { NextConfig } from "next";

// Uploaded images live on the backend; /uploads/* is proxied to it so content
// can use relative image URLs that work on any domain
const apiOrigin = new URL(process.env.API_URL ?? "http://localhost:4000/api").origin;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Room for 5MB image uploads through Server Actions plus multipart overhead
    serverActions: { bodySizeLimit: "6mb" },
  },
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: `${apiOrigin}/uploads/:path*` }];
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
