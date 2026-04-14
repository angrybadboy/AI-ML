"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserProfile from "@/components/auth/UserProfile";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = session
    ? [
        { href: "/dashboard", label: "대시보드" },
        { href: "/demo", label: "AI 체험" },
        { href: "/products", label: "상품" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight text-gray-900"
          >
            NeuroLab
          </Link>

          {navLinks.length > 0 && (
            <nav className="hidden items-center gap-1 sm:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    pathname === link.href || pathname.startsWith(link.href + "/")
                      ? "bg-gray-100 font-medium text-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <UserProfile />
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              시작하기
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
