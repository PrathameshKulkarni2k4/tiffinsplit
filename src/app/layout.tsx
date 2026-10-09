import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Nav from "@/components/Nav";
import AxeDev from "@/components/AxeDev";

export const metadata: Metadata = {
  title: "TiffinSplit",
  description: "Split our mess tiffin bills, correctly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variables go on <html> so everything below can read them. Geist
    // is self-hosted through the `geist` package, so there is no request to
    // Google at build or run time.
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Nav />
        {/* Page shell: 960px wide, widening to 1080px on desktop, with extra
            bottom padding on mobile to clear the fixed tab bar.

            `rise` staggers the page's own children in on arrival. It lives here
            rather than on each page so every screen enters the same way. */}
        <main className="rise mx-auto max-w-[960px] px-5 pb-16 pt-6 max-md:px-3.5 max-md:pb-[108px] max-md:pt-4 lg:max-w-[1080px]">
          {children}
        </main>
        <SpeedInsights />
        <AxeDev />
      </body>
    </html>
  );
}
