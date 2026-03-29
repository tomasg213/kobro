"use client";

import { useState } from "react";
import { useTemplates } from "@/hooks/useTemplates";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, FileText, Mail, Bell, CheckCircle } from "lucide-react";

const templateTypeIcons = {
  promotional: Mail,
  reminder: Bell,
  confirmation: CheckCircle,
};

const templateTypeColors = {
  promotional: "bg-info/20 text-info",
  reminder: "bg-warning/20 text-warning",
  confirmation: "bg-success/20 text-success",
};

export default function TemplatesPage() {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<typeof templates[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    content: "",
    template_type: "promotional" as "promotional" | "reminder" | "confirmation",
    is_active: true,
  });

  const openDialog = (template?: typeof templates[0]) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        content: template.content,
        template_type: template.template_type,
        is_active: template.is_active,
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        name: "",
        content: "",
        template_type: "promotional",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, formData);
    } else {
      await addTemplate(formData);
    }
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <div>
        <Header title="Plantillas" subtitle="Gestión de mensajes" />
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
      <Header title="Plantillas" subtitle={`${templates.length} plantillas`} />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Plantilla
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const Icon = templateTypeIcons[template.template_type];
            
            return (
              <Card key={template.id} className={!template.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {template.name}
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Badge className={templateTypeColors[template.template_type]}>
                    {template.template_type === "promotional" && "Promocional"}
                    {template.template_type === "reminder" && "Recordatorio"}
                    {template.template_type === "confirmation" && "Confirmación"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {template.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creada: {formatDate(template.created_at)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar Plantilla" : "Nueva Plantilla"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  value={formData.template_type}
                  onChange={(e) => setFormData({ ...formData, template_type: e.target.value as typeof formData.template_type })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="promotional">Promocional</option>
                  <option value="reminder">Recordatorio</option>
                  <option value="confirmation">Confirmación</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contenido</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escribí tu mensaje. Usá {{client_name}}, {{amount}}, {{due_date}} como variables."
                  className="min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles: {"{{client_name}}"}, {"{{amount}}"}, {"{{due_date}}"}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.content}>
                {editingTemplate ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
