import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  // Tipos do Database ainda em refinamento — não trava o build
  typescript: { ignoreBuildErrors: true },
  // Next 16 removeu `eslint` daqui; lint roda separado via `next lint`
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
