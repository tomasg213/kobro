import { useState, useEffect } from 'react';
import { MessageTemplate } from '@/types/database';

const mockTemplates: MessageTemplate[] = [
  {
    id: "t1",
    business_id: "b1",
    name: "Saludo",
    content: "¡Hola {{client_name}}! Gracias por comunicarte.",
    template_type: "promotional",
    is_active: true,
    created_at: "2024-01-10T10:00:00Z",
  },
  {
    id: "t2",
    business_id: "b1",
    name: "Recordatorio de Pago",
    content: "¡Hola {{client_name}}! Te recordamos que tienes un pago pendiente de ${{amount}} con vencimiento el {{due_date}}.",
    template_type: "reminder",
    is_active: true,
    created_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "t3",
    business_id: "b1",
    name: "Confirmación de Pago",
    content: "¡Hola {{client_name}}! Tu pago ha sido confirmado. Gracias por tu preferencia.",
    template_type: "confirmation",
    is_active: true,
    created_at: "2024-01-20T10:00:00Z",
  },
];

export type TemplateFormData = {
  name: string;
  content: string;
  template_type: "promotional" | "reminder" | "confirmation";
  is_active: boolean;
  business_id?: string;
};

export function useTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setTemplates(mockTemplates);
      setLoading(false);
    };
    fetchTemplates();
  }, []);

  const addTemplate = async (templateData: TemplateFormData) => {
    const newTemplate: MessageTemplate = {
      id: crypto.randomUUID(),
      business_id: templateData.business_id || "b1",
      name: templateData.name,
      content: templateData.content,
      template_type: templateData.template_type,
      is_active: templateData.is_active,
      created_at: new Date().toISOString(),
    };
    setTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTemplate = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return {
    templates,
    loading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
