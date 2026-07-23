"use client";

import { signOut } from "next-auth/react";
import { ThemeSelector } from "./theme-selector";

interface HeaderProps {
  user: { name?: string; email?: string };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">
          Bienvenido, <span className="font-medium text-gray-900">{user.name}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
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
