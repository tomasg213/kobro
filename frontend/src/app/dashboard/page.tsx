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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a8d5a8]" />
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
          <Card className="lg:col-span-2" style={{ backgroundColor: '#0d261a', borderColor: 'rgba(255,255,255,0.1)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-white">Últimas Transacciones</CardTitle>
              <Link 
                href="/dashboard/transactions"
                className="text-sm text-[#a8d5a8] hover:underline flex items-center gap-1 font-medium"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/50">No hay transacciones registradas</p>
                  <Link 
                    href="/dashboard/transactions"
                    className="text-sm text-[#a8d5a8] hover:underline mt-2 inline-block"
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
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#a8d5a8]/20 flex items-center justify-center">
                            <Users className="h-5 w-5 text-[#a8d5a8]" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-white">{client?.name || "Cliente"}</p>
                            <p className="text-xs text-white/40">
                              {formatDate(transaction.due_date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-white">{formatCurrency(transaction.amount)}</p>
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
          <Card style={{ backgroundColor: '#0d261a', borderColor: 'rgba(255,255,255,0.1)' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-white">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                href="/dashboard/clients"
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#a8d5a8]/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-[#a8d5a8]" />
                  </div>
                  <span className="font-medium text-white">Clientes</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/dashboard/transactions/pending"
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <span className="font-medium text-white">Comprobantes</span>
                    {transactionStats.awaiting_approval > 0 && (
                      <Badge variant="warning" className="ml-2 text-xs">
                        {transactionStats.awaiting_approval}
                      </Badge>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/dashboard/campaigns/new"
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Send className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="font-medium text-white">Nueva Campaña</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/dashboard/settings/templates"
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white/70" />
                  </div>
                  <span className="font-medium text-white">Plantillas</span>
                </div>
                <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Overview */}
        {campaigns.length > 0 && (
          <Card style={{ backgroundColor: '#0d261a', borderColor: 'rgba(255,255,255,0.1)' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-white">Campañas Recientes</CardTitle>
              <Link 
                href="/dashboard/campaigns"
                className="text-sm text-[#a8d5a8] hover:underline flex items-center gap-1 font-medium"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {campaigns.slice(0, 3).map((campaign) => (
                  <div 
                    key={campaign.id}
                    className="p-4 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-white">{campaign.name}</p>
                      <Badge 
                        variant={campaign.status === 'sent' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {campaign.status === 'sent' && 'Enviada'}
                        {campaign.status === 'draft' && 'Borrador'}
                        {campaign.status === 'scheduled' && 'Programada'}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/50">
                      {campaign.sent_count} mensajes enviados
                    </p>
                    {campaign.scheduled_at && (
                      <p className="text-xs text-white/40 mt-1">
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
