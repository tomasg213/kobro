"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Bell, Clock } from "lucide-react";

const mockReminders = [
  { 
    id: "r1", 
    name: "Recordatorio 3 días antes", 
    days_before_due: 3, 
    template_id: "t2",
    template_name: "Recordatorio de Pago",
    is_active: true 
  },
  { 
    id: "r2", 
    name: "Recordatorio 1 día antes", 
    days_before_due: 1, 
    template_id: "t2",
    template_name: "Recordatorio de Pago",
    is_active: true 
  },
  { 
    id: "r3", 
    name: "Aviso día del vencimiento", 
    days_before_due: 0, 
    template_id: "t2",
    template_name: "Recordatorio de Pago",
    is_active: false 
  },
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState(mockReminders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<typeof reminders[0] | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    days_before_due: 3,
    is_active: true,
  });

  const openDialog = (reminder?: typeof reminders[0]) => {
    if (reminder) {
      setEditingReminder(reminder);
      setFormData({
        name: reminder.name,
        days_before_due: reminder.days_before_due,
        is_active: reminder.is_active,
      });
    } else {
      setEditingReminder(null);
      setFormData({
        name: "",
        days_before_due: 3,
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingReminder) {
      setReminders(prev => prev.map(r => 
        r.id === editingReminder.id 
          ? { ...r, ...formData }
          : r
      ));
    } else {
      setReminders(prev => [...prev, {
        id: crypto.randomUUID(),
        ...formData,
        template_id: "t2",
        template_name: "Recordatorio de Pago",
      }]);
    }
    setDialogOpen(false);
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const getDaysLabel = (days: number) => {
    if (days === 0) return "El día del vencimiento";
    if (days === 1) return "1 día antes";
    return `${days} días antes`;
  };

  return (
    <div>
      <Header title="Recordatorios" subtitle="Configurar recordatorios automáticos" />
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground">
              Los recordatorios se envían automáticamente según la configuración.
            </p>
          </div>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Recordatorio
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder) => (
            <Card key={reminder.id} className={!reminder.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {reminder.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(reminder)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Badge variant={reminder.is_active ? "default" : "outline"}>
                  {reminder.is_active ? "Activo" : "Inactivo"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{getDaysLabel(reminder.days_before_due)}</span>
                </div>
                <div className="p-3 rounded-lg bg-accent">
                  <p className="text-xs text-muted-foreground mb-1">Plantilla:</p>
                  <p className="text-sm font-medium">{reminder.template_name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReminder ? "Editar Recordatorio" : "Nuevo Recordatorio"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Recordatorio 3 días antes"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enviar</label>
                <select
                  value={formData.days_before_due}
                  onChange={(e) => setFormData({ ...formData, days_before_due: Number(e.target.value) })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value={0}>El día del vencimiento</option>
                  <option value={1}>1 día antes</option>
                  <option value={2}>2 días antes</option>
                  <option value={3}>3 días antes</option>
                  <option value={5}>5 días antes</option>
                  <option value={7}>7 días antes</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm">Recordatorio activo</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!formData.name}>
                {editingReminder ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
