"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          setState({
            user: {
              id: user.id,
              email: user.email || '',
              full_name: profile?.full_name || null,
              role: profile?.role || 'user',
            },
            loading: false,
            isAuthenticated: true,
          });
        } else {
          setState({
            user: null,
            loading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setState({
          user: null,
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      setState({
        user: {
          id: data.user.id,
          email: data.user.email || '',
          full_name: profile?.full_name || null,
          role: profile?.role || 'user',
        },
        loading: false,
        isAuthenticated: true,
      });
    }
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setState({
      user: null,
      loading: false,
      isAuthenticated: false,
    });
  };

  const register = async (email: string, password: string, fullName: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  return {
    ...state,
    login,
    logout,
    register,
  };
}
