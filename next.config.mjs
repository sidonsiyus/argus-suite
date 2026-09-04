/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The heavy interactive modules (Argus, Pyrgos, Gargantua, etc.) live in /public
  // as self-contained static apps and are linked to directly from the portal.
};

export default nextConfig;
