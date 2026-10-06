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
        <main className="container">{children}</main>
        <SpeedInsights />
        <AxeDev />
      </body>
    </html>
  );
}
