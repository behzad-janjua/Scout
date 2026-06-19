"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const path = usePathname();
  const onCreatePage = path === "/create";

  return (
    <nav className="nav">
      <Link href="/">Home</Link>
      {!onCreatePage && (
        <Link href="/create" className="nav-btn">
          Test a call
        </Link>
      )}
    </nav>
  );
}
