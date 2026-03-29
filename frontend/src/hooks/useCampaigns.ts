'use client';

import { useState, useEffect, useCallback } from 'react';
import { Campaign } from '@/types/database';
import { apiClient, ApiError } from '@/lib/api/client';
import { useBusiness } from '@/contexts/BusinessContext';

export type CampaignFormData = {
  name: string;
  template_id: string;
  segment_tags: string[];
  scheduled_at: string | null;
};

export function useCampaigns() {
  const { businessId } = useBusiness();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    if (!businessId) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Campaign[]>('/campaigns', {
        params: { business_id: businessId },
      });
      setCampaigns(response || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Error al cargar campañas');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (campaignData: CampaignFormData) => {
    if (!businessId) throw new Error('No business selected');

    const response = await apiClient.post<Campaign>('/campaigns', {
      ...campaignData,
      business_id: businessId,
    });
    setCampaigns(prev => [response, ...prev]);
    return response;
  };

  const sendCampaign = async (id: string) => {
    const response = await apiClient.post<Campaign>(`/campaigns/${id}/send`);
    setCampaigns(prev => prev.map(c => c.id === id ? response : c));
    return response;
  };

  const deleteCampaign = async (id: string) => {
    await apiClient.delete(`/campaigns/${id}`);
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    draft: campaigns.filter(c => c.status === 'draft').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
  };

  return {
    campaigns,
    loading,
    error,
    addCampaign,
    sendCampaign,
    deleteCampaign,
    stats,
    refetch: fetchCampaigns,
  };
}
