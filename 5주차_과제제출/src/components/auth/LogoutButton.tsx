"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md px-2.5 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
    >
      로그아웃
    </button>
  );
}
