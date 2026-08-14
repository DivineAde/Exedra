/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@whiteboard/editor-core", "@whiteboard/shared-types", "@whiteboard/validation"],
};

export default nextConfig;
