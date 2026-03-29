"use client";

import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import { useTransactions } from "@/hooks/useTransactions";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Header } from "@/components/dashboard/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils";
import { useBusiness } from "@/contexts/BusinessContext";
import { Users, Receipt, Send, AlertCircle, ArrowRight, TrendingUp, MessageSquare } from "lucide-react";

export default function DashboardPage() {
  const { businessName } = useBusiness();
  const { clients, stats: clientStats, loading: clientsLoading } = useClients();
  const { transactions, stats: transactionStats, loading: transactionsLoading } = useTransactions();
  const { campaigns, stats: campaignStats, loading: campaignsLoading } = useCampaigns();

  const loading = clientsLoading || transactionsLoading || campaignsLoading;
  const recentTransactions = transactions.slice(0, 5);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" subtitle="Cargando..." />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title={`${greeting()}, ${businessName || 'Usuario'}`} 
        subtitle="Este es el resumen de tu actividad" 
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Clientes"
            value={clientStats.total}
            subtitle={`${clientStats.active} activos`}
            icon={Users}
            trend={{ value: 12, positive: true }}
          />
          
          <StatsCard
            title="Pagos Pendientes"
            value={transactionStats.pending + transactionStats.awaiting_approval}
            subtitle={`${formatCurrency(transactionStats.totalAmount)} total`}
            icon={Receipt}
          />
          
          <StatsCard
            title="Campañas Enviadas"
            value={campaignStats.sent}
            subtitle={`${campaignStats.total} totales`}
            icon={TrendingUp}
          />
          
          <StatsCard
            title="Por Aprobar"
            value={transactionStats.awaiting_approval}
            subtitle="Comprobantes"
            icon={AlertCircle}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Últimas Transacciones</CardTitle>
              <Link 
                href="/dashboard/transactions"
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay transacciones registradas</p>
                  <Link 
                    href="/dashboard/transactions"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Agregar primera transacción
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => {
                    const client = clients.find(c => c.id === transaction.client_id);
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{client?.name || "Cliente"}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.due_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                          <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                            {transaction.status === "pending" && "Pendiente"}
                            {transaction.status === "awaiting_approval" && "Por aprobar"}
                            {transaction.status === "approved" && "Aprobado"}
                            {transaction.status === "rejected" && "Rechazado"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                href="/dashboard/clients"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">Clientes</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/dashboard/transactions/pending"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <span className="font-medium">Comprobantes</span>
                    {transactionStats.awaiting_approval > 0 && (
                      <Badge variant="warning" className="ml-2 text-xs">
                        {transactionStats.awaiting_approval}
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/dashboard/campaigns/new"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-info/20 flex items-center justify-center">
                    <Send className="h-5 w-5 text-info" />
                  </div>
                  <span className="font-medium">Nueva Campaña</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/dashboard/settings/templates"
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-secondary-foreground" />
                  </div>
                  <span className="font-medium">Plantillas</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Overview */}
        {campaigns.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold">Campañas Recientes</CardTitle>
              <Link 
                href="/dashboard/campaigns"
                className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div 
                    key={campaign.id}
                    className="p-4 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{campaign.name}</p>
                      <Badge 
                        variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {campaign.status === 'sent' && 'Enviada'}
                        {campaign.status === 'draft' && 'Borrador'}
                        {campaign.status === 'scheduled' && 'Programada'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.sent_count} mensajes enviados
                    </p>
                    {campaign.scheduled_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(campaign.scheduled_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
