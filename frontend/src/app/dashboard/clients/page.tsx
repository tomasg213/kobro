"use client";

import { useClients } from "@/hooks/useClients";
import { ClientTable } from "@/components/clients/ClientTable";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, DollarSign, UserCheck, UserX } from "lucide-react";

export default function ClientsPage() {
  const { clients, loading, addClient, updateClient, deleteClient, stats } = useClients();

  if (loading) {
    return (
      <div>
        <Header title="Clientes" subtitle="Gestión de clientes" />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Clientes" subtitle={`${stats.total} clientes registrados`} />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clientes"
            value={stats.total}
            icon={Users}
          />
          <StatsCard
            title="Deuda Total"
            value={`$${stats.totalDebt.toLocaleString()}`}
            icon={DollarSign}
          />
          <StatsCard
            title="Clientes Activos"
            value={stats.active}
            icon={UserCheck}
          />
          <StatsCard
            title="Clientes Inactivos"
            value={stats.total - stats.active}
            icon={UserX}
          />
        </div>

        <ClientTable
          clients={clients}
          onAdd={addClient}
          onUpdate={updateClient}
          onDelete={deleteClient}
        />
      </div>
    </div>
  );
}
