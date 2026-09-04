import "./globals.css";
import { Inter, JetBrains_Mono } from "next/font/google";

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
  title: "ARGUS · Aviation Terminal",
  description:
    "The all-seeing aviation terminal — live flight & satellite tracking, ATC and flight-ops simulators, engineering labs, a careers desk, dashboards and research, all in the browser.",
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
      </body>
    </html>
  );
}
