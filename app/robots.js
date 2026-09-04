export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/ground-school/admin"] },
    ],
    sitemap: "https://www.madebysid.space/sitemap.xml",
    host: "https://www.madebysid.space",
  };
}
