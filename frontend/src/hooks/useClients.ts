'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/types/database';
import { apiClient, ApiError } from '@/lib/api/client';
import { useBusiness } from '@/contexts/BusinessContext';

export type ClientFormData = {
  name: string;
  phone: string;
  email: string | null;
  debt_amount: number;
  notes: string | null;
  tags: string[];
  is_active: boolean;
};

export function useClients() {
  const { businessId } = useBusiness();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    if (!businessId) {
      setClients([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Client[]>('/clients', {
        params: { business_id: businessId },
      });
      setClients(response || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar clientes');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = async (clientData: ClientFormData) => {
    if (!businessId) throw new Error('No business selected');

    const response = await apiClient.post<Client>('/clients', {
      ...clientData,
      business_id: businessId,
    });
    setClients(prev => [response, ...prev]);
    return response;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const response = await apiClient.patch<Client>(`/clients/${id}`, updates);
    setClients(prev => prev.map(c => c.id === id ? response : c));
    return response;
  };

  const deleteClient = async (id: string) => {
    await apiClient.delete(`/clients/${id}`);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const getClient = (id: string) => {
    return clients.find(c => c.id === id) || null;
  };

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.is_active).length,
    totalDebt: clients.reduce((sum, c) => sum + c.debt_amount, 0),
    byTag: clients.reduce((acc, c) => {
      c.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    clients,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    stats,
    refetch: fetchClients,
  };
}
