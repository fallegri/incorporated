"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: { name?: string; role: string; organizationId?: string };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", roles: "all" },
  { href: "/cargo", label: "Mi Cargo", icon: "👤", roles: "all" },
  { href: "/objetivos", label: "Objetivos", icon: "🎯", roles: "all" },
  { href: "/documentos", label: "Documentos", icon: "📄", roles: "all" },
  { href: "/construir", label: "Construir Lineamientos", icon: "🏗️", roles: "all" },
  { href: "/asistente", label: "Asistente IA", icon: "💬", roles: "all" },
  { href: "/admin", label: "Administración", icon: "⚙️", roles: "ADMIN,SUPER_ADMIN,DIRECTOR" },
  { href: "/admin/configuracion", label: "Configuración", icon: "🎨", roles: "all" },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navItems.filter(
    (item) => item.roles === "all" || item.roles.split(",").includes(user.role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Incorporated</h1>
        <p className="text-xs text-gray-500 mt-1">Alineamiento Estratégico</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-l-3 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || "Usuario"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
