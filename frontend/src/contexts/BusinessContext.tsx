'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

interface BusinessContextType {
  businessId: string | null;
  businessName: string | null;
  setBusinessName: (name: string) => void;
  isLoading: boolean;
  isConfigured: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const STORAGE_KEY_BUSINESS_NAME = 'kobro_business_name';

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeBusiness = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setBusinessId(user.id);
          
          const storedName = localStorage.getItem(STORAGE_KEY_BUSINESS_NAME);
          if (storedName) {
            setBusinessNameState(storedName);
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .single();
            
            if (profile?.full_name) {
              setBusinessNameState(profile.full_name);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing business:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeBusiness();

    const { data: { subscription } } = createClient().auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setBusinessId(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setBusinessId(null);
        setBusinessNameState(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const setBusinessName = (name: string) => {
    localStorage.setItem(STORAGE_KEY_BUSINESS_NAME, name);
    setBusinessNameState(name);
  };

  return (
    <BusinessContext.Provider value={{ 
      businessId, 
      businessName, 
      setBusinessName, 
      isLoading,
      isConfigured: !!businessId 
    }}>
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
