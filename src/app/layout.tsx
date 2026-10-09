import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Nav from "@/components/Nav";
import AxeDev from "@/components/AxeDev";
import FlashToast from "@/components/FlashToast";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: {
    default: "TiffinSplit",
    // Every page now names itself in the tab instead of six tabs all reading
    // "TiffinSplit".
    template: "%s · TiffinSplit",
  },
  description: "Split our mess tiffin bills, correctly.",
  applicationName: "TiffinSplit",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TiffinSplit", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "TiffinSplit",
    description: "Split our mess tiffin bills, correctly.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variables go on <html> so everything below can read them. Geist
    // is self-hosted through the `geist` package, so there is no request to
    // Google at build or run time.
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body>
        {/* Applies the saved theme before anything paints. If this ran later -
            in a useEffect, say - the page would paint light and then snap to
            dark, which is the flash everyone notices. Stored choice wins;
            otherwise the system preference decides. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('tiffinsplit-theme');" +
              "var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;" +
              "if(d)document.documentElement.classList.add('dark')}catch(e){}})()",
          }}
        />
        <Nav />
        {/* Page shell: 960px wide, widening to 1080px on desktop, with extra
            bottom padding on mobile to clear the fixed tab bar.

            `rise` staggers the page's own children in on arrival. It lives here
            rather than on each page so every screen enters the same way. */}
        <ToastProvider>
          {/* useSearchParams needs a Suspense boundary above it. */}
          <Suspense fallback={null}>
            <FlashToast />
          </Suspense>
          <main className="rise mx-auto max-w-[960px] px-5 pb-16 pt-6 max-md:px-3.5 max-md:pb-[108px] max-md:pt-4 lg:max-w-[1080px]">
            {children}
          </main>
        </ToastProvider>
        <SpeedInsights />
        <AxeDev />
      </body>
    </html>
  );
}
