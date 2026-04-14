"use client";

import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 animate-pulse rounded-full bg-gray-200" />
        <div className="hidden h-3.5 w-16 animate-pulse rounded bg-gray-200 sm:block" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-2.5">
      {session.user.image ? (
        <img
          src={session.user.image}
          alt=""
          className="h-7 w-7 rounded-full"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
          {session.user.name?.charAt(0) ?? "?"}
        </div>
      )}
      <span className="hidden text-sm text-gray-700 sm:block">
        {session.user.name?.split(" ")[0]}
      </span>
      <LogoutButton />
    </div>
  );
}
