/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["react-katex"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.notion.so",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
        // IMPORTANT:
        // This hostname is used to fetch images stored by Notion.
        // If your images are saved in a different domain,
        // please check the image URL in your Notion pages and update this hostname accordingly.
        // An incorrect domain here will cause image fetching to fail.
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Redirect Configuration
  // This section defines URL redirects for the application.
  // - /articles -> / (home)
  // - /tags -> / (home)
  // No additional redirects should be necessary for basic functionality.
  async redirects() {
    return [
      {
        source: "/articles",
        destination: "/",
        permanent: true,
      },
      {
        source: "/tags",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
