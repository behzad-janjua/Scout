import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scout.ai — AI secret shopper for phone calls",
  description:
    "Scout.ai calls your business like a real customer, scores the experience, and shows which sentences lost the sale.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand">
              <span className="brand-dot" />
              Scout<span className="brand-accent">.ai</span>
            </Link>
            <nav className="nav">
              <Link href="/">Home</Link>
              <Link href="/create">New test</Link>
            </nav>
          </div>
        </header>
        <main className="container main">{children}</main>
        <footer className="site-footer">
          <div className="container">
            AI secret shopping for phone calls · Vapi · Nebius · Insforge
          </div>
        </footer>
      </body>
    </html>
  );
}
