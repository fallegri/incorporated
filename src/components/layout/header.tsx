"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ThemeSelector } from "./theme-selector";

interface HeaderProps {
  user: { name?: string; email?: string };
  alertCount?: number;
}

export function Header({ user, alertCount = 0 }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">
          Bienvenido, <span className="font-medium text-gray-900">{user.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/notificaciones"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          title="Notificaciones"
        >
          <span className="text-lg">🔔</span>
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {alertCount > 9 ? "9+" : alertCount}
            </span>
          )}
        </Link>
        <ThemeSelector />
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
