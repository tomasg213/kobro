"use client";

import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/contexts/BusinessContext";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();
  const { businessName } = useBusiness();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-[#0d261a] px-6">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-white/50">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-white/10 transition-colors">
          <Bell className="h-5 w-5 text-white/50" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#a8d5a8]" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{businessName || user?.full_name || 'Usuario'}</p>
            <p className="text-xs text-white/50">{user?.email}</p>
          </div>
          <div 
            className="h-9 w-9 rounded-full bg-[#a8d5a8] flex items-center justify-center text-sm font-bold text-[#0d261a]"
            title={user?.full_name || user?.email || 'Usuario'}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
