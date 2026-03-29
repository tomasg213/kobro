'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BusinessContextType {
  businessId: string | null;
  setBusinessId: (id: string | null) => void;
  isLoading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY = 'kobro_business_id';

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businessId, setBusinessIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setBusinessIdState(stored);
    }
    setIsLoading(false);
  }, []);

  const setBusinessId = (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setBusinessIdState(id);
  };

  return (
    <BusinessContext.Provider value={{ businessId, setBusinessId, isLoading }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
