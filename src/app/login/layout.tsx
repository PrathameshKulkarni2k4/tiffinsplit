import type { Metadata } from "next";

// The login page is a client component, and client components cannot export
// metadata - so the title lives in a one-line layout above it.
export const metadata: Metadata = { title: "Sign in" };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
