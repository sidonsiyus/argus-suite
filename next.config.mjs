/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The heavy interactive modules (Argus, Pyrgos, Gargantua, etc.) live in /public
  // as self-contained static apps and are linked to directly from the portal.
  async redirects() {
    return [
      {
        source: "/mentor.html",
        destination: "/mentor-os",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
