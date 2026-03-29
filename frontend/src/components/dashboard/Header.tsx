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
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{businessName || user?.full_name || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div 
            className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground"
            title={user?.full_name || user?.email || 'Usuario'}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
