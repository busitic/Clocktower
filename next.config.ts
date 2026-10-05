import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "utfs.io" }, // UploadThing, older file URLs
      { protocol: "https", hostname: "*.ufs.sh" }, // UploadThing, newer file URLs
      { protocol: "https", hostname: "images.pexels.com" },
    ],
  },
};

export default nextConfig;