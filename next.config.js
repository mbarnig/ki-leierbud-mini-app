// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: false,
  // on lit le sous-chemin dans BASE_PATH (ex: "/app1", "knowledge/app3")
  basePath: process.env.BASE_PATH || '',
};
