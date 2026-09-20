/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // hides the floating Next.js dev badge in the corner (development only)
  devIndicators: false,
  images: {
    // client logos are small PNGs served from /public
    formats: ["image/webp"],
    // Placeholder photography only. These currently render with `unoptimized`,
    // so this entry is what lets the optimiser take over the moment that flag
    // is dropped. Remove it once real photography lands in /public.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/seed/**",
      },
    ],
  },
};

export default nextConfig;
