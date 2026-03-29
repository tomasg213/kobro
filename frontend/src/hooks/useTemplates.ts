'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageTemplate } from '@/types/database';
import { apiClient, ApiError } from '@/lib/api/client';
import { useBusiness } from '@/contexts/BusinessContext';

export type TemplateFormData = {
  name: string;
  content: string;
  template_type: 'promotional' | 'reminder' | 'confirmation';
  is_active: boolean;
};

export function useTemplates() {
  const { businessId } = useBusiness();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!businessId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<MessageTemplate[]>('/campaigns/templates', {
        params: { business_id: businessId },
      });
      setTemplates(response || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar plantillas');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = async (templateData: TemplateFormData) => {
    if (!businessId) throw new Error('No business selected');

    const response = await apiClient.post<MessageTemplate>('/campaigns/templates', {
      ...templateData,
      business_id: businessId,
    });
    setTemplates(prev => [response, ...prev]);
    return response;
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    const response = await apiClient.patch<MessageTemplate>(`/campaigns/templates/${id}`, updates);
    setTemplates(prev => prev.map(t => t.id === id ? response : t));
    return response;
  };

  const deleteTemplate = async (id: string) => {
    await apiClient.delete(`/campaigns/templates/${id}`);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return {
    templates,
    loading,
    error,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
