import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/db", "@repo/auth", "@repo/ui"],
  // If you are using images from an external source (like UploadThing or Supabase)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.your-storage-provider.com", // e.g., 'utfs.io' for UploadThing
      },
    ],
  },
};

export default nextConfig;
