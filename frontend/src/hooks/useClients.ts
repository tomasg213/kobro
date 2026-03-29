import { useState, useEffect } from 'react';
import { Client } from '@/types/database';

const mockClients: Client[] = [
  {
    id: "1",
    business_id: "b1",
    name: "Juan Pérez",
    phone: "+5491112345678",
    email: "juan.perez@email.com",
    debt_amount: 15000,
    notes: "Cliente VIP, siempre paga a tiempo",
    tags: ["VIP", "Cliente Frecuente"],
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-03-20T14:30:00Z",
  },
  {
    id: "2",
    business_id: "b1",
    name: "María García",
    phone: "+5491198765432",
    email: "maria.garcia@email.com",
    debt_amount: 8500,
    notes: "Nuevo cliente",
    tags: ["Nuevo"],
    is_active: true,
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z",
  },
  {
    id: "3",
    business_id: "b1",
    name: "Carlos Rodríguez",
    phone: "+5491155566677",
    email: "carlos.rodriguez@email.com",
    debt_amount: 25000,
    notes: "Pago pendiente desde hace 30 días",
    tags: ["Moroso"],
    is_active: true,
    created_at: "2023-11-10T11:00:00Z",
    updated_at: "2024-03-15T16:45:00Z",
  },
  {
    id: "4",
    business_id: "b1",
    name: "Ana Martínez",
    phone: "+5491133344455",
    email: "ana.martinez@email.com",
    debt_amount: 0,
    notes: "Sin deudas actuales",
    tags: ["Bueno"],
    is_active: true,
    created_at: "2023-06-20T08:30:00Z",
    updated_at: "2024-03-25T10:00:00Z",
  },
  {
    id: "5",
    business_id: "b1",
    name: "Pedro Sánchez",
    phone: "+5491177788899",
    email: "pedro.sanchez@email.com",
    debt_amount: 5000,
    notes: "Pago próximo vencimiento",
    tags: ["Regular"],
    is_active: false,
    created_at: "2023-09-05T14:00:00Z",
    updated_at: "2024-01-10T09:30:00Z",
  },
];

export type ClientFormData = {
  name: string;
  phone: string;
  email: string | null;
  debt_amount: number;
  notes: string | null;
  tags: string[];
  is_active: boolean;
  business_id?: string;
};

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setClients(mockClients);
        setError(null);
      } catch (err) {
        setError('Error al cargar clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const addClient = async (clientData: ClientFormData) => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      business_id: clientData.business_id || "b1",
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email,
      debt_amount: clientData.debt_amount,
      notes: clientData.notes,
      tags: clientData.tags,
      is_active: clientData.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => 
      c.id === id 
        ? { ...c, ...updates, updated_at: new Date().toISOString() }
        : c
    ));
  };

  const deleteClient = async (id: string) => {
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
  };
}
