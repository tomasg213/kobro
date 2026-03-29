'use client';

import { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { Building2, Check, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BusinessSelector() {
  const { businessName, setBusinessName, isConfigured, isLoading } = useBusiness();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = () => {
    setEditValue(businessName || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      setBusinessName(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-4 w-4 animate-pulse rounded bg-white/20" />
        <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="mx-3 rounded-lg bg-white/10 px-3 py-2">
        <p className="text-xs text-white/60">
          Inicia sesión para continuar
        </p>
      </div>
    );
  }

  return (
    <div className="mx-3 rounded-lg bg-white/10 px-3 py-2">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-white/60" />
        
        {isEditing ? (
          <div className="flex flex-1 items-center gap-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Nombre de tu negocio"
              className="flex-1 bg-white/10 text-sm text-white outline-none placeholder:text-white/40 rounded px-2 py-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <button
              onClick={handleSave}
              className="rounded p-1 hover:bg-white/10"
            >
              <Check className="h-3 w-3 text-green-400" />
            </button>
            <button
              onClick={handleCancel}
              className="rounded p-1 hover:bg-white/10"
            >
              <X className="h-3 w-3 text-red-400" />
            </button>
          </div>
        ) : (
          <>
            <span className={cn(
              "flex-1 text-sm truncate",
              businessName ? "text-white" : "text-white/40"
            )}>
              {businessName || "Configura tu negocio"}
            </span>
            <button
              onClick={handleStartEdit}
              className="rounded p-1 opacity-0 transition-opacity hover:bg-white/10 group-hover:opacity-100"
            >
              <Edit2 className="h-3 w-3 text-white/60" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
