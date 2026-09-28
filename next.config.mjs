/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The heavy interactive modules (Argus, Pyrgos, Gargantua, etc.) live in /public
  // as self-contained static apps and are linked to directly from the portal.
  // The Vistas internship portal is one of these: a Vite SPA built with base
  // /internship/ and vendored into public/internship.
  async rewrites() {
    return [
      // Serve the SPA's index for the bare /internship path (its assets are real
      // files under /internship/assets and are served directly).
      { source: "/internship", destination: "/internship/index.html" },
    ];
  },
  async redirects() {
    return [
      {
        source: "/mentor.html",
        destination: "/mentor-os",
        permanent: false,
      },
      {
        source: "/login",
        destination: "/appointments/login",
        permanent: false,
      },
      {
        source: "/coordinator",
        destination: "/appointments/coordinator",
        permanent: false,
      },
      {
        source: "/coordinator/:path*",
        destination: "/appointments/coordinator/:path*",
        permanent: false,
      },
      {
        source: "/book",
        destination: "/appointments/book",
        permanent: false,
      },
      {
        source: "/book/:path*",
        destination: "/appointments/book/:path*",
        permanent: false,
      },
      {
        source: "/appointment-status",
        destination: "/appointments/appointment-status",
        permanent: false,
      },
      {
        source: "/appointment-status/:path*",
        destination: "/appointments/appointment-status/:path*",
        permanent: false,
      },
      {
        source: "/faculty-calendar/:path*",
        destination: "/appointments/faculty-calendar/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
