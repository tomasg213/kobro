"use client";

import { useState } from "react";
import Link from "next/link";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatDate } from "@/lib/utils";
import { Send, Plus, Clock, FileText, SendHorizontal, Trash2 } from "lucide-react";

export default function CampaignsPage() {
  const { campaigns, loading, sendCampaign, deleteCampaign, stats } = useCampaigns();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    setSendingId(id);
    await sendCampaign(id);
    setSendingId(null);
  };

  if (loading) {
    return (
      <div>
        <Header title="Campañas" subtitle="Gestión de campañas" />
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
        title="Campañas" 
        subtitle={`${stats.total} campañas creadas`} 
      />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="grid gap-4 md:grid-cols-4 flex-1">
            <StatsCard
              title="Total"
              value={stats.total}
              icon={FileText}
            />
            <StatsCard
              title="Enviadas"
              value={stats.sent}
              icon={Send}
            />
            <StatsCard
              title="Programadas"
              value={stats.scheduled}
              icon={Clock}
            />
            <StatsCard
              title="Borradores"
              value={stats.draft}
              icon={FileText}
            />
          </div>
          <Button asChild className="ml-4 gap-2">
            <Link href="/dashboard/campaigns/new">
              <Plus className="h-4 w-4" />
              Nueva Campaña
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-1">
                    {campaign.name}
                  </CardTitle>
                  <Badge className={
                    campaign.status === "sent" ? "bg-success/20 text-success" :
                    campaign.status === "scheduled" ? "bg-info/20 text-info" :
                    "bg-muted text-muted-foreground"
                  }>
                    {campaign.status === "sent" && "Enviada"}
                    {campaign.status === "scheduled" && "Programada"}
                    {campaign.status === "draft" && "Borrador"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>Creada: {formatDate(campaign.created_at)}</p>
                  {campaign.scheduled_at && (
                    <p>Programada: {formatDate(campaign.scheduled_at)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: campaign.sent_count > 0 ? "100%" : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {campaign.sent_count} mensajes
                  </span>
                </div>

                {campaign.segment_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {campaign.segment_tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {campaign.status !== "sent" && (
                    <Button 
                      className="flex-1 gap-1" 
                      size="sm"
                      onClick={() => handleSend(campaign.id)}
                      disabled={sendingId === campaign.id}
                    >
                      <SendHorizontal className="h-4 w-4" />
                      {sendingId === campaign.id ? "Enviando..." : "Enviar Ahora"}
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteCampaign(campaign.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 h-full">
              <Link 
                href="/dashboard/campaigns/new"
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus className="h-8 w-8" />
                <span>Crear nueva campaña</span>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
