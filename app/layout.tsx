import type { Metadata } from "next";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scout.ai: AI Secret Shopper for Phone Calls",
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
              Scout<span className="brand-accent">.ai</span>
            </Link>
            <NavBar />
          </div>
        </header>
        <main className="container main">{children}</main>
        <footer className="site-footer">
          <div className="container">
            &copy; 2025 Scout.ai
          </div>
        </footer>
      </body>
    </html>
  );
}
