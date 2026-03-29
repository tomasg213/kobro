'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionStatus } from '@/types/database';
import { apiClient, ApiError } from '@/lib/api/client';
import { useBusiness } from '@/contexts/BusinessContext';

export function useTransactions() {
  const { businessId } = useBusiness();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!businessId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Transaction[]>('/transactions', {
        params: { business_id: businessId },
      });
      setTransactions(response || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar transacciones');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (
    transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'status'>
  ) => {
    if (!businessId) throw new Error('No business selected');

    const response = await apiClient.post<Transaction>('/transactions', {
      ...transaction,
      business_id: businessId,
    });
    setTransactions(prev => [response, ...prev]);
    return response;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const response = await apiClient.patch<Transaction>(`/transactions/${id}`, updates);
    setTransactions(prev => prev.map(t => t.id === id ? response : t));
    return response;
  };

  const approveTransaction = async (id: string, approved: boolean) => {
    const response = await apiClient.post<Transaction>(`/transactions/${id}/${approved ? 'approve' : 'reject'}`);
    setTransactions(prev => prev.map(t => t.id === id ? response : t));
    return response;
  };

  const pendingTransactions = transactions.filter(
    t => t.status === 'pending' || t.status === 'awaiting_approval'
  );

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    awaiting_approval: transactions.filter(t => t.status === 'awaiting_approval').length,
    approved: transactions.filter(t => t.status === 'approved').length,
    rejected: transactions.filter(t => t.status === 'rejected').length,
    totalAmount: pendingTransactions.reduce((sum, t) => sum + t.amount, 0),
  };

  return {
    transactions,
    pendingTransactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    approveTransaction,
    stats,
    refetch: fetchTransactions,
  };
}
