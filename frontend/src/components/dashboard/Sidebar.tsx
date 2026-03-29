"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Receipt,
  Send,
  Settings,
  LogOut,
} from "lucide-react";
import { BusinessSelector } from "./BusinessSelector";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Transacciones", href: "/dashboard/transactions", icon: Receipt },
  { name: "Campañas", href: "/dashboard/campaigns", icon: Send },
  { name: "Configuración", href: "/dashboard/settings/templates", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col" style={{ backgroundColor: '#0d261a' }}>
      <div className="flex h-16 items-center border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Kobro" className="h-8 w-8" />
          <h1 className="text-xl font-bold text-white">Kobro</h1>
        </div>
      </div>

      <div className="group px-3 py-3">
        <BusinessSelector />
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#a8d5a8]/20 text-[#a8d5a8]"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
