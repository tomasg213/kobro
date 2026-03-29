import { useState, useEffect } from 'react';
import { Transaction } from '@/types/database';

const mockTransactions: Transaction[] = [
  {
    id: "t1",
    client_id: "1",
    amount: 5000,
    due_date: "2024-04-15",
    reference_code: "REF-2024-001",
    proof_image_url: null,
    ocr_result: null,
    status: "pending",
    approved_by: null,
    approved_at: null,
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
  },
  {
    id: "t2",
    client_id: "2",
    amount: 3000,
    due_date: "2024-04-10",
    reference_code: "REF-2024-002",
    proof_image_url: "https://example.com/proof1.jpg",
    ocr_result: { raw_code: "12345678" },
    status: "awaiting_approval",
    approved_by: null,
    approved_at: null,
    created_at: "2024-03-21T14:30:00Z",
    updated_at: "2024-03-22T09:00:00Z",
  },
  {
    id: "t3",
    client_id: "3",
    amount: 10000,
    due_date: "2024-03-01",
    reference_code: "REF-2024-003",
    proof_image_url: null,
    ocr_result: null,
    status: "pending",
    approved_by: null,
    approved_at: null,
    created_at: "2024-02-15T11:00:00Z",
    updated_at: "2024-02-15T11:00:00Z",
  },
  {
    id: "t4",
    client_id: "1",
    amount: 8000,
    due_date: "2024-02-28",
    reference_code: "REF-2024-004",
    proof_image_url: "https://example.com/proof2.jpg",
    ocr_result: { raw_code: "87654321" },
    status: "approved",
    approved_by: "admin1",
    approved_at: "2024-03-01T16:00:00Z",
    created_at: "2024-02-10T09:00:00Z",
    updated_at: "2024-03-01T16:00:00Z",
  },
  {
    id: "t5",
    client_id: "4",
    amount: 2000,
    due_date: "2024-03-15",
    reference_code: "REF-2024-005",
    proof_image_url: "https://example.com/proof3.jpg",
    ocr_result: { raw_code: "11223344" },
    status: "rejected",
    approved_by: "admin1",
    approved_at: "2024-03-16T10:30:00Z",
    created_at: "2024-03-14T08:00:00Z",
    updated_at: "2024-03-16T10:30:00Z",
  },
];

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setTransactions(mockTransactions);
        setError(null);
      } catch (err) {
        setError('Error al cargar transacciones');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id 
        ? { ...t, ...updates, updated_at: new Date().toISOString() }
        : t
    ));
  };

  const approveTransaction = async (id: string, approved: boolean) => {
    setTransactions(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            status: approved ? 'approved' : 'rejected',
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : t
    ));
  };

  const stats = {
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    awaiting_approval: transactions.filter(t => t.status === 'awaiting_approval').length,
    approved: transactions.filter(t => t.status === 'approved').length,
    rejected: transactions.filter(t => t.status === 'rejected').length,
    totalAmount: transactions
      .filter(t => t.status === 'pending' || t.status === 'awaiting_approval')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    approveTransaction,
    stats,
  };
}
