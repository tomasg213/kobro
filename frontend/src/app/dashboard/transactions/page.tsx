"use client";

import { useState } from "react";
import Link from "next/link";
import { Transaction } from "@/types/database";
import { useTransactions } from "@/hooks/useTransactions";
import { useClients } from "@/hooks/useClients";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Header } from "@/components/dashboard/Header";
import { Search, Filter, Receipt, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function TransactionsPage() {
  const { transactions, loading, stats } = useTransactions();
  const { clients } = useClients();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || "Cliente no encontrado";
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      getClientName(transaction.client_id).toLowerCase().includes(search.toLowerCase()) ||
      transaction.reference_code?.toLowerCase().includes(search.toLowerCase()) ||
      transaction.amount.toString().includes(search);
    
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div>
        <Header title="Transacciones" subtitle="Gestión de pagos" />
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
      <Header 
        title="Transacciones" 
        subtitle={`${stats.total} transacciones registradas`} 
      />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total"
            value={stats.total}
            icon={Receipt}
          />
          <StatsCard
            title="Pendientes"
            value={stats.pending}
            icon={Clock}
          />
          <StatsCard
            title="Por Aprobar"
            value={stats.awaiting_approval}
            icon={AlertCircle}
          />
          <StatsCard
            title="Aprobadas"
            value={stats.approved}
            icon={CheckCircle}
          />
          <StatsCard
            title="Rechazadas"
            value={stats.rejected}
            icon={XCircle}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, referencia o monto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="awaiting_approval">Por Aprobar</SelectItem>
              <SelectItem value="approved">Aprobadas</SelectItem>
              <SelectItem value="rejected">Rechazadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron transacciones
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/dashboard/clients/${transaction.client_id}`}
                        className="hover:underline hover:text-primary"
                      >
                        {getClientName(transaction.client_id)}
                      </Link>
                    </TableCell>
                    <TableCell className={transaction.amount > 0 ? "font-medium" : ""}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.due_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.reference_code || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status === "pending" && "Pendiente"}
                        {transaction.status === "awaiting_approval" && "Por Aprobar"}
                        {transaction.status === "approved" && "Aprobado"}
                        {transaction.status === "rejected" && "Rechazado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {transaction.status === "awaiting_approval" && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href="/dashboard/transactions/pending">
                            Revisar
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
