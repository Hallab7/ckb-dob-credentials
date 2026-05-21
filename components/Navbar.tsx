"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "./ConnectButton";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/issue", label: "Issue" },
  { href: "/wallet", label: "My Wallet" },
  { href: "/verify", label: "Verify" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-[color:var(--bg)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border-strong)]">
            <span className="text-xs font-semibold text-main">C</span>
          </div>
          <span className="text-sm font-semibold tracking-[-0.02em] text-main">CredSpore</span>
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`text-sm font-medium ${
                pathname === l.href
                  ? "text-main"
                  : "text-muted hover:text-main"
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
