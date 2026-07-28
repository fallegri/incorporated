"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  user: { name?: string; role: string; organizationId?: string };
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string;
}

interface NavGroup {
  title?: string;
  roles: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    roles: "all",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊", roles: "all" },
    ],
  },
  {
    title: "MI GESTION",
    roles: "all",
    items: [
      { href: "/objetivos", label: "Objetivos y Metas", icon: "🎯", roles: "all" },
      { href: "/actividades", label: "Mis Actividades", icon: "✅", roles: "all" },
      { href: "/kpis", label: "Mis KPIs", icon: "📈", roles: "all" },
      { href: "/timeline", label: "Linea de Tiempo", icon: "📅", roles: "all" },
      { href: "/cargo", label: "Checklist Onboarding", icon: "📋", roles: "all" },
    ],
  },
  {
    title: "DOCUMENTOS",
    roles: "all",
    items: [
      { href: "/documentos", label: "Biblioteca de Documentos", icon: "📄", roles: "all" },
      { href: "/glosario", label: "Glosario Institucional", icon: "📖", roles: "all" },
      { href: "/faq", label: "Preguntas Frecuentes", icon: "❓", roles: "all" },
      { href: "/construir", label: "Construir Lineamientos", icon: "🏗️", roles: "all" },
      { href: "/asistente", label: "Asistente IA", icon: "💬", roles: "all" },
    ],
  },
  {
    title: "ORGANIZACION",
    roles: "ADMIN,SUPER_ADMIN,DIRECTOR,JEFE_AREA",
    items: [
      { href: "/admin", label: "Equipo y Avance", icon: "👥", roles: "ADMIN,SUPER_ADMIN,DIRECTOR,JEFE_AREA" },
      { href: "/admin/estructura", label: "Estructura", icon: "🏢", roles: "ADMIN,SUPER_ADMIN,DIRECTOR" },
      { href: "/reportes", label: "Reportes", icon: "📑", roles: "ADMIN,SUPER_ADMIN,DIRECTOR,JEFE_AREA" },
    ],
  },
  {
    title: "SISTEMA",
    roles: "all",
    items: [
      { href: "/admin/configuracion", label: "Configuracion IA", icon: "⚙️", roles: "all" },
      { href: "/notificaciones", label: "Notificaciones", icon: "🔔", roles: "all" },
    ],
  },
];

function isGroupVisible(group: NavGroup, userRole: string): boolean {
  return group.roles === "all" || group.roles.split(",").includes(userRole);
}

function isItemVisible(item: NavItem, userRole: string): boolean {
  return item.roles === "all" || item.roles.split(",").includes(userRole);
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Incorporated</h1>
        <p className="text-xs text-gray-500 mt-1">Alineamiento Estrategico</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
        {navGroups.map((group, groupIdx) => {
          if (!isGroupVisible(group, user.role)) return null;

          const visibleItems = group.items.filter((item) =>
            isItemVisible(item, user.role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIdx}>
              {group.title && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  // Exact match for parent routes that have child routes
                  // to prevent both parent and child from highlighting
                  const hasChildRoutes = visibleItems.some(
                    (other) => other.href !== item.href && other.href.startsWith(item.href + "/")
                  ) || navGroups.some((g) =>
                    g.items.some((other) => other.href !== item.href && other.href.startsWith(item.href + "/"))
                  );
                  const isActive = hasChildRoutes
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-3 border-blue-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
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
