import nextPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  navigateFallback: "/offline",

  runtimeCaching: [
    // ❌ NO cachear API Routes de Next
    {
      urlPattern: /^\/api\/.*/i,
      handler: "NetworkOnly",
    },

    // ❌ NO cachear backend externo (reservas)
    {
      urlPattern: /^https:\/\/api\.centinela\.cl\/.*/i,
      handler: "NetworkOnly",
    },

    // ✅ Cachear imágenes
    {
      urlPattern: /^https?.*\.(png|jpg|jpeg|svg|webp)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
});

export default withPWA(nextConfig);
