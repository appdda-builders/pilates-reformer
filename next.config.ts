import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3", "@neondatabase/serverless", "postgres"],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/assets/**",
      },
    ],
  },
  async redirects() {
    return []
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
