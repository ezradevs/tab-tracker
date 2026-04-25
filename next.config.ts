import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    viewTransition: true,
  },
  allowedDevOrigins: ["192.168.68.56", "192.168.68.53"],
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ]
  },
}

export default nextConfig
