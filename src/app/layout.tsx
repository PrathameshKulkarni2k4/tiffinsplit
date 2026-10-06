import "./globals.css";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Nav from "@/components/Nav";
import AxeDev from "@/components/AxeDev";

export const metadata: Metadata = {
  title: "TiffinSplit",
  description: "Split our mess tiffin bills, correctly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {/* Page shell: 960px wide, widening to 1080px on desktop, with extra
            bottom padding on mobile to clear the fixed tab bar. */}
        <main className="mx-auto max-w-[960px] px-5 pb-16 pt-6 max-md:px-3.5 max-md:pb-[108px] max-md:pt-4 lg:max-w-[1080px]">
          {children}
        </main>
        <SpeedInsights />
        <AxeDev />
      </body>
    </html>
  );
}
