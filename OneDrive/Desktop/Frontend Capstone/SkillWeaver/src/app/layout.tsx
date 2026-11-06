import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "SkillWeaver | Your learning space", template: "%s | SkillWeaver" },
  description: "A calm, practical workspace for setting learning goals, organizing tasks, and tracking steady progress.",
  applicationName: "SkillWeaver",
  openGraph: {
    title: "SkillWeaver | Your learning space",
    description: "Learn with intention. Grow with consistency.",
    siteName: "SkillWeaver",
    type: "website",
    images: [{ url: "/og-skillweaver.svg", width: 1200, height: 630, alt: "SkillWeaver learning dashboard" }],
  },
  twitter: { card: "summary_large_image", title: "SkillWeaver", description: "Your personal learning space." },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F8FAFC",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
