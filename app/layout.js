import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

// Inter everywhere (Claude-style clean grotesque); JetBrains Mono for technical labels.
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.madebysid.space"),
  title: "ARGUS · Aviation Terminal",
  description:
    "The all-seeing aviation terminal — live flight & satellite tracking, ATC and flight-ops simulators, engineering labs, a careers desk, dashboards, research and a notes library, all in the browser.",
  applicationName: "ARGUS",
  authors: [{ name: "sid" }],
  keywords: ["aviation", "aerospace", "flight tracking", "ATC", "radar", "METAR", "flight simulator", "aviation engineering"],
  openGraph: {
    type: "website",
    url: "https://www.madebysid.space",
    siteName: "ARGUS · Aviation Terminal",
    title: "ARGUS · Aviation Terminal",
    description:
      "Live flight & satellite tracking, ATC and flight-ops simulators, engineering labs, careers, research and a notes library — the all-seeing aviation terminal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ARGUS · Aviation Terminal",
    description: "The all-seeing aviation terminal — live radar, simulators, engineering labs and more.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f1efe8",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body>
        {/* apply the saved theme before paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('argus-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
