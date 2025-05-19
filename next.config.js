/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure to ignore TypeScript errors during production build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Add other configurations here as needed
};

module.exports = nextConfig; 