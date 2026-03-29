"use client";

import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import { useTransactions } from "@/hooks/useTransactions";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { Users, Receipt, Send, AlertCircle, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { clients, stats: clientStats, loading: clientsLoading } = useClients();
  const { transactions, stats: transactionStats, loading: transactionsLoading } = useTransactions();

  const loading = clientsLoading || transactionsLoading;

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Resumen de tu actividad" />
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
      <Header title="Dashboard" subtitle="Resumen de tu actividad" />
      
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clientes"
            value={clientStats.total}
            subtitle={`${clientStats.active} activos`}
            icon={Users}
          />
          
          <StatsCard
            title="Pagos Pendientes"
            value={transactionStats.pending + transactionStats.awaiting_approval}
            subtitle={`${formatCurrency(transactionStats.totalAmount)} total`}
            icon={Receipt}
          />
          
          <StatsCard
            title="Por Aprobar"
            value={transactionStats.awaiting_approval}
            subtitle="Comprobantes"
            icon={AlertCircle}
          />
          
          <StatsCard
            title="Total Transacciones"
            value={transactionStats.total}
            subtitle={`${transactionStats.approved} aprobadas`}
            icon={Send}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Últimas Transacciones</CardTitle>
              <Link 
                href="/dashboard/transactions"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay transacciones registradas
                </p>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const client = clients.find(c => c.id === transaction.client_id);
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div>
                          <p className="font-medium">{client?.name || "Cliente"}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status === "pending" && "Pendiente"}
                            {transaction.status === "awaiting_approval" && "Por aprobar"}
                            {transaction.status === "approved" && "Aprobado"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link 
                href="/dashboard/clients"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">Gestionar Clientes</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              
              <Link 
                href="/dashboard/transactions/pending"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span className="font-medium">Revisar Comprobantes</span>
                </div>
                <div className="flex items-center gap-2">
                  {transactionStats.awaiting_approval > 0 && (
                    <Badge variant="warning">{transactionStats.awaiting_approval}</Badge>
                  )}
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
              
              <Link 
                href="/dashboard/campaigns/new"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Send className="h-5 w-5 text-info" />
                  <span className="font-medium">Nueva Campaña</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
