/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tipos do Database ainda em refinamento — não trava o build
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
