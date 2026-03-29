"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useClients } from "@/hooks/useClients";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Users, Tag } from "lucide-react";

const mockTemplates = [
  { id: "t1", name: "Promoción General", content: "¡Hola {{client_name}}! Tenemos una promoción especial para vos.", template_type: "promotional" },
  { id: "t2", name: "Recordatorio de Pago", content: "¡Hola {{client_name}}! Te recordamos que tienes un pago pendiente de ${{amount}} con vencimiento el {{due_date}}.", template_type: "reminder" },
  { id: "t3", name: "Confirmación de Pago", content: "¡Hola {{client_name}}! Tu pago ha sido confirmado. Gracias por tu preferencia.", template_type: "confirmation" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const { clients, stats } = useClients();
  const { addCampaign, sendCampaign } = useCampaigns();
  
  const [formData, setFormData] = useState({
    name: "",
    template_id: "",
    scheduled_at: "",
    segment_tags: [] as string[],
  });
  const [sending, setSending] = useState(false);

  const selectedTemplate = mockTemplates.find(t => t.id === formData.template_id);
  const allTags = Array.from(new Set(clients.flatMap(c => c.tags)));

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      segment_tags: prev.segment_tags.includes(tag)
        ? prev.segment_tags.filter(t => t !== tag)
        : [...prev.segment_tags, tag]
    }));
  };

  const getRecipientsCount = () => {
    if (formData.segment_tags.length === 0) return clients.length;
    return clients.filter(c => 
      c.tags.some(tag => formData.segment_tags.includes(tag))
    ).length;
  };

  const handleCreateAndSend = async () => {
    if (!formData.name || !formData.template_id) return;
    
    setSending(true);
    try {
      const campaign = await addCampaign({
        name: formData.name,
        template_id: formData.template_id,
        segment_tags: formData.segment_tags,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      });
      
      await sendCampaign(campaign.id);
      router.push("/dashboard/campaigns");
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Header title="Nueva Campaña" subtitle="Crear y enviar campaña" />
      
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/dashboard/campaigns">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </a>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información de la Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la campaña *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Promoción Marzo 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template">Plantilla *</Label>
                <select
                  id="template"
                  value={formData.template_id}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Seleccionar plantilla</option>
                  {mockTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled">Programar para (opcional)</Label>
                <Input
                  id="scheduled"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Segmentación
              </CardTitle>
              <CardDescription>
                Seleccioná las etiquetas para enviar a grupos específicos de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={formData.segment_tags.length === 0 ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ ...formData, segment_tags: [] })}
                >
                  Todos ({clients.length})
                </Badge>
                {allTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={formData.segment_tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag} ({stats.byTag[tag] || 0})
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {getRecipientsCount()} destinatarios
              </p>
            </CardContent>
          </Card>

          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa del Mensaje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-accent">
                  <p className="text-sm">
                    {selectedTemplate.content
                      .replace(/\{\{client_name\}\}/g, "Juan Pérez")
                      .replace(/\{\{amount\}\}/g, "5000")
                      .replace(/\{\{due_date\}\}/g, "15/04/2024")
                    }
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Este es un ejemplo. Los placeholders se reemplazarán con datos reales.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push("/dashboard/campaigns")}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={handleCreateAndSend}
              disabled={!formData.name || !formData.template_id || sending}
            >
              <Send className="h-4 w-4" />
              {sending ? "Enviando..." : `Enviar a ${getRecipientsCount()} clientes`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
