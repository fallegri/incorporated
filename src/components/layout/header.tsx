"use client";

import { signOut } from "next-auth/react";

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
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
      >
        Cerrar sesión
      </button>
    </header>
  );
}
