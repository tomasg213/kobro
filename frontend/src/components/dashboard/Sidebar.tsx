"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const { logout } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-primary">
      <div className="flex h-16 items-center border-b border-primary-foreground/10">
        <h1 className="w-full px-4 text-xl font-bold text-primary-foreground">
          Kobro
        </h1>
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
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-foreground/10 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-primary-foreground/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
